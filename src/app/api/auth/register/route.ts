import { NextRequest } from 'next/server';
import { authBackendEnabled, backend, forbidden, isSameOrigin, localMode, sessionResponse } from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const { name, email, phone, password } = await req.json().catch(() => ({}));

  return sessionResponse(
    await backend('/auth/register', { method: 'POST', body: { name, email, phone, password } }),
  );
}
