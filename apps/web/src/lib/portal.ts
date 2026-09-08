// Portal API (auth + clients) — same principle as api.ts: the browser talks only
// to the NestJS API, never to Flectra, and the base URL comes from the environment.

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
  token?: string;
  user?: PortalUser;
}

export interface TokenStorage {
  token: string;
  user: PortalUser;
}

/** The API returns `success: false` with HTTP 200, so callers inspect the body. */
async function request<TResponse>(path: string, options: RequestInit = {}, token?: string | null): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return (await response.json()) as TResponse;
}

export function saveSession({ token, user }: TokenStorage): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getSession(): TokenStorage | null {
  const raw = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!token || !raw) {
    return null;
  }

  try {
    return { token, user: JSON.parse(raw) as PortalUser };
  } catch {
    return null;
  }
}

// Named helpers the pages call directly with the session token.
export const analytics = (token: string): Promise<AnalyticsResponse> => portalApi.analytics(token);

export const listClients = (token: string): Promise<ClientRecord[]> => portalApi.listClients(token);

export const createClient = (
  token: string,
  body: { name: string; service: string },
): Promise<ClientRecord> => portalApi.createClient(token, body);

export const updateClient = (
  token: string,
  id: string,
  body: { name: string; service: string },
): Promise<ClientRecord> => portalApi.updateClient(token, id, body);

export const deleteClient = (token: string, id: string): Promise<{ success: boolean }> =>
  portalApi.deleteClient(token, id);

export const portalApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  analytics: (token: string) => request<AnalyticsResponse>('/clients/analytics', {}, token),

  listClients: (token: string) => request<ClientRecord[]>('/clients', {}, token),

  createClient: (token: string, body: { name: string; service: string }) =>
    request<ClientRecord>('/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, token),

  updateClient: (token: string, id: string, body: { name: string; service: string }) =>
    request<ClientRecord>(`/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, token),

  deleteClient: (token: string, id: string) =>
    request<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }, token),
};
