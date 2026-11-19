'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { StoreFooter } from '@/components/layout/StoreFooter';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { BackToTop } from '@/components/common/BackToTop';
import { FloatingChatButton } from '@/components/common/FloatingChatButton';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col ${isHome ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <AnnouncementBar />
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CartDrawer />
      <FloatingChatButton />
      <BackToTop />
    </div>
  );
}
