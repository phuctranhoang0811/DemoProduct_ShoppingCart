import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Kangen Water Ionizers & Accessories',
  description:
    'Shop genuine Enagic Kangen Water ionizers, Anespa mineral spas, replacement filters, and maintenance parts with official warranty.',
  keywords: [
    'Kangen Water ionizer',
    'Enagic',
    'alkaline water',
    'replacement filters',
    'Anespa',
  ],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: `Kangen Water Ionizers & Accessories | ${SITE_NAME}`,
    description:
      'Genuine Enagic Kangen Water ionizers, spas, filters, and parts.',
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Kangen Water ionizers',
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
