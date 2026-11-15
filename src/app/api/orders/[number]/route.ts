import { NextRequest, NextResponse } from 'next/server';
import { authBackendEnabled, backend, getSessionToken, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { number: string } }) {
  if (!authBackendEnabled) return localMode();

  const accessToken = req.nextUrl.searchParams.get('token');
  const query = accessToken ? `?token=${encodeURIComponent(accessToken)}` : '';

  const result = await backend(`/orders/${encodeURIComponent(params.number)}${query}`, {
    token: getSessionToken(),
  });
  return NextResponse.json(result.data, { status: result.status });
}
