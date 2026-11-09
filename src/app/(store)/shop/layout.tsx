import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All Garments & Collections',
  description:
    'Explore the complete COS Minimal collection. Architectural tailoring, organic cotton shirting, structured wool trousers, and minimalist cashmere knitwear designed with Scandinavian precision.',
  keywords: [
    'COS shirting',
    'minimalist trousers',
    'cashmere knitwear',
    'contemporary coats',
    'Scandinavian fashion collection',
  ],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: `All Garments & Collections | ${SITE_NAME}`,
    description:
      'Explore the complete COS Minimal collection. Contemporary tailoring and tactile natural textiles.',
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'COS Minimal Collection — Contemporary Tailoring',
      },
    ],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}
