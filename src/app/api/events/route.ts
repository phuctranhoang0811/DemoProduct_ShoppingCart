import { NextResponse } from 'next/server';
import { authBackendEnabled, backend, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authBackendEnabled) return localMode();

  const res = await backend('/events');
  return NextResponse.json(res.data, { status: res.status });
}
