'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { Award, ShieldCheck } from 'lucide-react';

export function AnnouncementBar() {
  const { t, language } = useTranslation();

  return (
    <div className="bg-[#111111] text-white py-2 px-4 text-center text-[10px] sm:text-[11px] tracking-wider uppercase font-medium flex items-center justify-center gap-3 sm:gap-6 border-b border-white/10">
      <div className="flex items-center gap-1.5 truncate">
        <ShieldCheck className="w-3.5 h-3.5 text-[#B9A58B] flex-shrink-0" />
        <span>{t.brand.announcement}</span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-white/70 border-l border-white/20 pl-4">
        <Award className="w-3.5 h-3.5 text-[#B9A58B]" />
        <span>{t.brand.isoBadge}</span>
      </div>
      <Link
        href="/calculator"
        className="hidden lg:inline-flex items-center text-white/80 hover:text-white underline font-semibold transition-colors border-l border-white/20 pl-4"
      >
        <span>Commission & Tax Calculator &rarr;</span>
      </Link>
    </div>
  );
}
