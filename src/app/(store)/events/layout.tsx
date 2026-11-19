import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Join official Hello Bee member events: community gatherings, training sessions, wellness workshops and leadership programs.';

export const metadata: Metadata = {
  title: 'Member Events',
  description,
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: `Member Events | ${SITE_NAME}`,
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
