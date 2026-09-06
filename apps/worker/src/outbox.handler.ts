import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxEvent, Prisma, PrismaClient } from '@prisma/client';
import { isRetryableFlectraError } from '@consulting/flectra';
import {
  leadCreatedPayloadSchema,
  OUTBOX_EVENT_LEAD_CREATED,
} from '@consulting/shared';
import { FLECTRA_PORT, FlectraPort } from './flectra/flectra.port';
import { PRISMA_CLIENT } from './prisma.token';

export type OutboxOutcome = 'synced' | 'retry_scheduled' | 'failed';

@Injectable()
export class OutboxHandler {
  private readonly logger = new Logger(OutboxHandler.name);

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    @Inject(FLECTRA_PORT) private readonly flectra: FlectraPort,
    private readonly config: ConfigService,
  ) {}

  async handle(event: OutboxEvent): Promise<OutboxOutcome> {
    if (event.type !== OUTBOX_EVENT_LEAD_CREATED) {
      await this.failNow(event, `Unknown outbox event type "${event.type}"`);
      return 'failed';
    }

    // Re-validate the payload before pushing anything to Flectra.
    const parsed = leadCreatedPayloadSchema.safeParse(event.payload);
    if (!parsed.success) {
      await this.failNow(event, `Invalid payload: ${parsed.error.message}`);
      return 'failed';
    }
    const payload = parsed.data;

    try {
      const result = await this.flectra.createLeadForContact(payload);

      await this.prisma.$transaction([
        this.prisma.lead.update({
          where: { id: payload.leadId },
          data: {
            status: 'SYNCED',
            flectraLeadId: result.flectraLeadId,
            flectraPartnerId: result.flectraPartnerId,
          },
        }),
        this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'SYNCED',
            attempts: { increment: 1 },
            lastError: null,
            processedAt: new Date(),
          },
        }),
      ]);
      this.logger.log(`Lead ${payload.leadId} synced to Flectra (${result.flectraLeadId})`);
      return 'synced';
    } catch (error) {
      return this.scheduleRetryOrFail(event, error);
    }
  }

  private async scheduleRetryOrFail(
    event: OutboxEvent,
    error: unknown,
  ): Promise<OutboxOutcome> {
    const message = error instanceof Error ? error.message : String(error);
    const attempts = event.attempts + 1;
    const maxAttempts = Number(this.config.get('MAX_ATTEMPTS') ?? 5);

    if (!isRetryableFlectraError(error) || attempts >= maxAttempts) {
      this.logger.warn(
        `Event ${event.id} failed permanently after ${attempts} attempt(s): ${message}`,
      );
      await this.failNow(event, message, attempts);
      return 'failed';
    }

    const backoffMs = Math.min(2000 * 2 ** (attempts - 1), 60_000);
    this.logger.log(
      `Event ${event.id} attempt ${attempts}/${maxAttempts} failed (${message}); retry in ${backoffMs}ms`,
    );

    await this.prisma.$transaction([
      this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'PENDING',
          attempts,
          lastError: message.slice(0, 2000),
          availableAt: new Date(Date.now() + backoffMs),
        },
      }),
    ]);
    return 'retry_scheduled';
  }

  /** Marks the event (and its lead, if linked) as permanently failed. */
  private async failNow(event: OutboxEvent, error: string, attempts?: number): Promise<void> {
    const operations: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'FAILED',
          attempts: attempts ?? event.attempts,
          lastError: error.slice(0, 2000),
          processedAt: new Date(),
        },
      }),
    ];

    if (event.leadId) {
      operations.push(
        this.prisma.lead.update({
          where: { id: event.leadId },
          data: { status: 'FAILED' },
        }),
      );
    }

    await this.prisma.$transaction(operations);
  }
}
