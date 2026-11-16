'use client';

import { toast } from 'sonner';
import { syncBackoffice } from '@/lib/admin-client';
import { syncNetwork } from '@/lib/hellobee-client';
import { syncMyOrders } from '@/lib/orders-client';
import { useCommerceStore } from '@/stores/useCommerceStore';
import type { Customer } from '@/types';

// Client-side entry points for authentication. Each call goes to the Next.js auth routes, which
// hold the session in an httpOnly cookie. When no backend is configured those routes answer 501
// and we fall back to the store's local demo sign-in, so the static demo keeps working.

type Role = NonNullable<Customer['role']>;
type DemoRole = 'customer' | 'employee' | 'admin';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: 'active' | 'inactive';
  avatar: string | null;
  sponsor_code: string | null;
  addresses: {
    id: number;
    full_name: string;
    phone: string;
    street: string;
    ward: string | null;
    district: string | null;
    city: string;
    postal_code: string | null;
    country: string | null;
    delivery_notes: string | null;
    is_default: boolean;
  }[];
  hellobee_member: { id: string; role: string; referral_code: string; rank: string } | null;
  created_at: string;
}

export interface AuthResult {
  ok: boolean;
  user?: Customer;
  message?: string;
}

const LOCAL_MODE = 501;

export function homeForRole(role?: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'employee') return '/employee';
  return '/account';
}

function toCustomer(user: ApiUser): Customer {
  const member = user.hellobee_member;

  return {
    // Network members keep their member id: the staff portal still matches local network data on it.
    id: member?.id ?? `user-${user.id}`,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    avatar: user.avatar ?? undefined,
    role: user.role,
    status: user.status,
    referralCode: member?.referral_code ?? user.sponsor_code ?? undefined,
    addresses: user.addresses.map((a) => ({
      id: `addr-${a.id}`,
      fullName: a.full_name,
      phone: a.phone,
      street: a.street,
      ward: a.ward ?? '',
      district: a.district ?? '',
      city: a.city,
      postalCode: a.postal_code ?? undefined,
      country: a.country ?? undefined,
      deliveryNotes: a.delivery_notes ?? undefined,
      isDefault: a.is_default,
    })),
    createdAt: user.created_at,
    totalOrders: 0,
    totalSpent: 0,
  };
}

function adopt(user: ApiUser | null): Customer | null {
  const customer = user ? toCustomer(user) : null;
  useCommerceStore.getState().setSession(customer, user?.hellobee_member?.id);
  return customer;
}

async function post(path: string, body?: unknown): Promise<{ status: number; data: any }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return { status: 0, data: { message: 'Network error. Please try again.' } };
  }
}

function finish({ status, data }: { status: number; data: any }): AuthResult {
  if (status >= 200 && status < 300 && data.user) {
    const user = adopt(data.user) ?? undefined;
    if (user?.role === 'customer') void syncMyOrders();
    else if (user) void Promise.all([syncNetwork(), syncBackoffice()]);
    return { ok: true, user };
  }
  return { ok: false, message: data.message || 'Something went wrong. Please try again.' };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const res = await post('/api/auth/login', { email, password });

  if (res.status === LOCAL_MODE) {
    const store = useCommerceStore.getState();
    const ok = store.loginWithEmail(email);
    return { ok, user: useCommerceStore.getState().currentUser ?? undefined };
  }

  return finish(res);
}

export async function signUp(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthResult> {
  const res = await post('/api/auth/register', input);

  if (res.status === LOCAL_MODE) {
    const user = useCommerceStore.getState().register(input.name, input.email, input.phone);
    return { ok: true, user };
  }

  return finish(res);
}

export async function signOut(): Promise<void> {
  await post('/api/auth/logout');
  // Clears the local copy in both modes.
  useCommerceStore.getState().logout();
}

// One-click demo accounts. Reports the outcome itself so callers stay one-liners.
export async function demoSignIn(role: DemoRole, successMessage?: string): Promise<AuthResult> {
  const res = await post('/api/auth/demo', { role });

  if (res.status === LOCAL_MODE) {
    useCommerceStore.getState().loginAsDemo(role);
    if (successMessage) toast.success(successMessage);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }

  const result = finish(res);
  if (!result.ok) {
    toast.error(result.message);
  } else if (successMessage) {
    toast.success(successMessage);
  }
  return result;
}

// Switches demo role, then moves to that role's area (the previous page may no longer be allowed).
export async function switchDemoRole(role: DemoRole, successMessage: string): Promise<void> {
  const local = useCommerceStore.getState().authMode === 'local';
  const result = await demoSignIn(role, successMessage);

  if (result.ok && !local) {
    window.location.assign(homeForRole(role));
  }
}

export async function demoSignInAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/demo');
    if (res.status === LOCAL_MODE) return true;
    return res.ok && (await res.json()).enabled === true;
  } catch {
    return false;
  }
}

// Reconciles the local session copy with the server on page load.
export async function syncSession(): Promise<void> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });

    if (res.status === LOCAL_MODE) {
      useCommerceStore.setState({ authMode: 'local' });
      return;
    }

    useCommerceStore.setState({ authMode: 'backend' });
    if (!res.ok) return;

    const user = adopt((await res.json()).user ?? null);
    // Customers see their real order history. Staff screens still run on local demo data.
    if (!user) {
      useCommerceStore.setState({ orders: [] });
    } else if (user.role === 'customer') {
      await syncMyOrders();
    } else {
      await Promise.all([syncNetwork(), syncBackoffice()]);
    }
  } catch {
    // Offline or backend down: keep whatever is cached until the next load.
  }
}
