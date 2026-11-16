import { NextRequest } from 'next/server';
import { authBackendEnabled, backend, forbidden, isSameOrigin, localMode, passThrough } from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const { email } = await req.json().catch(() => ({}));

  return passThrough(await backend('/auth/forgot-password', { method: 'POST', body: { email } }));
}
