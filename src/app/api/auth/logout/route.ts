import { NextRequest, NextResponse } from 'next/server';
import {
  authBackendEnabled,
  backend,
  clearSessionCookie,
  forbidden,
  getSessionToken,
  isSameOrigin,
  localMode,
} from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (token) {
    // Best effort: the cookie is cleared even if the backend cannot be reached.
    await backend('/auth/logout', { method: 'POST', token }).catch(() => null);
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
