import type { Metadata } from 'next';
import './globals.css';
import { StoreHydration } from '@/components/common/StoreHydration';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'COS Minimal | Scandinavian Fashion & Modern Tailoring',
  description: 'Timeless wardrobe essentials designed for everyday living. Inspired by Scandinavian architectural minimalism.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#111111] antialiased selection:bg-[#111111] selection:text-white">
        <StoreHydration />
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
