import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';
import { CATALOG_REVALIDATE_SECONDS } from '@/lib/catalog';
import { buildFAQSchema, safeJsonLd } from '@/lib/seo';

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildFAQSchema()) }}
      />
      <HomeClient />
    </>
  );
}
