import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LeadInput,
  OUTBOX_EVENT_LEAD_CREATED,
  SyncStatusResponse,
} from '@consulting/shared';
import { PrismaService } from '../../infra/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists the lead AND its outbox event in one database transaction, so a
   * lead can never exist without its sync event (and vice versa). The worker
   * delivers the event to Flectra later вЂ” the API itself never touches Flectra.
   */
  async create(input: LeadInput) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: input.name,
          email: input.email,
          company: input.company ?? null,
          message: input.message,
        },
      });

      await tx.outboxEvent.create({
        data: {
          type: OUTBOX_EVENT_LEAD_CREATED,
          payload: { leadId: lead.id, ...input },
          leadId: lead.id,
        },
      });

      return lead;
    });
  }

async update(id: string, input: LeadInput) { const existing = await this.prisma.lead.findUnique({ where: { id } }); if (!existing) throw new NotFoundException("Lead not found"); return this.prisma.$transaction(async (tx) => { const lead = await tx.lead.update({ where: { id }, data: { name: input.name, email: input.email, company: input.company ?? null, message: input.message, status: "NEW", flectraLeadId: null, }, }); await tx.outboxEvent.create({ data: { type: OUTBOX_EVENT_LEAD_CREATED, payload: { leadId: lead.id, ...input }, leadId: lead.id, }, }); return lead; }); }

async archive(id: string) { const existing = await this.prisma.lead.findUnique({ where: { id } }); if (!existing) throw new NotFoundException("Lead not found"); return this.prisma.lead.update({ where: { id }, data: { archivedAt: new Date() }, }); }

async findAll() {
  return this.prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      message: true,
      status: true,
      flectraLeadId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async getSyncStatus(id: string): Promise<SyncStatusResponse> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        outboxEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    const event = lead.outboxEvents[0];
    return {
      id: lead.id,
      status: lead.status,
      outbox: event
        ? {
            status: event.status,
            attempts: event.attempts,
            lastError: event.lastError,
            availableAt: event.availableAt.toISOString(),
            processedAt: event.processedAt?.toISOString() ?? null,
          }
        : null,
    };
  }
}



