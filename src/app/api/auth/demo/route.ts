import { NextRequest, NextResponse } from 'next/server';
import { authBackendEnabled, backend, forbidden, isSameOrigin, localMode, sessionResponse } from '@/lib/session';

// One-click sign-in for the seeded demo accounts. Off unless DEMO_LOGIN_ENABLED=true, and the
// shared demo password stays on the server.
const DEMO_ACCOUNTS: Record<string, string> = {
  customer: 'customer@example.com',
  employee: 'employee@hellobee.com',
  admin: 'owner@hellobee.com',
};

const enabled = () => process.env.DEMO_LOGIN_ENABLED === 'true' && Boolean(process.env.DEMO_PASSWORD);

export async function GET() {
  if (!authBackendEnabled) return localMode();
  return NextResponse.json({ enabled: enabled() });
}

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();
  if (!enabled()) return NextResponse.json({ message: 'Demo sign-in is disabled.' }, { status: 404 });

  const { role } = await req.json().catch(() => ({}));
  const email = DEMO_ACCOUNTS[role === 'owner' ? 'admin' : role];
  if (!email) return NextResponse.json({ message: 'Unknown demo role.' }, { status: 422 });

  return sessionResponse(
    await backend('/auth/login', { method: 'POST', body: { email, password: process.env.DEMO_PASSWORD } }),
  );
}
