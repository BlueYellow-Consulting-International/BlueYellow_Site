import { NextResponse } from 'next/server';

import { apiForward, assertSameOrigin, sessionCookieOptions } from '../../../../lib/bff';

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const body = await request.json().catch(() => null);

  const res = await apiForward('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as
    | { success?: boolean; message?: string; token?: string; user?: unknown }
    | null;

  if (!data?.success || !data.token) {
    return NextResponse.json(
      { success: false, message: data?.message ?? 'Login failed' },
      { status: res.status === 200 ? 200 : res.status },
    );
  }

  // Token goes straight into the httpOnly cookie — never into the page.
  const out = NextResponse.json({ success: true, user: data.user });
  out.cookies.set({ value: data.token, ...sessionCookieOptions() });
  return out;
}
