import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Join Hello Bee member events, offline meetings, dining gatherings, wellness workshops, and member chat.';

export const metadata: Metadata = {
  title: 'Events, Meetings & Community',
  description,
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: `Events, Meetings & Community | ${SITE_NAME}`,
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
