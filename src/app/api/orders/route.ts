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

export async function GET() {
  if (!authBackendEnabled) return localMode();

  const token = getSessionToken();
  if (!token) return NextResponse.json({ data: [] }, { status: 401 });

  const result = await backend('/orders', { token });
  return NextResponse.json(result.data, { status: result.status });
}

// Prices, totals and stock are decided by the backend; the body only says what the buyer wants.
export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });

  const result = await backend<{ message?: string; errors?: Record<string, string[]> }>('/orders', {
    method: 'POST',
    body,
    token: getSessionToken(),
  });

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Could not place the order.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}
