import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo';

const description =
  'Join the Hello Bee consultant network: earn 10% direct commission on device sales and advance from LV1 to LV10.';

export const metadata: Metadata = {
  title: 'Hello Bee Network',
  description,
  alternates: { canonical: '/hellobee' },
  openGraph: {
    title: `Hello Bee Network | ${SITE_NAME}`,
    description,
    url: '/hellobee',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
