import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin',
  '/employee',
  '/api/',
  '/account',
  '/orders',
  '/order-success',
  '/cart',
  '/checkout',
  '/wishlist',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
