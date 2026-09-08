import type { LeadStatus, OutboxStatus } from './lead.schema';

/** A lead as stored in our own PostgreSQL (source of truth). */
export interface LeadDto {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: LeadStatus;
  flectraLeadId: string | null;
  flectraPartnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response of POST /leads. */
export interface CreateLeadResponse {
  id: string;
  status: LeadStatus;
}

/** Response of GET /leads/:id — lead plus latest outbox state (POC verification). */
export interface SyncStatusResponse {
  id: string;
  status: LeadStatus;
  outbox: {
    status: OutboxStatus;
    attempts: number;
    lastError: string | null;
    availableAt: string | null;
    processedAt: string | null;
  } | null;
}
