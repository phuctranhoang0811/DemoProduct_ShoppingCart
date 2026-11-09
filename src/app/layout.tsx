import type { Metadata } from 'next';
import './globals.css';
import { StoreHydration } from '@/components/common/StoreHydration';
import { Toaster } from 'sonner';
import { SITE_URL, SITE_NAME, buildOrganizationSchema, buildWebSiteSchema, safeJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'COS Minimal | Scandinavian Fashion & Modern Tailoring',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Timeless wardrobe essentials, architectural tailoring, and calm Scandinavian palettes. Explore curated contemporary womenswear and menswear collections designed for quiet luxury.',
  keywords: [
    'COS Minimal',
    'Scandinavian fashion',
    'minimalist clothing',
    'modern tailoring',
    'contemporary womenswear',
    'menswear essentials',
    'organic cotton poplin',
    'wool tailoring',
    'recycled cashmere',
    'quiet luxury',
  ],
  authors: [{ name: 'COS Minimal', url: SITE_URL }],
  creator: 'COS Minimal',
  publisher: 'COS Minimal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'COS Minimal | Scandinavian Fashion & Modern Tailoring',
    description:
      'Timeless wardrobe essentials, architectural silhouettes, and tactile natural textiles designed for everyday living.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'COS Minimal Editorial Campaign — Architectural Tailoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COS Minimal | Scandinavian Fashion & Modern Tailoring',
    description:
      'Curated wardrobe essentials crafted with architectural precision and natural textiles.',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    ],
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
      <body className="min-h-screen bg-white text-[#111111] antialiased selection:bg-[#111111] selection:text-white">
        <StoreHydration />
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
