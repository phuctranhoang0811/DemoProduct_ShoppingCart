'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { Sparkles, ArrowRight } from 'lucide-react';

export function StoreFooter() {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(language === 'vi' ? 'Vui lòng nhập địa chỉ email hợp lệ.' : 'Please enter a valid email.');
      return;
    }
    toast.success(language === 'vi' ? 'Đăng ký thành công!' : 'Subscribed successfully!');
    setEmail('');
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 mt-20 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Identity & Tagline */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-light tracking-[0.2em] text-white">
                ENAGIC
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#888888] font-semibold border-l border-white/20 pl-2">
                KANGEN WATER®
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#B9A58B] font-medium">
              {t.brand.tagline}
            </p>
            <p className="text-xs text-[#888888] max-w-sm leading-relaxed font-normal">
              {t.footer.aboutDesc}
            </p>
          </div>

          {/* Core Models */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white font-semibold">
              {t.footer.productsTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#888888]">
              <li><Link href="/product/enagic-leveluk-k8" className="hover:text-white transition-colors">LeveLuk K8</Link></li>
              <li><Link href="/product/enagic-leveluk-sd501" className="hover:text-white transition-colors">LeveLuk SD501</Link></li>
              <li><Link href="/product/enagic-leveluk-sd501-platinum" className="hover:text-white transition-colors">LeveLuk SD501 Platinum</Link></li>
              <li><Link href="/product/enagic-leveluk-super-501" className="hover:text-white transition-colors">LeveLuk Super 501</Link></li>
              <li><Link href="/product/enagic-leveluk-jriv" className="hover:text-white transition-colors">LeveLuk JRIV</Link></li>
              <li><Link href="/product/enagic-anespa-dx" className="hover:text-white transition-colors">Anespa DX Mineral Spa</Link></li>
            </ul>
          </div>

          {/* Care & Maintenance */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white font-semibold">
              {t.footer.customerCareTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#888888]">
              <li><Link href="/shop?category=cat-filters" className="hover:text-white transition-colors">FC1 High-Grade Filter</Link></li>
              <li><Link href="/shop?category=cat-accessories" className="hover:text-white transition-colors">E-Cleaner Kit & Cleaning</Link></li>
              <li><Link href="/shop?category=cat-bottles" className="hover:text-white transition-colors">UV-Protection Bottles</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">{t.cart.title}</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">{t.nav.savedItems}</Link></li>
              <li><Link href="/admin" className="text-white hover:underline flex items-center gap-1">
                <span>{t.nav.adminPortal}</span>
                <Sparkles className="w-3 h-3 text-[#D2FF52]" />
              </Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white font-semibold">
              {language === 'vi' ? 'Đăng Ký Bản Tin' : 'Newsletter'}
            </p>
            <p className="text-xs text-[#888888] leading-relaxed">
              {language === 'vi'
                ? 'Nhận thông tin cập nhật về các công nghệ lọc nước và khuyến mãi định kỳ.'
                : 'Receive updates on new ionizer models and filtration maintenance.'}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'vi' ? 'Nhập email của bạn' : 'Enter your email'}
                  className="bg-white/10 text-white placeholder-white/40 text-xs px-3.5 py-2.5 rounded-l-xs outline-none focus:bg-white/15 flex-1 border border-white/15"
                />
                <button
                  type="submit"
                  className="bg-white text-[#111111] px-4 py-2.5 rounded-r-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#666666] gap-3">
          <p>{t.footer.rights}</p>
          <p className="max-w-xl text-center md:text-right">{t.footer.medicalDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
