import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Shop the full Enagic® range: Kangen Water® ionizers, Anespa DX mineral spa, genuine replacement filters, cleaning kits and accessories.';

export const metadata: Metadata = {
  title: 'Shop All Kangen Water® Machines & Accessories',
  description,
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: `Shop All Kangen Water® Machines & Accessories | ${SITE_NAME}`,
    description,
    url: '/shop',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
