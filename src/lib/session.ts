import 'server-only';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// The browser never sees the API token: it lives in an httpOnly cookie and every call to the
// Laravel backend is made from these server routes.
export const SESSION_COOKIE = 'hb_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const API_URL = process.env.API_URL?.replace(/\/+$/, '');

export const authBackendEnabled = Boolean(API_URL);

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function backend<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {},
): Promise<BackendResult<T>> {
  const requestId = crypto.randomUUID();
  const method = init.method ?? 'GET';

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      // The same id is written to the backend's logs, so a failure can be traced across both.
      'X-Request-Id': requestId,
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => ({}))) as T;

  if (res.status >= 500) {
    console.error(`[backend] ${method} ${path.split('?')[0]} -> ${res.status} (request ${requestId})`);
  }

  return { ok: res.ok, status: res.status, data };
}

export function getSessionToken(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// State-changing auth routes only accept calls made by this site's own pages.
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') ?? req.headers.get('host'));
  } catch {
    return false;
  }
}

export function forbidden(): NextResponse {
  return NextResponse.json({ message: 'Cross-site request rejected.' }, { status: 403 });
}

// Returned when no backend is configured; the client then keeps its local demo sign-in.
export function localMode(): NextResponse {
  return NextResponse.json({ mode: 'local' }, { status: 501 });
}

interface TokenPayload {
  token?: string;
  user?: unknown;
  message?: string;
  errors?: Record<string, string[]>;
}

// Turns a backend login/register answer into a response that carries the session cookie.
export function sessionResponse(result: BackendResult<TokenPayload>): NextResponse {
  if (!result.ok || !result.data.token) {
    const { message, errors } = result.data;
    return NextResponse.json(
      { message: firstError(errors) ?? message ?? 'Unable to sign in.', errors },
      { status: result.ok ? 502 : result.status },
    );
  }

  const res = NextResponse.json({ user: result.data.user }, { status: result.status });
  setSessionCookie(res, result.data.token);
  return res;
}

export function firstError(errors?: Record<string, string[]>): string | undefined {
  return errors ? Object.values(errors)[0]?.[0] : undefined;
}

export function passThrough(result: BackendResult<{ message?: string; errors?: Record<string, string[]> }>): NextResponse {
  const { message, errors } = result.data;
  return NextResponse.json(
    { message: (result.ok ? message : firstError(errors) ?? message) ?? '', errors },
    { status: result.status },
  );
}

// Guards non-proxied /api/admin/* handlers so they never run unauthenticated.
export async function requireAdminApi(req: NextRequest): Promise<NextResponse | null> {
  if (!authBackendEnabled) {
    return NextResponse.json({ success: false, error: 'Administrator authentication required.' }, { status: 401 });
  }
  if (req.method !== 'GET' && !isSameOrigin(req)) {
    return forbidden();
  }

  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthenticated.' }, { status: 401 });
  }

  const me = await backend<{ data?: { role?: string; status?: string } }>('/auth/me', { token }).catch(() => null);
  if (!me?.ok || me.data.data?.status !== 'active' || me.data.data?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  return null;
}
