import { NextRequest, NextResponse } from 'next/server';
import {
  authBackendEnabled,
  backend,
  forbidden,
  getSessionToken,
  isSameOrigin,
  localMode,
  passThrough,
} from '@/lib/session';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { amount, bank_name, bank_account_number, bank_account_name } = await req.json().catch(() => ({}));

  return passThrough(
    await backend('/hellobee/payouts', {
      method: 'POST',
      token,
      body: { amount, bank_name, bank_account_number, bank_account_name },
    }),
  );
}
