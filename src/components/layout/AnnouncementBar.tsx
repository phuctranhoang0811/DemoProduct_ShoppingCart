'use client';

import { useCommerceStore } from '@/stores/useCommerceStore';
import Link from 'next/link';

export function AnnouncementBar() {
  const settings = useCommerceStore((state) => state.settings);

  if (!settings.announcementText) return null;

  return (
    <div className="bg-[#111111] text-white py-2 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-4">
      <span>{settings.announcementText}</span>
      <Link href="/admin" className="underline hover:text-[#B9A58B] transition-colors ml-2 hidden sm:inline">
        Admin Demo &rarr;
      </Link>
    </div>
  );
}
