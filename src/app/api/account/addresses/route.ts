import { NextRequest, NextResponse } from 'next/server';
import {
  authBackendEnabled,
  backend,
  firstError,
  forbidden,
  getSessionToken,
  isSameOrigin,
  localMode,
  normalizeAddressCountryBody,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });

  const result = await backend<{ data?: unknown; message?: string; errors?: Record<string, string[]> }>(
    '/addresses',
    { method: 'POST', token, body: normalizeAddressCountryBody(body as Record<string, unknown>) },
  );

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Could not save address.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ user: result.data.data ?? null }, { status: result.status });
}
