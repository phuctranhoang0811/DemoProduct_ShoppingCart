import { NextRequest } from 'next/server';
import {
  authBackendEnabled,
  backend,
  forbidden,
  getSessionToken,
  isSameOrigin,
  localMode,
  passThrough,
} from '@/lib/session';

// Public review submission. The backend holds every review for moderation.
export async function POST(req: NextRequest) {
  if (!authBackendEnabled) return localMode();
  if (!isSameOrigin(req)) return forbidden();

  const { product_id, customer_name, customer_email, rating, comment } = await req.json().catch(() => ({}));

  return passThrough(
    await backend(`/products/${encodeURIComponent(String(product_id ?? ''))}/reviews`, {
      method: 'POST',
      token: getSessionToken(),
      body: { customer_name, customer_email, rating, comment },
    }),
  );
}
