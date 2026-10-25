import { NextResponse } from 'next/server';

import { apiForward, assertSameOrigin } from '../../../../lib/bff';

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const body = await request.json().catch(() => null);

  const res = await apiForward('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;

  return NextResponse.json(
    { success: Boolean(data?.success), message: data?.message },
    { status: res.status },
  );
}
