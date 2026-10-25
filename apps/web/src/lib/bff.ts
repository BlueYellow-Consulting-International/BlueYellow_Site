import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Browser-FBF — the browser calls these same-origin route handlers; they
// forward to the NestJS API server-side. The JWT lives ONLY in an httpOnly
// cookie on the web origin: no tokens in browser storage, ever.
export const SESSION_COOKIE = 'by_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const apiBase = process.env.API_URL ?? 'http://localhost:4000';

/** CSRF guard: reject cross-origin mutation attempts that declare an Origin. */
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');

  if (origin) {
    let originHost: string | null = null;

    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }

    if (originHost !== request.headers.get('host')) {
      return NextResponse.json(
        { success: false, message: 'Cross-origin request rejected' },
        { status: 403 },
      );
    }
  }

  return null;
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: 'lax' as const,
    // Flip to true when the site runs behind HTTPS (Nginx Proxy Manager).
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

/** Server-side call to the NestJS API. */
export async function apiForward(path: string, requestInit: RequestInit = {}): Promise<Response> {
  return fetch(`${apiBase}${path}`, {
    cache: 'no-store',
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      ...(requestInit.headers ?? {}),
    },
  });
}

/** Same as apiForward, but as the current session (cookie → Authorization). */
export async function authedForward(path: string, requestInit: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  return apiForward(path, {
    ...requestInit,
    headers: {
      ...(requestInit.headers ?? {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}
