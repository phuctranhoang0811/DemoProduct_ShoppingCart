import { NextRequest, NextResponse } from 'next/server';
import { authBackendEnabled, backend, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  if (!authBackendEnabled) return localMode();

  const result = await backend(`/referral-codes/${encodeURIComponent(params.code)}`);
  return NextResponse.json(result.data, { status: result.status });
}
