import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo';

const description =
  'Join the Hellobee consultant network: earn 10% direct commission on Kangen Water® system sales and advance from rank 1A to 5A.';

export const metadata: Metadata = {
  title: 'Hellobee Consultant Network',
  description,
  alternates: { canonical: '/hellobee' },
  openGraph: {
    title: `Hellobee Consultant Network | ${SITE_NAME}`,
    description,
    url: '/hellobee',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
