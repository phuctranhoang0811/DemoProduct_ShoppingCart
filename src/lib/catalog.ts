import 'server-only';

import { initialCategories } from '@/data/categories';
import { initialProducts } from '@/data/products';
import { initialReviews } from '@/data/reviews';
import type { Category, Product, Review } from '@/types';

// Server-side source of truth for catalog data. Reads the Laravel API when API_URL is set and
// falls back to the bundled demo data otherwise, so the storefront still builds without a backend.
const API_URL: string | undefined = undefined;

export const CATALOG_TAG = 'catalog';
export const productTag = (slug: string) => `product:${slug}`;

// Pages are refreshed on demand by the backend webhook; this is only the safety net.
export const CATALOG_REVALIDATE_SECONDS = 3600;

export interface ProductRating {
  count: number;
  average: number | null;
}

export interface CatalogProduct extends Product {
  rating: ProductRating;
  updatedAt: string;
}

export interface CatalogCategory extends Category {
  updatedAt?: string;
}

export interface ProductDetail {
  product: CatalogProduct;
  category: CatalogCategory | null;
  reviews: Review[];
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: 'active' | 'inactive';
  updated_at: string | null;
}

interface ApiReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  materials: string | null;
  details: string[];
  specifications: Product['specifications'] | null;
  price: number;
  original_price: number | null;
  status: Product['status'];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  sale: boolean;
  category: ApiCategory;
  images: string[];
  colors: { id: string; name: string; hex: string; image: string | null }[];
  sizes: { id: string; label: string; stock: number }[];
  rating: ProductRating;
  reviews?: ApiReview[];
  created_at: string;
  updated_at: string;
}

class ApiNotFoundError extends Error {}

async function api<T>(path: string, tags: string[]): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags },
  });

  if (res.status === 404) throw new ApiNotFoundError(path);
  if (!res.ok) throw new Error(`Catalog API ${path} responded ${res.status}`);

  return res.json() as Promise<T>;
}

function toCategory(c: ApiCategory): CatalogCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    image: c.image ?? '',
    status: c.status,
    updatedAt: c.updated_at ?? undefined,
  };
}

function toProduct(p: ApiProduct): CatalogProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    details: p.details,
    materials: p.materials ?? undefined,
    specifications: p.specifications ?? undefined,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    categoryId: p.category.id,
    images: p.images,
    colors: p.colors.map((c) => ({ ...c, image: c.image ?? undefined })),
    sizes: p.sizes,
    status: p.status,
    featured: p.featured,
    bestSeller: p.best_seller,
    newArrival: p.new_arrival,
    sale: p.sale,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    rating: p.rating,
  };
}

function approvedLocalReviews(productId: string): Review[] {
  return initialReviews.filter((r) => r.productId === productId && r.status === 'approved');
}

function localRating(productId: string): ProductRating {
  const reviews = approvedLocalReviews(productId);
  if (reviews.length === 0) return { count: 0, average: null };
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { count: reviews.length, average: Math.round(average * 10) / 10 };
}

function localProduct(p: Product): CatalogProduct {
  return { ...p, rating: localRating(p.id), updatedAt: p.createdAt };
}

export async function getCategories(): Promise<CatalogCategory[]> {
  if (!API_URL) return initialCategories.filter((c) => c.status === 'active');

  const { data } = await api<{ data: ApiCategory[] }>('/categories', [CATALOG_TAG]);
  return data.map(toCategory);
}

export async function getProducts(): Promise<CatalogProduct[]> {
  if (!API_URL) return initialProducts.filter((p) => p.status === 'active').map(localProduct);

  const products: CatalogProduct[] = [];
  for (let page = 1; ; page++) {
    const res = await api<{ data: ApiProduct[]; meta: { last_page: number } }>(
      `/products?per_page=100&page=${page}`,
      [CATALOG_TAG],
    );
    products.push(...res.data.map(toProduct));
    if (page >= res.meta.last_page) break;
  }
  return products;
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  if (!API_URL) {
    const product = initialProducts.find((p) => p.slug === slug && p.status === 'active');
    if (!product) return null;
    return {
      product: localProduct(product),
      category: initialCategories.find((c) => c.id === product.categoryId) ?? null,
      // Reviewer emails never leave the server.
      reviews: approvedLocalReviews(product.id).map((r) => ({ ...r, customerEmail: '' })),
    };
  }

  try {
    const { data } = await api<{ data: ApiProduct }>(`/products/${encodeURIComponent(slug)}`, [
      CATALOG_TAG,
      productTag(slug),
    ]);

    return {
      product: toProduct(data),
      category: toCategory(data.category),
      reviews: (data.reviews ?? []).map((r) => ({
        id: `rev-${r.id}`,
        productId: data.id,
        productName: data.name,
        customerName: r.customer_name,
        customerEmail: '',
        rating: r.rating,
        comment: r.comment,
        status: 'approved' as const,
        createdAt: r.created_at,
      })),
    };
  } catch (error) {
    if (error instanceof ApiNotFoundError) return null;
    throw error;
  }
}
