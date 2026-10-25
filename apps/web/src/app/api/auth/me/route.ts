import { NextResponse } from 'next/server';

import { authedForward } from '../../../../lib/bff';

export async function GET() {
  const res = await authedForward('/auth/me');
  const data = await res.json().catch(() => null);

  return NextResponse.json(
    data ?? { success: false, message: 'Session invalid' },
    { status: res.status },
  );
}
