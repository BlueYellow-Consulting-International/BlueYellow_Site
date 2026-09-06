import { LeadCreatedPayload } from '@consulting/shared';

/** What a Flectra sync produces, as strings for our own database columns. */
export interface FlectraLeadResult {
  flectraLeadId: string;
  flectraPartnerId: string | null;
}

/**
 * The only seam through which the worker touches the CRM. Swapping Flectra for
 * another system (or disabling it) means providing another implementation of
 * this interface — nothing else in the codebase changes.
 */
export interface FlectraPort {
  readonly mode: 'real' | 'noop';
  createLeadForContact(lead: LeadCreatedPayload): Promise<FlectraLeadResult>;
}

export const FLECTRA_PORT = Symbol('FLECTRA_PORT');
