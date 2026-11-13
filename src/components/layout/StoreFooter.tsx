'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { Droplets, ShieldCheck, Award, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export function StoreFooter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ / Please enter a valid email.');
      return;
    }
    toast.success('Đăng ký nhận cẩm nang y khoa Nước Kangen® thành công!');
    setEmail('');
  };

  return (
    <footer className="bg-[#001D3D] text-white pt-16 pb-12 mt-20 border-t border-[#0055A5]/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Vision & Heritage */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0055A5] to-[#00A3E0] flex items-center justify-center text-white shadow-md">
                <Droplets className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-[0.16em] text-white uppercase">
                ENAGIC<sup className="text-[10px] text-[#00A3E0]">®</sup>
              </span>
            </div>
            <p className="text-xs font-bold text-[#00A3E0] tracking-widest uppercase">
              {t.brand.tagline}
            </p>
            <p className="text-sm text-[#A5C0D8] max-w-sm leading-relaxed font-normal">
              {t.footer.aboutDesc}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#003566] text-[#D8E6F3] border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>ISO 13485 Medical Device</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#003566] text-[#D8E6F3] border border-white/10">
                <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>WQA Gold Seal Awarded</span>
              </span>
            </div>
          </div>

          {/* Core Models */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#00A3E0] font-bold">
              {t.footer.productsTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#A5C0D8]">
              <li><Link href="/product/enagic-leveluk-k8" className="hover:text-white transition-colors">LeveLuk K8 (Kangen 8)</Link></li>
              <li><Link href="/product/enagic-leveluk-sd501" className="hover:text-white transition-colors">LeveLuk SD501 Flagship</Link></li>
              <li><Link href="/product/enagic-leveluk-sd501-platinum" className="hover:text-white transition-colors">LeveLuk SD501 Platinum</Link></li>
              <li><Link href="/product/enagic-leveluk-super-501" className="hover:text-white transition-colors">LeveLuk Super 501 (12 Tấm)</Link></li>
              <li><Link href="/product/enagic-leveluk-jriv" className="hover:text-white transition-colors">LeveLuk JRIV (Junior IV)</Link></li>
              <li><Link href="/product/enagic-anespa-dx" className="hover:text-white transition-colors">Anespa DX Khoáng Onsen</Link></li>
            </ul>
          </div>

          {/* Customer Care & Direct Support */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#00A3E0] font-bold">
              {t.footer.customerCareTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#A5C0D8]">
              <li><Link href="/shop?category=cat-filters" className="hover:text-white transition-colors">Lõi Lọc Tinh Chính Hãng</Link></li>
              <li><Link href="/shop?category=cat-accessories" className="hover:text-white transition-colors">Muối Điện Phân & Vệ Sinh</Link></li>
              <li><Link href="/shop?category=cat-bottles" className="hover:text-white transition-colors">Bình Chứa Chống Tia UV</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">{t.cart.title}</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">{t.nav.savedItems}</Link></li>
              <li><Link href="/admin" className="text-[#00A3E0] font-semibold hover:underline flex items-center gap-1">
                <span>{t.nav.adminPortal}</span>
                <Sparkles className="w-3 h-3" />
              </Link></li>
            </ul>
          </div>

          {/* Newsletter / Medical Guide Signup */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#00A3E0] font-bold">
              Cẩm Nang Y Khoa Nước Kangen®
            </p>
            <p className="text-xs text-[#A5C0D8] leading-relaxed">
              Nhận tài liệu nghiên cứu lâm sàng về Hydro hoạt tính và hướng dẫn sử dụng 5 loại nước từ bác sĩ Enagic.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full bg-[#002B5C] text-white px-3.5 py-2.5 text-xs rounded-lg border border-[#0055A5]/40 focus:border-[#00A3E0] outline-none placeholder-[#7A9EB8]"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0055A5] to-[#00A3E0] text-white py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold hover:brightness-110 active:scale-[0.99] transition-all shadow-md"
              >
                Nhận Tài Liệu Miễn Phí
              </button>
            </form>
          </div>
        </div>

        {/* Corporate Address & Contact Hotline */}
        <div className="py-6 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#A5C0D8]">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#00A3E0] flex-shrink-0" />
            <span>Hotline Kỹ Thuật: <strong>1900 866 814</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#00A3E0] flex-shrink-0" />
            <span>Email: <strong>support@enagic-kangen.vn</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00A3E0] flex-shrink-0" />
            <span>Tòa nhà Landmark 81, TP. Hồ Chí Minh</span>
          </div>
        </div>

        {/* Bottom bar & Medical Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#7A9EB8] gap-4">
          <p>{t.footer.rights}</p>
          <p className="text-center md:text-right max-w-xl text-[10px] text-[#648BA8]">
            {t.footer.medicalDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
