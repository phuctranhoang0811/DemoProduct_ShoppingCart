import { NextRequest } from 'next/server';
import { authBackendEnabled, backend, forbidden, isSameOrigin, localMode, passThrough } from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const { token, email, password, password_confirmation } = await req.json().catch(() => ({}));

  return passThrough(
    await backend('/auth/reset-password', {
      method: 'POST',
      body: { token, email, password, password_confirmation },
    }),
  );
}
