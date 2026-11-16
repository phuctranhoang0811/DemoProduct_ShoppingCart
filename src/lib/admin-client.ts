'use client';

import { toast } from 'sonner';
import { apiOrderToOrder } from '@/lib/orders-client';
import { registerBackoffice, useCommerceStore, type BackofficeHandlers } from '@/stores/useCommerceStore';
import type {
  Category,
  Customer,
  Discount,
  InventoryMovement,
  Product,
  Review,
  StoreSettings,
} from '@/types';

// Back-office data and actions against the Laravel admin API (through /api/backoffice).
// The admin pages keep calling the store's actions; with a backend those actions are routed
// here, sent to the server, and the store is then refreshed from what the server now holds.

/* eslint-disable @typescript-eslint/no-explicit-any */

async function call(method: string, path: string, body?: unknown): Promise<{ ok: boolean; data: any }> {
  try {
    const res = await fetch(`/api/backoffice/${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { message: 'Network error. Please try again.' } };
  }
}

const numericId = (id: string) => id.replace(/^\D+/, '');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    details: p.details ?? [],
    materials: p.materials ?? undefined,
    specifications: p.specifications ?? undefined,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    categoryId: p.category?.id ?? '',
    images: p.images ?? [],
    colors: (p.colors ?? []).map((c: any) => ({ ...c, image: c.image ?? undefined })),
    sizes: p.sizes ?? [],
    status: p.status,
    featured: p.featured,
    bestSeller: p.best_seller,
    newArrival: p.new_arrival,
    sale: p.sale,
    createdAt: p.created_at,
  };
}

function toCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    image: c.image ?? '',
    status: c.status,
  };
}

function toCustomer(u: any): Customer {
  return {
    id: `user-${u.id}`,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    avatar: u.avatar ?? undefined,
    role: 'customer',
    status: u.status,
    referralCode: u.sponsor_code ?? undefined,
    addresses: (u.addresses ?? []).map((a: any) => ({
      id: `addr-${a.id}`,
      fullName: a.full_name,
      phone: a.phone,
      street: a.street,
      ward: a.ward ?? '',
      district: a.district ?? '',
      city: a.city,
      isDefault: a.is_default,
    })),
    createdAt: u.created_at,
    totalOrders: u.total_orders,
    totalSpent: u.total_spent,
  };
}

function toDiscount(d: any): Discount {
  return {
    id: String(d.id),
    code: d.code,
    type: d.type,
    value: d.value,
    minOrderAmount: d.min_order_amount,
    maxDiscount: d.max_discount ?? undefined,
    startDate: d.starts_at ?? '',
    endDate: d.ends_at ?? '',
    usageLimit: d.usage_limit,
    usedCount: d.used_count,
    isActive: d.is_active,
  };
}

function toReview(r: any): Review {
  return {
    id: String(r.id),
    productId: r.product_id ?? '',
    productName: r.product_name ?? '',
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.created_at,
  };
}

function toMovement(m: any): InventoryMovement {
  return {
    id: String(m.id),
    productId: m.product_id ?? '',
    productName: m.product_name,
    variantInfo: m.variant_info ?? '',
    change: m.change,
    previousStock: m.previous_stock,
    newStock: m.new_stock,
    reason: m.reason,
    date: m.date,
  };
}

const SETTING_KEYS: Record<keyof StoreSettings, string> = {
  storeName: 'store_name',
  storeDescription: 'store_description',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  shippingFee: 'shipping_fee',
  freeShippingThreshold: 'free_shipping_threshold',
  currency: 'currency',
  announcementText: 'announcement_text',
  lowStockThreshold: 'low_stock_threshold',
};

function toSettings(raw: Record<string, any>, current: StoreSettings): StoreSettings {
  const settings = { ...current } as Record<string, unknown>;
  for (const [key, apiKey] of Object.entries(SETTING_KEYS)) {
    if (raw[apiKey] !== undefined && raw[apiKey] !== null) settings[key] = raw[apiKey];
  }
  return settings as unknown as StoreSettings;
}

// Only the fields that were actually provided are sent, so a partial edit stays partial.
function productPayload(p: Partial<Product>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) body[key] = value;
  };

  set('name', p.name);
  set('sku', p.sku);
  set('description', p.description);
  set('materials', p.materials);
  set('details', p.details);
  set('specifications', p.specifications);
  set('price', p.price);
  if ('originalPrice' in p) body.original_price = p.originalPrice ?? null;
  set('category_id', p.categoryId);
  set('status', p.status);
  set('featured', p.featured);
  set('best_seller', p.bestSeller);
  set('new_arrival', p.newArrival);
  set('sale', p.sale);
  set('images', p.images);
  set('colors', p.colors?.map((c) => ({ id: c.id, name: c.name, hex: c.hex, image: c.image ?? null })));
  set('sizes', p.sizes?.map((s) => ({ id: s.id, label: s.label, stock: s.stock })));
  if (p.slug && SLUG.test(p.slug)) body.slug = p.slug;

  return body;
}

function discountPayload(d: Partial<Discount>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (d.code !== undefined) body.code = d.code;
  if (d.type !== undefined) body.type = d.type;
  if (d.value !== undefined) body.value = d.value;
  if (d.minOrderAmount !== undefined) body.min_order_amount = d.minOrderAmount;
  if ('maxDiscount' in d) body.max_discount = d.maxDiscount ?? null;
  if (d.startDate !== undefined) body.starts_at = d.startDate || null;
  if (d.endDate !== undefined) body.ends_at = d.endDate || null;
  if (d.usageLimit !== undefined) body.usage_limit = d.usageLimit;
  if (d.isActive !== undefined) body.is_active = d.isActive;
  return body;
}

// Loads what this user may see into the store. Staff get their credited orders; admins everything.
export async function syncBackoffice(): Promise<void> {
  const role = useCommerceStore.getState().currentUser?.role;
  if (role !== 'admin' && role !== 'employee') return;

  const orders = await call('GET', 'orders');
  if (orders.ok) useCommerceStore.setState({ orders: orders.data.data.map(apiOrderToOrder) });
  if (role !== 'admin') return;

  const [products, categories, customers, discounts, reviews, inventory, settings] = await Promise.all([
    call('GET', 'products'),
    call('GET', 'categories'),
    call('GET', 'customers'),
    call('GET', 'discounts'),
    call('GET', 'reviews'),
    call('GET', 'inventory'),
    call('GET', 'settings'),
  ]);

  useCommerceStore.setState((state) => ({
    ...(products.ok ? { products: products.data.data.map(toProduct) } : {}),
    ...(categories.ok ? { categories: categories.data.data.map(toCategory) } : {}),
    ...(customers.ok ? { customers: customers.data.data.map(toCustomer) } : {}),
    ...(discounts.ok ? { discounts: discounts.data.data.map(toDiscount) } : {}),
    ...(reviews.ok ? { reviews: reviews.data.data.map(toReview) } : {}),
    ...(inventory.ok ? { inventoryMovements: inventory.data.data.map(toMovement) } : {}),
    ...(settings.ok ? { settings: toSettings(settings.data.data, state.settings) } : {}),
  }));
}

// Runs one change on the server, then reloads. The page has usually already announced success,
// so a failure is reported clearly and the reload puts the screen back in step with the server.
async function mutate(request: Promise<{ ok: boolean; data: any }>, successMessage?: string): Promise<void> {
  const result = await request;
  if (!result.ok) toast.error(result.data?.message || 'The change could not be saved.');
  else if (successMessage) toast.success(successMessage);
  await syncBackoffice();
}

const handlers: BackofficeHandlers = {
  addProduct: (product) => void mutate(call('POST', 'products', productPayload(product))),
  updateProduct: (id, updates) => void mutate(call('PUT', `products/${id}`, productPayload(updates))),
  deleteProduct: (id) => void mutate(call('DELETE', `products/${id}`)),
  bulkDeleteProducts: (ids) =>
    void mutate(
      Promise.all(ids.map((id) => call('DELETE', `products/${id}`))).then(
        (results) => results.find((r) => !r.ok) ?? { ok: true, data: {} },
      ),
    ),

  addCategory: (category) =>
    void mutate(
      call('POST', 'categories', {
        name: category.name,
        ...(category.slug && SLUG.test(category.slug) ? { slug: category.slug } : {}),
        description: category.description || null,
        image: category.image || null,
        status: category.status,
      }),
    ),
  updateCategory: (id, updates) =>
    void mutate(
      call('PUT', `categories/${id}`, {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined ? { description: updates.description || null } : {}),
        ...(updates.image !== undefined ? { image: updates.image || null } : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
      }),
    ),
  deleteCategory: (id) => void mutate(call('DELETE', `categories/${id}`)),

  updateOrderStatus: (orderId, status, note) =>
    void mutate(
      call('PATCH', `orders/${orderId}/status`, { status, note: note ?? null }),
      note ? 'Internal note appended to order.' : `Order ${orderId} marked as ${status}.`,
    ),
  updatePaymentStatus: (orderId, status) => {
    if (status === 'Paid') return void mutate(call('POST', `orders/${orderId}/mark-paid`, {}), `Order ${orderId} payment updated to Paid.`);
    if (status === 'Refunded') return void mutate(call('POST', `orders/${orderId}/refund`, {}), `Order ${orderId} payment updated to Refunded.`);
    toast.error('A payment cannot be set back to unpaid.');
  },

  addCustomer: (customer) =>
    void mutate(
      call('POST', 'customers', {
        name: customer.name,
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone || null,
      }),
    ),
  updateCustomer: (id, updates) =>
    void mutate(
      call('PUT', `customers/${numericId(id)}`, {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone || null } : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
      }),
    ),
  toggleCustomerStatus: (id) => {
    const customer = useCommerceStore.getState().customers.find((c) => c.id === id);
    if (!customer) return;
    void mutate(
      call('PUT', `customers/${numericId(id)}`, { status: customer.status === 'active' ? 'inactive' : 'active' }),
    );
  },

  addDiscount: (discount) => void mutate(call('POST', 'discounts', discountPayload(discount))),
  updateDiscount: (id, updates) => void mutate(call('PUT', `discounts/${numericId(id)}`, discountPayload(updates))),
  deleteDiscount: (id) => void mutate(call('DELETE', `discounts/${numericId(id)}`)),

  updateReviewStatus: (id, status) => void mutate(call('PATCH', `reviews/${numericId(id)}`, { status })),
  deleteReview: (id) => void mutate(call('DELETE', `reviews/${numericId(id)}`)),

  adjustStock: (productId, sizeLabel, change, reason) =>
    void mutate(call('POST', 'inventory/adjust', { product_id: productId, size: sizeLabel, change, reason })),

  updateSettings: (updates) => {
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const apiKey = SETTING_KEYS[key as keyof StoreSettings];
      if (apiKey && value !== undefined) body[apiKey] = value;
    }
    void mutate(call('PUT', 'settings', body));
  },

  // Public: any visitor can leave a review; it stays hidden until an administrator approves it.
  addReview: (review) => {
    void submitProductReview(review).then((res) => {
      if (!res.ok) toast.error(res.message || 'Your review could not be submitted.');
    });
  },
};

export async function submitProductReview(
  review: Omit<Review, 'id' | 'createdAt' | 'status'>,
): Promise<{ ok: boolean; message?: string }> {
  if (useCommerceStore.getState().authMode === 'local') {
    useCommerceStore.getState().addReview(review);
    return { ok: true, message: 'Thank you for your product review!' };
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: review.productId,
        customer_name: review.customerName,
        customer_email: review.customerEmail,
        rating: review.rating,
        comment: review.comment,
      }),
    });

    if (res.status === 501) {
      useCommerceStore.setState({ authMode: 'local' });
      useCommerceStore.getState().addReview(review);
      return { ok: true, message: 'Thank you for your product review!' };
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data.message || 'Your review could not be submitted.' };
    }
    return { ok: true, message: data.message || 'Thank you. Your review will appear once it has been approved.' };
  } catch {
    return { ok: false, message: 'Your review could not be submitted.' };
  }
}

registerBackoffice(handlers);
