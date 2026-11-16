import { NextRequest } from 'next/server';
import { authBackendEnabled, backend, forbidden, isSameOrigin, localMode, sessionResponse } from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const { email, password } = await req.json().catch(() => ({}));

  return sessionResponse(await backend('/auth/login', { method: 'POST', body: { email, password } }));
}
