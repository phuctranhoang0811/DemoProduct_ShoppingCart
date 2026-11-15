import { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/catalog';
import { SITE_URL } from '@/lib/seo';

// Rendered per request so a new product is listed at once; the catalog fetches behind it are
// cached and refreshed by tag, so this stays cheap.
export const dynamic = 'force-dynamic';

function latest(dates: (string | undefined)[]): Date | undefined {
  const times = dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d).getTime());
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const catalogUpdatedAt = latest(products.map((p) => p.updatedAt));

  return [
    { url: SITE_URL, lastModified: catalogUpdatedAt, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: catalogUpdatedAt, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/hellobee`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/calculator`, changeFrequency: 'monthly', priority: 0.4 },
    ...categories.map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: latest([
        category.updatedAt,
        ...products.filter((p) => p.categoryId === category.id).map((p) => p.updatedAt),
      ]),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
