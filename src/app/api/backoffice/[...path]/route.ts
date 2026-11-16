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

// Forwards back-office calls to the Laravel admin API with the caller's own session.
// It grants nothing by itself: every permission check happens on the backend.
const SEGMENT = /^[A-Za-z0-9_-]{1,64}$/;

async function forward(req: NextRequest, path: string[], method: string) {
  if (!authBackendEnabled) return localMode();
  if (method !== 'GET' && !isSameOrigin(req)) return forbidden();
  if (!path.every((segment) => SEGMENT.test(segment))) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  }

  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const body = method === 'GET' || method === 'DELETE' ? undefined : await req.json().catch(() => ({}));
  const result = await backend<{ message?: string; errors?: Record<string, string[]> }>(
    `/admin/${path.join('/')}${req.nextUrl.search}`,
    { method, body, token },
  );

  if (!result.ok) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Request failed.', errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

type Context = { params: { path: string[] } };

export const GET = (req: NextRequest, { params }: Context) => forward(req, params.path, 'GET');
export const POST = (req: NextRequest, { params }: Context) => forward(req, params.path, 'POST');
export const PUT = (req: NextRequest, { params }: Context) => forward(req, params.path, 'PUT');
export const PATCH = (req: NextRequest, { params }: Context) => forward(req, params.path, 'PATCH');
export const DELETE = (req: NextRequest, { params }: Context) => forward(req, params.path, 'DELETE');
