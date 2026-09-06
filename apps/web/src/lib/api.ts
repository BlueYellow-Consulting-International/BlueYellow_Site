import type { CreateLeadResponse, LeadInput } from '@consulting/shared';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as
      | { message?: unknown; error?: string }
      | null;
    const message =
      typeof detail?.message === 'string'
        ? detail.message
        : (detail?.error ?? `Request failed with status ${response.status}`);
    throw new Error(message);
  }

  return (await response.json()) as TResponse;
}

/** The only backend the web app talks to — the NestJS API. Never Flectra. */
export const apiClient = {
  createLead: (input: LeadInput) => post<CreateLeadResponse>('/leads', input),
};
