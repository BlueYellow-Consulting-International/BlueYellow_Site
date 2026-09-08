import { Logger } from '@nestjs/common';
import { LeadCreatedPayload } from '@consulting/shared';
import { FlectraLeadResult, FlectraPort } from './flectra.port';

/**
 * Stands in for the real integration so the whole pipeline (form → api →
 * outbox → worker) runs with no Flectra instance at all. Also living proof
 * that the port is replaceable.
 */
export class NoopFlectraAdapter implements FlectraPort {
  readonly mode = 'noop' as const;
  private readonly logger = new Logger(NoopFlectraAdapter.name);
  private sequence = 0;

  async createLeadForContact(lead: LeadCreatedPayload): Promise<FlectraLeadResult> {
    this.sequence += 1;
    this.logger.log(
      `[noop] pretending to create Flectra lead for ${lead.name} <${lead.email}>`,
    );
    return {
      flectraLeadId: `noop-lead-${this.sequence}`,
      flectraPartnerId: `noop-partner-${this.sequence}`,
    };
  }
}
