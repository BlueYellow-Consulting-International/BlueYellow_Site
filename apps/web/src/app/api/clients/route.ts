import { NextResponse } from 'next/server';

import { assertSameOrigin, authedForward } from '../../../lib/bff';

export async function GET() {
  const res = await authedForward('/clients');
  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false }, { status: res.status });
}

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const body = await request.json().catch(() => null);

  const res = await authedForward('/clients', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false }, { status: res.status });
}
