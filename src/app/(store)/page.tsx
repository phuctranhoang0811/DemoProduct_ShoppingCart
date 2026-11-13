'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Sparkles,
  Droplets,
  HeartPulse,
  Activity,
  CheckCircle2,
  PhoneCall,
  Zap,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ProductCard } from '@/components/product/ProductCard';

export default function HomePage() {
  const { t, language } = useTranslation();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  const [activeWaterTab, setActiveWaterTab] = useState<number>(1);

  const flagshipIonizers = products.filter(
    (p) => (p.categoryId === 'cat-ionizers' || p.categoryId === 'cat-spa') && p.status === 'active'
  ).slice(0, 4);

  const accessoriesAndFilters = products.filter(
    (p) => (p.categoryId === 'cat-filters' || p.categoryId === 'cat-accessories' || p.categoryId === 'cat-bottles') && p.status === 'active'
  ).slice(0, 4);

  const waterTypes = [
    {
      id: 0,
      title: t.watersSection.water1Title,
      ph: t.watersSection.water1Ph,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
      glow: 'shadow-purple-500/20',
      desc: t.watersSection.water1Desc,
      usage: t.watersSection.water1Usage,
      tag: language === 'vi' ? 'Bóc Tách Dầu & Thuốc Sâu' : 'Pesticide & Oil Emulsifier',
      icon: '🛡️',
    },
    {
      id: 1,
      title: t.watersSection.water2Title,
      ph: t.watersSection.water2Ph,
      color: 'from-blue-600 to-cyan-500',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
      glow: 'shadow-blue-500/20',
      desc: t.watersSection.water2Desc,
      usage: t.watersSection.water2Usage,
      tag: language === 'vi' ? 'Giàu Hydro Chống Oxy Hóa' : 'Hydrogen Anti-Oxidant',
      icon: '💧',
    },
    {
      id: 2,
      title: t.watersSection.water3Title,
      ph: t.watersSection.water3Ph,
      color: 'from-emerald-600 to-teal-500',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      glow: 'shadow-emerald-500/20',
      desc: t.watersSection.water3Desc,
      usage: t.watersSection.water3Usage,
      tag: language === 'vi' ? 'Tinh Khiết Chuẩn Y Khoa' : 'Purified Medical Standard',
      icon: '✨',
    },
    {
      id: 3,
      title: t.watersSection.water4Title,
      ph: t.watersSection.water4Ph,
      color: 'from-amber-500 to-rose-400',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
      glow: 'shadow-rose-500/20',
      desc: t.watersSection.water4Desc,
      usage: t.watersSection.water4Usage,
      tag: language === 'vi' ? 'Chăm Sóc & Săn Chắc Da' : 'Skin Toning & Conditioning',
      icon: '🌸',
    },
    {
      id: 4,
      title: t.watersSection.water5Title,
      ph: t.watersSection.water5Ph,
      color: 'from-red-600 to-orange-600',
      badgeBg: 'bg-red-100 text-red-900 border-red-200',
      glow: 'shadow-red-500/20',
      desc: t.watersSection.water5Desc,
      usage: t.watersSection.water5Usage,
      tag: language === 'vi' ? 'Diệt Khuẩn 99.99% Y Tế' : '99.99% Medical Sanitization',
      icon: '⚡',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative min-h-[580px] sm:min-h-[660px] w-full bg-gradient-to-b from-[#0B1528] via-[#0D2040] to-[#0A162B] text-white overflow-hidden flex items-center">
        {/* Ambient lighting & mesh gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark border border-cyan-400/30 text-cyan-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12]">
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200">
                {t.hero.titleLine1}
              </span>
              <br />
              <span className="text-cyan-400 font-medium">
                {t.hero.titleLine2}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl font-light">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-7 py-3.5 text-xs uppercase tracking-wider font-semibold rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 mirror-sheen"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#waters-section"
                className="glass-dark-btn text-white px-6 py-3.5 text-xs uppercase tracking-wider font-medium rounded-xl border border-white/20 hover:border-cyan-400/50 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
              >
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>{t.hero.ctaSecondary}</span>
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10">
              <div className="glass-dark p-3 rounded-lg border border-white/10 text-center">
                <span className="block text-cyan-400 text-base font-bold">8</span>
                <span className="text-[11px] text-blue-200/90 leading-tight block mt-0.5">{t.hero.trustPlates}</span>
              </div>
              <div className="glass-dark p-3 rounded-lg border border-white/10 text-center">
                <span className="block text-cyan-400 text-base font-bold">-850 mV</span>
                <span className="text-[11px] text-blue-200/90 leading-tight block mt-0.5">{t.hero.trustOrp}</span>
              </div>
              <div className="glass-dark p-3 rounded-lg border border-white/10 text-center">
                <span className="block text-cyan-400 text-base font-bold">5 Năm</span>
                <span className="text-[11px] text-blue-200/90 leading-tight block mt-0.5">{t.hero.trustWarranty}</span>
              </div>
              <div className="glass-dark p-3 rounded-lg border border-white/10 text-center">
                <span className="block text-cyan-400 text-base font-bold">ISO 13485</span>
                <span className="text-[11px] text-blue-200/90 leading-tight block mt-0.5">{t.hero.trustMedical}</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md aspect-[4/5] rounded-3xl overflow-hidden glass-card p-4 border border-white/20 shadow-2xl">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=1200&auto=format&fit=crop"
                  alt="Enagic LeveLuk K8 Ionizer Medical Device"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-black/20" />
                <div className="absolute top-4 left-4 glass-dark text-cyan-300 text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border border-cyan-400/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LeveLuk K8 Flagship</span>
                </div>
                <div className="absolute bottom-4 inset-x-4 glass-modal p-4 rounded-xl border border-white/60 text-[#111111]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-900">Enagic® Osaka Japan</span>
                    <span className="text-emerald-700 font-bold">OEM Medical Certified</span>
                  </div>
                  <p className="text-xs text-[#444444] line-clamp-2">
                    {language === 'vi'
                      ? 'Trang bị 8 tấm điện cực Titan phủ Bạch kim 99.97% nguyên chất, tạo nước giàu hydro hoạt tính.'
                      : '8 Solid platinum-coated titanium plates generating hydrogen-rich micro-clustered water.'}
                  </p>
                  <Link
                    href="/product/enagic-leveluk-k8"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>{t.showcase.viewPiece}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST & MEDICAL VALUE PILLARS ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-blue-100 flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                {t.trustBar.item1Title}
              </h3>
              <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                {t.trustBar.item1Desc}
              </p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-blue-100 flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                {t.trustBar.item2Title}
              </h3>
              <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                {t.trustBar.item2Desc}
              </p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-blue-100 flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                {t.trustBar.item3Title}
              </h3>
              <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                {t.trustBar.item3Desc}
              </p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-blue-100 flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 flex-shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                {t.trustBar.item4Title}
              </h3>
              <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                {t.trustBar.item4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. INTERACTIVE 5 WATERS SECTION ─── */}
      <section id="waters-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t.watersSection.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#111111]">
            {t.watersSection.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
            {t.watersSection.subtitle}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-hide pb-3">
          {waterTypes.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveWaterTab(w.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 border ${
                activeWaterTab === w.id
                  ? 'bg-[#111111] text-white border-[#111111] shadow-md scale-105'
                  : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              <span>{w.icon}</span>
              <span>{w.ph}</span>
            </button>
          ))}
        </div>

        {/* Active Water Detail Banner */}
        <div className="mt-4 glass-card p-6 sm:p-10 rounded-3xl border border-blue-100 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${waterTypes[activeWaterTab].badgeBg}`}>
                  {waterTypes[activeWaterTab].ph}
                </span>
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {waterTypes[activeWaterTab].tag}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-medium text-[#111111]">
                {waterTypes[activeWaterTab].title}
              </h3>

              <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
                {waterTypes[activeWaterTab].desc}
              </p>

              <div className="p-4 rounded-xl bg-white/80 border border-black/5 shadow-2xs space-y-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-900 block">
                  {language === 'vi' ? 'Công dụng thực tế:' : 'Practical Applications:'}
                </span>
                <p className="text-xs sm:text-sm text-[#333333]">
                  {waterTypes[activeWaterTab].usage}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/shop?category=cat-ionizers"
                  className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-950 transition-all shadow-md"
                >
                  <span>{t.showcase.viewAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center shadow-lg">
              <span className="text-4xl sm:text-5xl font-extralight tracking-tight text-cyan-300">
                {waterTypes[activeWaterTab].ph}
              </span>
              <span className="text-xs uppercase tracking-widest text-blue-200 mt-2 font-medium">
                {waterTypes[activeWaterTab].title}
              </span>
              <p className="text-xs text-blue-100/80 mt-3 leading-relaxed">
                {language === 'vi'
                  ? 'Được sản xuất trực tiếp qua buồng điện giải tấm Titanium Bạch Kim Enagic Nhật Bản.'
                  : 'Electrolyzed on demand through Enagic solid Platinum-dipped Titanium plates.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FLAGSHIP IONIZERS SHOWCASE ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
              {t.showcase.bestSellersBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {t.showcase.bestSellersTitle}
            </h2>
          </div>
          <Link
            href="/shop?category=cat-ionizers"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-blue-700"
          >
            <span>{t.showcase.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flagshipIonizers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 5. MEDICAL CERTIFICATIONS & JAPANESE HERITAGE ─── */}
      <section id="certifications" className="bg-[#0B1528] text-white py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              {language === 'vi' ? 'Tiêu Chuẩn Toàn Cầu' : 'Global Standards'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight">
              {language === 'vi'
                ? 'Chứng Nhận Thiết Bị Y Tế & Con Dấu Vàng Quốc Tế'
                : 'Medical Device Certifications & International Gold Seals'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed font-light">
              {language === 'vi'
                ? 'Enagic® là thương hiệu máy điện giải duy nhất sở hữu quy trình sản xuất khép kín OEM đạt chứng nhận ISO 13485 dành riêng cho thiết bị y tế.'
                : 'Enagic® is the only water ionizer manufacturer worldwide to hold full OEM medical device ISO 13485 certification.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-dark p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold">
                ISO
              </div>
              <h3 className="text-sm font-semibold text-white">ISO 13485</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                {language === 'vi'
                  ? 'Chứng nhận hệ thống quản lý chất lượng thiết bị y tế quốc tế và giấy phép Bộ Y Tế Nhật Bản số 27BZ006010.'
                  : 'International Medical Device Quality Management System and Ministry of Health Japan license.'}
              </p>
            </div>

            <div className="glass-dark p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                WQA
              </div>
              <h3 className="text-sm font-semibold text-white">WQA Gold Seal</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                {language === 'vi'
                  ? 'Con dấu vàng chứng nhận chất lượng nước cao cấp nhất từ Hiệp hội Chất lượng Nước Hoa Kỳ (Water Quality Association).'
                  : 'Gold Seal certification of the highest water quality standard by the Water Quality Association USA.'}
              </p>
            </div>

            <div className="glass-dark p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                JAPA
              </div>
              <h3 className="text-sm font-semibold text-white">Hiệp Hội Bác Sĩ JAPA</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                {language === 'vi'
                  ? 'Được hơn 6,500 bác sĩ của Hiệp hội Phòng Bệnh Người Cao Tuổi Nhật Bản (JAPA) chính thức công nhận và khuyên dùng.'
                  : 'Officially endorsed by 6,500+ physicians of the Japanese Association of Preventive Medicine for Adult Diseases.'}
              </p>
            </div>

            <div className="glass-dark p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                OEM
              </div>
              <h3 className="text-sm font-semibold text-white">100% Made In Osaka</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                {language === 'vi'
                  ? 'Sản xuất đồng bộ và kiểm định nghiêm ngặt tại nhà máy Enagic Osaka, Nhật Bản từ năm 1974.'
                  : 'Engineered and hand-assembled under strict quality control at Enagic Osaka factory since 1974.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CATEGORIES NAVIGATION ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
              {t.shop.categories}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {language === 'vi' ? 'Hệ Sinh Thái Enagic® Kangen' : 'Enagic® Product Ecosystem'}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-blue-700"
          >
            <span>{t.shop.allCategories}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const catName = language === 'vi' ? cat.nameVi || cat.name : cat.nameEn || cat.name;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group flex flex-col text-center"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F5F4F0] rounded-2xl border border-black/[0.04] shadow-xs group-hover:shadow-md transition-all duration-300 mb-2.5">
                  <Image
                    src={cat.image}
                    alt={catName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:text-blue-700 transition-colors">
                  {catName}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 7. FILTERS & OFFICIAL ACCESSORIES ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
              {language === 'vi' ? 'Bảo Dưỡng & Phụ Kiện' : 'Care & Maintenance'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {language === 'vi' ? 'Lõi Lọc & Phụ Kiện Chính Hãng Enagic®' : 'Authentic Replacement Filters & Care'}
            </h2>
          </div>
          <Link
            href="/shop?category=cat-filters"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-blue-700"
          >
            <span>{t.showcase.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessoriesAndFilters.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 8. WATER TEST & DOCTOR CONSULTATION CTA BANNER ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              {language === 'vi' ? 'Khảo Sát Nước Miễn Phí Tại Nhà' : 'Complimentary In-Home Water Testing'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight leading-tight">
              {language === 'vi'
                ? 'Đo Đạc Chỉ Số Nguồn Nước & Tư Vấn Cấu Hình Điện Giải'
                : 'Schedule a Comprehensive Water Analysis & Ionizer Consultation'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
              {language === 'vi'
                ? 'Chuyên viên kỹ thuật Enagic sẽ đến tận nhà kiểm tra độ pH, nồng độ Clo dư, kim loại nặng và tư vấn bộ tiền lọc tối ưu nhất cho gia đình bạn hoàn toàn miễn phí.'
                : 'Our certified Enagic technicians will test your tap water pH, ORP, residual chlorine, and recommend the ideal pre-filtration setup free of charge.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:1900866814"
                className="bg-white text-blue-950 px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-4 h-4 text-blue-700" />
                <span>Hotline: 1900 866 814</span>
              </a>
              <Link
                href="/shop"
                className="glass-dark-btn text-white px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold border border-white/20 hover:border-cyan-400/50 active:scale-95 transition-all"
              >
                {t.hero.ctaPrimary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
