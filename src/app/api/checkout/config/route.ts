import { NextResponse } from 'next/server';
import { authBackendEnabled, backend, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authBackendEnabled) return localMode();

  const result = await backend('/checkout/config');
  return NextResponse.json(result.data, { status: result.status });
}
