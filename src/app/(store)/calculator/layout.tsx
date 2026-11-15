import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo';

const description =
  'Estimate take-home pay with the multi-country salary and tax calculator: US 1099 and W-2 income, and Vietnam gross-to-net salary.';

export const metadata: Metadata = {
  title: 'Salary & Tax Calculator (US and Vietnam)',
  description,
  alternates: { canonical: '/calculator' },
  openGraph: {
    title: `Salary & Tax Calculator (US and Vietnam) | ${SITE_NAME}`,
    description,
    url: '/calculator',
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
