import { z } from 'zod';

/** Sync state of a lead in our own database (source of truth). */
export const LEAD_STATUSES = ['NEW', 'SYNCED', 'FAILED'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Lifecycle of an outbox event. */
export const OUTBOX_STATUSES = ['PENDING', 'PROCESSING', 'SYNCED', 'FAILED'] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

/** The only outbox event type in the POC. */
export const OUTBOX_EVENT_LEAD_CREATED = 'lead.created' as const;
export type OutboxEventType = typeof OUTBOX_EVENT_LEAD_CREATED;

/**
 * What the website contact form submits.
 * One definition, used by the form (client-side) and the API (server-side).
 */
export const leadInputSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('A valid email address is required').max(200),
  company: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(200).optional(),
  ),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
});
export type LeadInput = z.infer<typeof leadInputSchema>;

/** Payload stored in an outbox event of type 'lead.created'. */
export const leadCreatedPayloadSchema = leadInputSchema.extend({
  leadId: z.string().min(1),
});
export type LeadCreatedPayload = z.infer<typeof leadCreatedPayloadSchema>;
