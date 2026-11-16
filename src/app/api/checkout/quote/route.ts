import { NextRequest, NextResponse } from 'next/server';
import { authBackendEnabled, backend, firstError, forbidden, isSameOrigin, localMode } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });

  const result = await backend<{ message?: string; errors?: Record<string, string[]> }>('/checkout/quote', {
    method: 'POST',
    body,
  });

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Unable to price checkout.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}
