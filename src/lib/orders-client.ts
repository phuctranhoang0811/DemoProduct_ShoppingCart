'use client';

import { useCommerceStore } from '@/stores/useCommerceStore';
import type { CartItem, Order, PaymentMethod } from '@/types';

// Client-side calls for checkout and order history. A 501 from the Next.js routes means no
// backend is configured and the caller should use the store's local demo flow instead.

const LOCAL_MODE = 501;

interface ApiOrder {
  number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: { street: string; ward: string | null; district: string | null; city: string };
  delivery_method: string;
  payment_method: PaymentMethod;
  payment_status: Order['paymentStatus'];
  status: Order['status'];
  items: {
    product_id: string | null;
    product_name: string;
    slug: string;
    image: string | null;
    price: number;
    color_name: string | null;
    size: string | null;
    quantity: number;
  }[];
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  shipping_fee: number;
  total: number;
  referral_code: string | null;
  notes: string | null;
  status_history: { status: Order['status']; note: string | null; timestamp: string }[];
  created_at: string;
}

export function apiOrderToOrder(o: ApiOrder): Order {
  return {
    id: o.number,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    shippingAddress: {
      street: o.shipping_address.street,
      ward: o.shipping_address.ward ?? '',
      district: o.shipping_address.district ?? '',
      city: o.shipping_address.city,
    },
    deliveryMethod: o.delivery_method,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    status: o.status,
    items: o.items.map((i) => ({
      productId: i.product_id ?? '',
      productName: i.product_name,
      slug: i.slug,
      image: i.image ?? '',
      price: i.price,
      colorName: i.color_name ?? '',
      size: i.size ?? '',
      quantity: i.quantity,
    })),
    subtotal: o.subtotal,
    discountAmount: o.discount_amount,
    discountCode: o.discount_code ?? undefined,
    shippingFee: o.shipping_fee,
    total: o.total,
    referralCode: o.referral_code ?? undefined,
    notes: o.notes ?? undefined,
    createdAt: o.created_at,
    statusHistory: o.status_history.map((h) => ({
      status: h.status,
      timestamp: h.timestamp,
      note: h.note ?? undefined,
    })),
  };
}

function remember(order: Order): void {
  useCommerceStore.setState((state) => ({
    orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
  }));
}

// null = local demo mode (no backend); otherwise the methods the backend accepts.
export async function fetchPaymentMethods(): Promise<PaymentMethod[] | null> {
  try {
    const res = await fetch('/api/checkout/config', { cache: 'no-store' });
    if (res.status === LOCAL_MODE) return null;
    if (!res.ok) return [];
    return (await res.json()).payment_methods ?? [];
  } catch {
    return [];
  }
}

export interface CheckoutInput {
  cart: CartItem[];
  customer: { name: string; email: string; phone: string };
  shippingAddress: { street: string; ward: string; district: string; city: string };
  deliveryMethod: string;
  paymentMethod: PaymentMethod;
  referralCode?: string;
  notes?: string;
  idempotencyKey: string;
}

export type CheckoutResult =
  | { ok: true; order: Order; checkoutUrl: string | null; accessToken: string }
  | { ok: false; message: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Only identifiers and quantities are sent; the backend looks up prices itself.
        items: input.cart.map((item) => ({
          product_id: item.productId,
          size: item.size,
          color_id: item.color.id,
          quantity: item.quantity,
        })),
        customer: input.customer,
        shipping_address: input.shippingAddress,
        delivery_method: input.deliveryMethod,
        payment_method: input.paymentMethod,
        referral_code: input.referralCode || null,
        notes: input.notes || null,
        idempotency_key: input.idempotencyKey,
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) return { ok: false, message: data.message || 'Could not place the order.' };

    const order = apiOrderToOrder(data.order);
    remember(order);
    return { ok: true, order, checkoutUrl: data.checkout_url ?? null, accessToken: data.access_token };
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
}

export async function fetchOrder(number: string, accessToken?: string | null): Promise<Order | null> {
  try {
    const query = accessToken ? `?token=${encodeURIComponent(accessToken)}` : '';
    const res = await fetch(`/api/orders/${encodeURIComponent(number)}${query}`, { cache: 'no-store' });
    if (!res.ok) return null;

    const order = apiOrderToOrder((await res.json()).data);
    remember(order);
    return order;
  } catch {
    return null;
  }
}

// Replaces the locally cached order list with the signed-in customer's real history.
export async function syncMyOrders(): Promise<void> {
  try {
    const res = await fetch('/api/orders', { cache: 'no-store' });
    if (!res.ok) return;

    const orders: Order[] = ((await res.json()).data ?? []).map(apiOrderToOrder);
    useCommerceStore.setState({ orders });
  } catch {
    // Keep the cached list when the backend cannot be reached.
  }
}
