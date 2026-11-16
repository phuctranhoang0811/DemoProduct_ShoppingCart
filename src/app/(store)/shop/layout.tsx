import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Shop the 7-product HelloBee & Enagic® lineup: emGuarde Personal Protection Device, Kangen Air 500 purifier, and LeveLuk alkaline water ionizers.';

export const metadata: Metadata = {
  title: 'Shop Water Ionizers & Wellness Devices',
  description,
  keywords: [
    'Kangen Water ionizer',
    'Enagic',
    'emGuarde',
    'Kangen Air 500',
    'LeveLuk K8',
    'alkaline water',
  ],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: `Shop Water Ionizers & Wellness Devices | ${SITE_NAME}`,
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
