import { NextResponse } from 'next/server';
import { authBackendEnabled, backend, clearSessionCookie, getSessionToken, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authBackendEnabled) return localMode();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ user: null });

  const result = await backend<{ data?: unknown }>('/auth/me', { token });

  if (result.status === 401) {
    const res = NextResponse.json({ user: null });
    clearSessionCookie(res);
    return res;
  }
  if (!result.ok) return NextResponse.json({ message: 'Session check failed.' }, { status: 502 });

  return NextResponse.json({ user: result.data.data ?? null });
}
