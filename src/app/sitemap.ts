import { MetadataRoute } from 'next';
import { initialProducts } from '@/data/products';
import { initialCategories } from '@/data/categories';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date('2026-11-01'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date('2026-11-01'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: new Date('2026-11-01'),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = initialCategories.map((cat) => ({
    url: `${SITE_URL}/shop?category=${cat.id}`,
    lastModified: new Date('2026-11-01'),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Product routes
  const productRoutes: MetadataRoute.Sitemap = initialProducts.map((prod) => ({
    url: `${SITE_URL}/product/${prod.slug}`,
    lastModified: new Date(prod.createdAt || '2026-10-15'),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
