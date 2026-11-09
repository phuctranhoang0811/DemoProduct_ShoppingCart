import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/product/'],
        disallow: [
          '/admin/',
          '/admin/*',
          '/checkout',
          '/account',
          '/orders',
          '/api/*',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Claude-Web',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
        ],
        allow: ['/', '/shop', '/product/'],
        disallow: ['/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
