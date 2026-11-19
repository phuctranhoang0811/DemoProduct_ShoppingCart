import type { Metadata } from 'next';
import { SITE_NAME, buildBreadcrumbsSchema, safeJsonLd } from '@/lib/seo';

const description =
  'Organize and join Hello Bee offline meetings, dinners and gatherings, share meetup photos, and chat with members.';

export const metadata: Metadata = {
  title: 'Meetings & Member Community',
  description,
  alternates: {
    canonical: '/meetings',
  },
  openGraph: {
    title: `Meetings & Member Community | ${SITE_NAME}`,
    description,
    url: '/meetings',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Meetings', url: '/meetings' },
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
