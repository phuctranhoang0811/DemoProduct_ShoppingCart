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
    default: 'Enagic® Kangen Water® | Máy Tạo Nước Điện Giải Ion Kiềm Chuẩn Y Tế Nhật Bản',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Nhà phân phối máy điện giải ion kiềm y tế Kangen® chính hãng Enagic Nhật Bản: LeveLuk K8, SD501, Super 501, Anespa DX. Tạo 5 nguồn nước giàu hydro chống oxy hóa, hỗ trợ tiêu hóa và nâng tầm sức khỏe. Miễn phí khảo sát & lắp đặt toàn quốc.',
  keywords: [
    'máy lọc nước kangen',
    'máy điện giải kangen',
    'kangen water',
    'enagic kangen',
    'leveluk k8',
    'leveluk sd501',
    'sd501 platinum',
    'anespa dx',
    'nước ion kiềm kangen',
    'máy tạo nước điện giải nhật bản',
    'nước kangen 9.5',
    'thay đổi nguồn nước thay đổi cuộc sống',
    'enagic usa',
    'enagic việt nam',
  ],
  authors: [{ name: 'Enagic International Japan', url: SITE_URL }],
  creator: 'Enagic International',
  publisher: 'Enagic® Kangen Water® Vietnam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': `${SITE_URL}`,
      'en-US': `${SITE_URL}?lang=en`,
    },
  },
  openGraph: {
    title: 'Enagic® Kangen Water® | Máy Tạo Nước Điện Giải Ion Kiềm Y Tế Nhật Bản',
    description:
      'Độc quyền sản xuất máy điện giải ion kiềm chuẩn thiết bị y tế từ 1974. Sở hữu 8 tấm điện cực Titan phủ Bạch kim, tạo 5 loại nước chăm sóc sức khỏe trọn vẹn.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=1200&auto=format&fit=crop',
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
  const faqSchema = buildFAQSchema();

  return (
    <html lang="vi">
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
