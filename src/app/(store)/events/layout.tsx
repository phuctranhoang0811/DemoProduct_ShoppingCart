import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Join Hellobee member events, hydration workshops, wellness hikes, and leadership summits across the Hellobee® Kangen Water® community.';

export const metadata: Metadata = {
  title: 'Hellobee Member Events & Workshops',
  description,
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: `Hellobee Member Events & Workshops | ${SITE_NAME}`,
    description,
    url: '/events',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Events', url: '/events' },
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
