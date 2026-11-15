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

// Admin-only on the backend; this route only forwards the caller's session.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const id = params.id.replace(/^payout-/, '');
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: 'Unknown payout.' }, { status: 404 });

  const { status } = await req.json().catch(() => ({}));

  return passThrough(await backend(`/hellobee/payouts/${id}`, { method: 'PATCH', token, body: { status } }));
}
