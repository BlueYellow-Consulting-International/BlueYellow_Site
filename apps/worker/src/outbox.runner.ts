import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxEvent, PrismaClient } from '@prisma/client';
import { OutboxHandler } from './outbox.handler';
import { PRISMA_CLIENT } from './prisma.token';

/**
 * Polls the transactional outbox table and dispatches claimed events.
 * Claims rows with FOR UPDATE SKIP LOCKED (safe against concurrent workers)
 * and opens a small circuit breaker so a dead Flectra is not hammered.
 */
@Injectable()
export class OutboxRunner implements OnApplicationShutdown {
  private readonly logger = new Logger(OutboxRunner.name);
  private timer: NodeJS.Timeout | null = null;
  private ticking = false;
  private consecutiveRetries = 0;
  private circuitOpenUntil = 0;

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly handler: OutboxHandler,
    private readonly config: ConfigService,
  ) {}

  async start(): Promise<void> {
    this.logger.log(
      `Outbox poller starting (interval=${this.pollIntervalMs}ms, batch=${this.batchSize})`,
    );
    await this.requeueInterrupted();
    this.schedule(0);
  }

  onApplicationShutdown(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(delayMs: number): void {
    this.timer = setTimeout(() => void this.tick(), delayMs);
  }

  private get pollIntervalMs(): number {
    return Number(this.config.get('POLL_INTERVAL_MS') ?? 5000);
  }

  private get batchSize(): number {
    return Number(this.config.get('BATCH_SIZE') ?? 10);
  }

  private async tick(): Promise<void> {
    if (this.ticking) {
      return;
    }
    this.ticking = true;
    try {
      if (Date.now() >= this.circuitOpenUntil) {
        await this.processBatch();
      } else {
        this.logger.warn('Circuit open — Flectra failing repeatedly, cooling down');
      }
    } catch (error) {
      this.logger.error(
        `Outbox tick failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.ticking = false;
      this.schedule(this.pollIntervalMs);
    }
  }

  private async processBatch(): Promise<void> {
    const events = await this.claimBatch();
    for (const event of events) {
      const outcome = await this.handler.handle(event);
      if (outcome === 'synced') {
        this.consecutiveRetries = 0;
      } else if (outcome === 'retry_scheduled') {
        this.consecutiveRetries += 1;
        if (this.consecutiveRetries >= 10) {
          this.circuitOpenUntil = Date.now() + 30_000;
          this.consecutiveRetries = 0;
        }
      }
    }
  }

  /** Atomically claim up to batchSize due events (SKIP LOCKED). */
  private async claimBatch(): Promise<OutboxEvent[]> {
    const claimed = await this.prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE "outbox_events"
      SET "status" = 'PROCESSING'
      WHERE "id" IN (
        SELECT "id" FROM "outbox_events"
        WHERE "status" = 'PENDING' AND "available_at" <= now()
        ORDER BY "created_at"
        LIMIT ${this.batchSize}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id";
    `;

    if (claimed.length === 0) {
      return [];
    }

    return this.prisma.outboxEvent.findMany({
      where: { id: { in: claimed.map((row) => row.id) } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Events left PROCESSING by a crashed run go back to PENDING. At-least-once semantics. */
  private async requeueInterrupted(): Promise<void> {
    const result = await this.prisma.outboxEvent.updateMany({
      where: { status: 'PROCESSING' },
      data: { status: 'PENDING' },
    });
    if (result.count > 0) {
      this.logger.log(`Requeued ${result.count} interrupted PROCESSING event(s)`);
    }
  }
}
