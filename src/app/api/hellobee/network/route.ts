import { NextResponse } from 'next/server';
import { authBackendEnabled, backend, getSessionToken, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authBackendEnabled) return localMode();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const result = await backend('/hellobee/network', { token });
  return NextResponse.json(result.data, { status: result.status });
}
