'use client';

import { toast } from 'sonner';
import { syncBackoffice } from '@/lib/admin-client';
import { syncNetwork } from '@/lib/hellobee-client';
import { syncMyOrders } from '@/lib/orders-client';
import { useCommerceStore } from '@/stores/useCommerceStore';
import type { Address, Customer } from '@/types';

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
const isLocal = (status: number, data?: { mode?: string } | null) =>
  status === LOCAL_MODE || data?.mode === 'local';

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
      country: a.country === 'US' ? 'United States' : (a.country ?? undefined),
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

  if (isLocal(res.status, res.data)) {
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
  referralCode?: string;
}): Promise<AuthResult> {
  const cleanRef = input.referralCode?.trim().toUpperCase();
  const res = await post('/api/auth/register', {
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
    ...(cleanRef ? { sponsor_code: cleanRef } : {}),
  });

  if (isLocal(res.status, res.data)) {
    const user = useCommerceStore.getState().register(input.name, input.email, input.phone, cleanRef);
    return { ok: true, user };
  }

  return finish(res);
}

async function accountRequest(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<{ status: number; data: any }> {
  try {
    const res = await fetch(path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return { status: 0, data: { message: 'Network error. Please try again.' } };
  }
}

function addressPayload(a: Omit<Address, 'id'>): Record<string, unknown> {
  return {
    full_name: a.fullName,
    phone: a.phone,
    street: a.street,
    ward: a.ward || null,
    district: a.district || null,
    city: a.city,
    postal_code: a.postalCode || null,
    country: a.country || null,
    delivery_notes: a.deliveryNotes || null,
    is_default: Boolean(a.isDefault),
  };
}

export async function saveProfile(updates: Partial<Customer>): Promise<AuthResult> {
  const res = await accountRequest('/api/account/profile', 'PUT', {
    name: updates.name,
    phone: updates.phone,
  });

  if (isLocal(res.status, res.data)) {
    useCommerceStore.getState().updateProfile(updates);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }

  if (res.status >= 200 && res.status < 300 && res.data.user) {
    const user = adopt(res.data.user) ?? undefined;
    return { ok: true, user };
  }
  return { ok: false, message: res.data?.message || 'Could not update profile.' };
}

export async function saveAddress(address: Omit<Address, 'id'>): Promise<AuthResult> {
  const res = await accountRequest('/api/account/addresses', 'POST', addressPayload(address));
  if (isLocal(res.status, res.data)) {
    useCommerceStore.getState().addAddress(address);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }
  if (res.status >= 200 && res.status < 300 && res.data.user) {
    return { ok: true, user: adopt(res.data.user) ?? undefined };
  }
  return { ok: false, message: res.data?.message || 'Could not save address.' };
}

export async function editAddress(addressId: string, address: Omit<Address, 'id'>): Promise<AuthResult> {
  const res = await accountRequest(`/api/account/addresses/${encodeURIComponent(addressId)}`, 'PUT', addressPayload(address));
  if (isLocal(res.status, res.data)) {
    useCommerceStore.getState().updateAddress(addressId, address);
    if (address.isDefault) useCommerceStore.getState().setDefaultAddress(addressId);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }
  if (res.status >= 200 && res.status < 300 && res.data.user) {
    return { ok: true, user: adopt(res.data.user) ?? undefined };
  }
  return { ok: false, message: res.data?.message || 'Could not update address.' };
}

export async function removeAddress(addressId: string): Promise<AuthResult> {
  const res = await accountRequest(`/api/account/addresses/${encodeURIComponent(addressId)}`, 'DELETE');
  if (isLocal(res.status, res.data)) {
    useCommerceStore.getState().deleteAddress(addressId);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }
  if (res.status >= 200 && res.status < 300 && res.data.user) {
    return { ok: true, user: adopt(res.data.user) ?? undefined };
  }
  return { ok: false, message: res.data?.message || 'Could not remove address.' };
}

export async function markDefaultAddress(addressId: string): Promise<AuthResult> {
  const res = await accountRequest(`/api/account/addresses/${encodeURIComponent(addressId)}/default`, 'PATCH');
  if (isLocal(res.status, res.data)) {
    useCommerceStore.getState().setDefaultAddress(addressId);
    return { ok: true, user: useCommerceStore.getState().currentUser ?? undefined };
  }
  if (res.status >= 200 && res.status < 300 && res.data.user) {
    return { ok: true, user: adopt(res.data.user) ?? undefined };
  }
  return { ok: false, message: res.data?.message || 'Could not update default address.' };
}

export async function signOut(): Promise<void> {
  await post('/api/auth/logout');
  // Clears the local copy in both modes.
  useCommerceStore.getState().logout();
}

// One-click demo accounts. Reports the outcome itself so callers stay one-liners.
export async function demoSignIn(role: DemoRole, successMessage?: string): Promise<AuthResult> {
  const res = await post('/api/auth/demo', { role });

  if (isLocal(res.status, res.data)) {
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
    const data = await res.json().catch(() => ({}));
    if (isLocal(res.status, data)) return true;
    return res.ok && data.enabled === true;
  } catch {
    return false;
  }
}

// Reconciles the local session copy with the server on page load.
export async function syncSession(): Promise<void> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));

    if (isLocal(res.status, data)) {
      useCommerceStore.setState({ authMode: 'local' });
      return;
    }

    useCommerceStore.setState({ authMode: 'backend' });
    if (!res.ok) return;

    const user = adopt(data.user ?? null);
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
