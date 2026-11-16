import { NextRequest, NextResponse } from 'next/server';
import {
  authBackendEnabled,
  backend,
  firstError,
  forbidden,
  getSessionToken,
  isSameOrigin,
  localMode,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const id = params.id.replace(/^addr-/, '');
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: 'Unknown address.' }, { status: 404 });

  const result = await backend<{ data?: unknown; message?: string; errors?: Record<string, string[]> }>(
    `/addresses/${id}/default`,
    { method: 'PATCH', token },
  );

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Could not update default address.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ user: result.data.data ?? null }, { status: result.status });
}
