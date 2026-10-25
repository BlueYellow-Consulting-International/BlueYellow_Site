import { NextResponse } from 'next/server';

import { assertSameOrigin, authedForward } from '../../../../lib/bff';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const res = await authedForward(`/clients/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false }, { status: res.status });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOrigin(request);

  if (csrf) {
    return csrf;
  }

  const { id } = await context.params;

  const res = await authedForward(`/clients/${encodeURIComponent(id)}`, { method: 'DELETE' });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false }, { status: res.status });
}
