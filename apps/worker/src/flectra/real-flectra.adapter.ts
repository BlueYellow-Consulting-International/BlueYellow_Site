import { Injectable, Logger } from '@nestjs/common';
import { CrmLeadVals, FlectraClient, ResPartnerVals } from '@consulting/flectra';
import { LeadCreatedPayload } from '@consulting/shared';
import { FlectraLeadResult, FlectraPort } from './flectra.port';

/**
 * Maps our Lead domain object onto Flectra models. This file is THE place
 * where our field names are translated into Flectra's (res.partner, crm.lead)
 * — change the mapping here and nowhere else.
 */
@Injectable()
export class RealFlectraAdapter implements FlectraPort {
  readonly mode = 'real' as const;
  private readonly logger = new Logger(RealFlectraAdapter.name);

  constructor(private readonly client: FlectraClient) {}

  async createLeadForContact(lead: LeadCreatedPayload): Promise<FlectraLeadResult> {
    const marker = `[consulting-ZCode leadId:${lead.leadId}]`;

    const existingLeads = await this.client.call<Array<{ id: number; partner_id?: number | false | null }>>(
      'crm.lead',
      'search_read',
      [[['description', 'ilike', marker]], ['id', 'partner_id']],
      { limit: 1 },
    );

    if (existingLeads.length > 0) {
      this.logger.log(`Found existing crm.lead #${existingLeads[0].id} for ${lead.leadId}`);
      return {
        flectraLeadId: String(existingLeads[0].id),
        flectraPartnerId: existingLeads[0].partner_id
  ? String(existingLeads[0].partner_id)
  : null,
      };
    }

    const partner = await this.findOrCreatePartner(lead);

    const crmLeadVals: CrmLeadVals = {
      // Opportunity title shown in the pipeline.
      name: lead.company ? `Website inquiry — ${lead.company}` : `Website inquiry — ${lead.name}`,
      contact_name: lead.name, // person to talk to
      email_from: lead.email, // reply-to address
      description: `${lead.message}\n\n${marker}`, // the message from the form
      ...(partner ? { partner_id: partner.id } : {}), // link to the company/contact
    };

    const flectraLeadId = await this.client.call<number>('crm.lead', 'create', [crmLeadVals]);
    this.logger.log(`Created crm.lead #${flectraLeadId} for ${lead.email}`);
    return {
      flectraLeadId: String(flectraLeadId),
      flectraPartnerId: partner ? String(partner.id) : null,
    };
  }

  /** Partner dedupe: reuse the existing res.partner with this email, or create one. */
  private async findOrCreatePartner(lead: LeadCreatedPayload): Promise<{ id: number } | null> {
    const existing = await this.client.call<Array<{ id: number }>>(
      'res.partner',
      'search_read',
      [
        [['email', '=', lead.email]],
        ['id'],
      ],
      { limit: 1 },
    );
    if (existing.length > 0) {
      return existing[0];
    }

    const partnerVals: ResPartnerVals = {
      // If a company was given it becomes the partner, otherwise the person is the partner.
      name: lead.company ?? lead.name,
      email: lead.email,
      is_company: Boolean(lead.company),
    };
    const partnerId = await this.client.call<number>('res.partner', 'create', [partnerVals]);
    this.logger.log(`Created res.partner #${partnerId} for ${lead.email}`);
    return { id: partnerId };
  }
}


