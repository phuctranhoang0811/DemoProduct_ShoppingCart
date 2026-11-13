import type { Metadata } from 'next';
import './globals.css';
import { StoreHydration } from '@/components/common/StoreHydration';
import { Toaster } from 'sonner';
import {
  SITE_URL,
  SITE_NAME,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFAQSchema,
  safeJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Enagic® Kangen Water® | Japanese Medical-Grade Water Ionizers',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Official distributor of Enagic® Kangen Water® medical-grade water ionizers: LeveLuk K8, SD501, Super 501, Anespa DX. Producing 5 types of antioxidant-rich alkaline ionized water. Certified Medical Device.',
  keywords: [
    'kangen water',
    'enagic kangen',
    'water ionizer',
    'leveluk k8',
    'leveluk sd501',
    'sd501 platinum',
    'anespa dx',
    'alkaline water machine',
    'electrolyzed water',
    'medical grade water ionizer',
    'enagic international',
    'change your water change your life',
  ],
  authors: [{ name: 'Enagic International Japan', url: SITE_URL }],
  creator: 'Enagic International',
  publisher: 'Enagic® Kangen Water®',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Enagic® Kangen Water® | Japanese Medical-Grade Water Ionizers',
    description:
      'Pioneer in electrolyzed water ionizer systems since 1974. Featuring solid medical-grade titanium platinum-coated plates producing 5 types of functional waters.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Enagic LeveLuk K8 & Kangen Water Flagship Devices',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enagic® Kangen Water® | Change Your Water, Change Your Life®',
    description:
      'Exclusive Global Producer of Medical-Grade Kangen Water® Ionizers Since 1974.',
    images: [
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=1200&auto=format&fit=crop',
    ],
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
  const faqSchema = buildFAQSchema();

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(faqSchema),
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
