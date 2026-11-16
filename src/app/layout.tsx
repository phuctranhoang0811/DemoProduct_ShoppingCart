import type { Metadata } from 'next';
import './globals.css';
import { StoreHydration } from '@/components/common/StoreHydration';
import { Toaster } from 'sonner';
import {
  SITE_URL,
  SITE_NAME,
  buildOrganizationSchema,
  buildWebSiteSchema,
  safeJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hellobee® Kangen Water® | Japanese Medical-Grade Water Ionizers',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Official distributor of Hellobee® Kangen Water® medical-grade water ionizers, emGuarde, and Kangen Air 500: LeveLuk K8, SD501 DX, Super 501, SD501U, JrIV. Certified Medical Device.',
  keywords: [
    'kangen water',
    'enagic kangen',
    'water ionizer',
    'leveluk k8',
    'leveluk sd501',
    'super 501',
    'emguarde',
    'kangen air 500',
    'alkaline water machine',
    'electrolyzed water',
    'medical grade water ionizer',
    'enagic international',
    'change your water change your life',
  ],
  authors: [{ name: 'Hellobee', url: SITE_URL }],
  creator: 'Hellobee',
  publisher: 'Hellobee® Kangen Water®',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Hellobee® Kangen Water® | Japanese Medical-Grade Water Ionizers',
    description:
      'Pioneer in electrolyzed water ionizer systems since 1974. Featuring solid medical-grade titanium platinum-coated plates producing 5 types of functional waters.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.hellobee.org/images/og-bee.jpg',
        width: 1200,
        height: 630,
        alt: 'Hellobee bee mascot on a honeycomb badge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hellobee® Kangen Water® | Change Your Water, Change Your Life®',
    description:
      'Exclusive Global Producer of Medical-Grade Kangen Water® Ionizers Since 1974.',
    images: ['https://www.hellobee.org/images/og-bee.jpg'],
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = buildWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-[#111111] antialiased selection:bg-[#0055A5] selection:text-white">
        <StoreHydration />
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
