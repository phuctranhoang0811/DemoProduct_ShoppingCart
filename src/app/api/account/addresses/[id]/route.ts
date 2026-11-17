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

function cleanAddressId(raw: string): string | null {
  const id = raw.replace(/^addr-/, '');
  return /^\d+$/.test(id) ? id : null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const id = cleanAddressId(params.id);
  if (!id) return NextResponse.json({ message: 'Unknown address.' }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });

  const result = await backend<{ data?: unknown; message?: string; errors?: Record<string, string[]> }>(
    `/addresses/${id}`,
    { method: 'PUT', token, body: normalizeAddressCountryBody(body as Record<string, unknown>) },
  );

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Could not update address.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ user: result.data.data ?? null }, { status: result.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const id = cleanAddressId(params.id);
  if (!id) return NextResponse.json({ message: 'Unknown address.' }, { status: 404 });

  const result = await backend<{ data?: unknown; message?: string; errors?: Record<string, string[]> }>(
    `/addresses/${id}`,
    { method: 'DELETE', token },
  );

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Could not delete address.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ user: result.data.data ?? null }, { status: result.status });
}
