import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'hb_session';
const API_URL = process.env.API_URL?.replace(/\/+$/, '');

type Role = 'customer' | 'employee' | 'admin';

// First match wins. `roles: null` means any signed-in user.
const RULES: { prefix: string; roles: Role[] | null }[] = [
  { prefix: '/api/admin', roles: ['admin'] },
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/employee', roles: ['admin', 'employee'] },
  { prefix: '/account', roles: null },
  { prefix: '/orders', roles: null },
];

async function currentRole(token: string): Promise<Role | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data?.status === 'active' ? (data.role as Role) : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  // Without a backend the app runs on its local demo sign-in, which has nothing to verify here.
  if (!API_URL) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const rule = RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (!rule) return NextResponse.next();

  const isApi = pathname.startsWith('/api/');
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const role = token ? await currentRole(token) : null;

  if (!role) {
    if (isApi) return NextResponse.json({ success: false, error: 'Unauthenticated.' }, { status: 401 });

    const login = new URL('/login', req.url);
    login.searchParams.set('next', pathname);
    const res = NextResponse.redirect(login);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (rule.roles && !rule.roles.includes(role)) {
    if (isApi) return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    return NextResponse.redirect(new URL(role === 'employee' ? '/employee' : '/account', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/account/:path*', '/orders/:path*', '/api/admin/:path*'],
};
