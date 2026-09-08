// Portal client: everything goes through the BFF route handlers under /api
// (same-origin). The session is an httpOnly cookie managed by the BFF —
// no tokens or user records in browser storage.

export interface PortalUser {
  id: string;
  email: string;
  role: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  service: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyticsResponse {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: PortalUser;
}

export interface MeResponse {
  success: boolean;
  user?: PortalUser;
}

async function request<TResponse>(path: string, options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  return (await response.json()) as TResponse;
}

export const portalApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<MeResponse>('/auth/me'),

  analytics: () => request<AnalyticsResponse>('/clients/analytics'),

  listClients: () => request<ClientRecord[]>('/clients'),

  createClient: (body: { name: string; service: string }) =>
    request<ClientRecord>('/clients', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateClient: (id: string, body: { name: string; service: string }) =>
    request<ClientRecord>(`/clients/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteClient: (id: string) =>
    request<{ success: boolean }>(`/clients/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// Named helpers the pages call directly.
export const analytics = (): Promise<AnalyticsResponse> => portalApi.analytics();

export const listClients = (): Promise<ClientRecord[]> => portalApi.listClients();

export const createClient = (
  body: { name: string; service: string },
): Promise<ClientRecord> => portalApi.createClient(body);

export const updateClient = (
  id: string,
  body: { name: string; service: string },
): Promise<ClientRecord> => portalApi.updateClient(id, body);

export const deleteClient = (id: string): Promise<{ success: boolean }> =>
  portalApi.deleteClient(id);
