'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#111111] text-white py-2 px-4 text-center text-[11px] sm:text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2 sm:gap-4 border-b border-white/10">
      <div className="flex items-center gap-1.5 line-clamp-1">
        <span>{t.brand.announcement}</span>
      </div>
      <Link
        href="/admin"
        className="hidden md:inline-flex items-center gap-1 text-white/70 hover:text-white underline font-semibold transition-colors ml-2 flex-shrink-0"
      >
        <span>Admin Portal</span>
        <Sparkles className="w-3 h-3 text-[#D2FF52]" />
      </Link>
    </div>
  );
}
