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
    default: 'Hello Bee',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Official Hello Bee store: medical-grade alkaline water ionizers, emGuarde, Hello Bee Air 500, and the Hello Bee member network & community.',
  keywords: [
    'hello bee',
    'hellobee',
    'water ionizer',
    'leveluk k8',
    'leveluk sd501',
    'super 501',
    'emguarde',
    'hello bee air 500',
    'alkaline water machine',
    'electrolyzed water',
    'medical grade water ionizer',
    'hello bee network',
  ],
  authors: [{ name: 'Hello Bee', url: SITE_URL }],
  creator: 'Hello Bee',
  publisher: 'Hello Bee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Hello Bee | Wellness Devices & Member Network',
    description:
      'Medical-grade alkaline water ionizer systems, emGuarde, Hello Bee Air 500, and the Hello Bee community.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.hellobee.org/images/og-bee.jpg',
        width: 1200,
        height: 630,
        alt: 'Hello Bee mascot on a honeycomb badge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hello Bee',
    description:
      'Official Hello Bee wellness devices, water ionizers, air purifiers, and member community.',
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
        <Toaster position="bottom-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
