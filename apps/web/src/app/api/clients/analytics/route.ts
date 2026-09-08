import { NextResponse } from 'next/server';

import { authedForward } from '../../../../lib/bff';

export async function GET() {
  const res = await authedForward('/clients/analytics');
  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false }, { status: res.status });
}
