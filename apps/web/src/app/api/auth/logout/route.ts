import { NextResponse } from 'next/server';

import { assertSameOrigin, sessionCookieOptions } from '../../../../lib/bff';

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const out = NextResponse.json({ success: true });
  out.cookies.set({ value: '', ...sessionCookieOptions(), maxAge: 0 });
  return out;
}
