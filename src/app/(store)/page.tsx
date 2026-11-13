'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  RefreshCw,
  Truck,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Award,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ProductCard } from '@/components/product/ProductCard';

const IONIZER_REELS = [
  {
    id: 1,
    videoSrc: '/videos/hero.mp4',
    poster: 'https://e-store.enagic.com/media/catalog/product/cache/ac965754380c71ee6f8be10b6f457a7a/1/0/1016_1_1.png',
    label: 'LeveLuk K8',
    title: 'The Mighty 8-Plate',
    titleVi: 'Đỉnh Cao 8 Tấm Titan',
    subtitle: 'Full-color multi-language touchscreen',
    subtitleVi: 'Màn hình cảm ứng 8 thứ tiếng, ORP -850mV',
    link: '/product/enagic-leveluk-k8',
  },
  {
    id: 2,
    videoSrc: '/videos/nature.mp4',
    poster: 'https://e-store.enagic.com/media/catalog/product/cache/ac965754380c71ee6f8be10b6f457a7a/1/0/1064_1.png',
    label: 'LeveLuk SD501',
    title: 'The Global Icon',
    titleVi: 'Biểu Tượng Toàn Cầu',
    subtitle: '7 Large solid platinum-coated plates',
    subtitleVi: '7 Tấm điện cực lớn, độ bền trên 25 năm',
    link: '/product/enagic-leveluk-sd501',
  },
  {
    id: 3,
    videoSrc: '/videos/runway.mp4',
    poster: 'https://e-store.enagic.com/media/catalog/product/cache/ac965754380c71ee6f8be10b6f457a7a/1/0/1041_1.jpg',
    label: 'Anespa DX',
    title: 'Mineral Ion Spa',
    titleVi: 'Khoáng Tắm Onsen Nhật',
    subtitle: 'Removes 100% residual chlorine',
    subtitleVi: 'Loại bỏ hoàn toàn Clo, dưỡng da và tóc',
    link: '/product/enagic-anespa-dx',
  },
  {
    id: 4,
    videoSrc: '/videos/hero.mp4',
    poster: 'https://e-store.enagic.com/media/catalog/product/cache/ac965754380c71ee6f8be10b6f457a7a/1/0/1007_01.jpg',
    label: 'Super 501',
    title: 'Commercial Output',
    titleVi: 'Công Suất Lớn 12 Tấm',
    subtitle: 'Dual chambers for clinics & heavy use',
    subtitleVi: 'Buồng điện phân kép cho phòng khám & gia đình',
    link: '/product/enagic-leveluk-super-501',
  },
];

function ReelCard({ reel }: { reel: (typeof IONIZER_REELS)[0] }) {
  const { language } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const title = language === 'vi' ? reel.titleVi : reel.title;
  const subtitle = language === 'vi' ? reel.subtitleVi : reel.subtitle;

  return (
    <div
      className="group relative aspect-[9/16] overflow-hidden bg-[#111111] rounded-2xl flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] shadow-lg border border-white/10"
      onMouseEnter={() => {
        videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      }}
      onClick={handlePlayToggle}
    >
      <Image
        src={reel.poster}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        sizes="280px"
      />
      <video
        ref={videoRef}
        src={reel.videoSrc}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />

      {/* Play/Pause Pill */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="glass-dark text-white text-[10px] font-medium tracking-wider px-2.5 py-1 flex items-center gap-1 rounded-full shadow-xs">
          {isPlaying ? <Pause className="w-2.5 h-2.5 fill-white" /> : <Play className="w-2.5 h-2.5 fill-white" />}
          <span>{isPlaying ? 'Playing' : 'Preview'}</span>
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold drop-shadow-sm">{reel.label}</span>
        <h3 className="text-white font-medium text-base sm:text-lg leading-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">{title}</h3>
        <p className="text-[#E0E0E0] text-xs mt-0.5 mb-3 line-clamp-1 drop-shadow-sm">{subtitle}</p>
        <Link
          href={reel.link}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-white text-[#111111] text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all shadow-md mirror-sheen"
        >
          <span>{language === 'vi' ? 'Xem Máy' : 'Explore'}</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useTranslation();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const [heroPaused, setHeroPaused] = useState(false);
  const reelScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroMuted;
      setHeroMuted(!heroMuted);
    }
  };

  const togglePause = () => {
    if (heroVideoRef.current) {
      if (heroPaused) {
        heroVideoRef.current.play();
      } else {
        heroVideoRef.current.pause();
      }
      setHeroPaused(!heroPaused);
    }
  };

  const scrollReels = (dir: 'left' | 'right') => {
    if (reelScrollRef.current) {
      reelScrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const newArrivals = products.filter((p) => p.status === 'active').slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller && p.status === 'active').slice(0, 8);

  const quickCategories = [
    { label: language === 'vi' ? 'Tất Cả Thiết Bị' : 'All Products', href: '/shop' },
    { label: language === 'vi' ? 'Máy Điện Giải (K8 / SD501)' : 'Ionizers (K8 / SD501)', href: '/shop?category=cat-ionizers' },
    { label: language === 'vi' ? 'Khoáng Tắm Anespa' : 'Mineral Spa (Anespa)', href: '/shop?category=cat-spa' },
    { label: language === 'vi' ? 'Lõi Lọc Chính Hãng FC1' : 'High-Grade Filters', href: '/shop?category=cat-filters' },
    { label: language === 'vi' ? 'Muối & Bộ Vệ Sinh E-Cleaner' : 'Care & Maintenance', href: '/shop?category=cat-accessories' },
    { label: language === 'vi' ? 'Bình Chống Tia UV' : 'Water Bottles & Tanks', href: '/shop?category=cat-bottles' },
  ];

  return (
    <div className="space-y-14 sm:space-y-20 pb-16">
      {/* ─── 1. MINIMAL VIDEO HERO ─── */}
      <section className="relative h-[65vh] min-h-[460px] sm:h-[72vh] w-full bg-[#0A0A0A] overflow-hidden">
        {/* Ambient Video */}
        <video
          ref={heroVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          poster="https://images.unsplash.com/photo-1546554137-f86b9593a222?q=85&w=2200&auto=format&fit=crop"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays for cinematic legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-20 max-w-[1440px] mx-auto z-10 pointer-events-none">
          <div className="max-w-xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 pointer-events-auto">
            <span className="inline-block glass-dark text-white text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/25 shadow-md">
              {t.hero.badge}
            </span>
            <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              {t.hero.titleLine1}<br />{t.hero.titleLine2}
            </h1>
            <p className="text-sm sm:text-base text-[#F0F0F0] font-normal leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              {t.hero.subtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="bg-white text-[#111111] px-7 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-[0.98] transition-all rounded-xs shadow-lg mirror-sheen"
              >
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href="/shop?category=cat-ionizers"
                className="glass-dark-btn text-white px-7 py-3 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all rounded-xs flex items-center gap-2 mirror-sheen border border-white/30 shadow-lg hover:border-white/60"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-white font-medium">{t.hero.ctaSecondary}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Video controls */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2 z-10">
          <button
            onClick={togglePause}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md"
            aria-label={heroPaused ? 'Play' : 'Pause'}
            title={heroPaused ? 'Play' : 'Pause'}
          >
            {heroPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md"
            aria-label={heroMuted ? 'Unmute' : 'Mute'}
            title={heroMuted ? 'Unmute' : 'Mute'}
          >
            {heroMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* ─── 2. TRUST & VALUE BAR (FAF9F5) ─── */}
      <section className="border-y border-[#E5E5E5] bg-[#FAF9F5] py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Truck className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">{t.trustBar.item4Title}</p>
                <p className="text-[11px] text-[#666666]">{t.trustBar.item4Desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">{t.trustBar.item3Title}</p>
                <p className="text-[11px] text-[#666666]">{t.trustBar.item3Desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Zap className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">{t.trustBar.item2Title}</p>
                <p className="text-[11px] text-[#666666]">{t.trustBar.item2Desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">{t.trustBar.item1Title}</p>
                <p className="text-[11px] text-[#666666]">{t.trustBar.item1Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. QUICK ACCESS CATEGORY PILLS ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#777777] mr-1 flex-shrink-0">
            {language === 'vi' ? 'Nhóm Máy:' : 'Quick Shop:'}
          </span>
          {quickCategories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex-shrink-0 px-4 py-2 rounded-full border border-[#E5E5E5] bg-white text-xs font-medium text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-all duration-150 shadow-2xs"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 4. NEW GENERATION IONIZERS (8 ITEMS) ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              {t.showcase.newArrivalsBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {t.showcase.newArrivalsTitle}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>{t.showcase.viewAll} ({newArrivals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 5. SERIES IN MOTION CAROUSEL ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              {language === 'vi' ? 'Công Nghệ Điện Phân' : 'Engineering in Motion'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {language === 'vi' ? 'Dòng Máy LeveLuk Series' : 'LeveLuk Series'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollReels('left')}
              className="p-2 rounded-full border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollReels('right')}
              className="p-2 rounded-full border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={reelScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {IONIZER_REELS.map((reel) => (
            <div key={reel.id} className="snap-start flex-shrink-0">
              <ReelCard reel={reel} />
            </div>
          ))}

          {/* Explore Catalog CTA Tile */}
          <div className="snap-start flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] aspect-[9/16] bg-[#111111] rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-5 p-8 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">
                {language === 'vi' ? 'Tiêu Chuẩn Y Tế' : 'Medical Grade'}
              </h3>
              <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                {language === 'vi'
                  ? 'Sản xuất đồng bộ 100% tại nhà máy Enagic Osaka, Nhật Bản.'
                  : 'Hand-assembled under strict ISO 13485 standards in Osaka, Japan.'}
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-white text-[#111111] px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all rounded-xs w-full"
            >
              {t.showcase.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. CATEGORIES VISUAL GRID ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              {language === 'vi' ? 'Danh Mục Sản Phẩm' : 'Explore Taxonomy'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {t.shop.categories}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>{t.shop.allCategories}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => {
            const catName = language === 'vi' ? category.nameVi || category.name : category.nameEn || category.name;
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="group flex flex-col text-center"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0] rounded-2xl border border-black/[0.04] shadow-xs group-hover:shadow-md transition-all duration-300 mb-2.5">
                  <Image
                    src={category.image}
                    alt={catName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:underline transition-colors">
                  {catName}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 7. SIGNATURE BEST SELLERS (8 ITEMS) ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              {t.showcase.bestSellersBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              {t.showcase.bestSellersTitle}
            </h2>
          </div>
          <Link
            href="/shop?filter=popular"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>{t.showcase.viewAll} ({bestSellers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 8. SPLIT-SCREEN OSAKA ATELIER MANIFESTO ─── */}
      <section className="bg-[#0A0A0A] overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
          {/* Video side */}
          <div className="relative min-h-[300px] lg:min-h-[480px] overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
              poster="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200"
            >
              <source src="/videos/runway.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
            <div className="absolute bottom-6 left-6">
              <span className="glass-dark text-[#FAF7F2] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full font-semibold border border-white/30 drop-shadow-sm">
                Enagic® Osaka Atelier &bull; Est. 1974
              </span>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 space-y-5 text-white">
            <span className="text-xs uppercase tracking-widest text-[#B9A58B] font-semibold">
              {language === 'vi' ? 'Triết Lý Chế Tác Y Khoa' : 'The Manufacturing Philosophy'}
            </span>
            <h2 className="text-white text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {language === 'vi' ? (
                <>Chuẩn Mực Y Tế &<br />Độ Bền Vượt Thời Gian.</>
              ) : (
                <>Medical Precision &<br />Uncompromising Purity.</>
              )}
            </h2>
            <p className="text-sm text-[#CCCCCC] leading-relaxed font-normal max-w-md drop-shadow-sm">
              {language === 'vi'
                ? 'Mỗi thiết bị Enagic được sản xuất đồng bộ tại Osaka, Nhật Bản với tấm điện cực Titan phủ Bạch Kim nguyên chất 99.97% — tạo nguồn nước chống oxy hóa bền bỉ suốt nhiều thập kỷ.'
                : 'Every Enagic ionizer is manufactured under one roof in Osaka, Japan with 99.97% pure platinum-dipped titanium plates — delivering active hydrogen antioxidant water built to last.'}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="glass-dark rounded-md p-3 text-center border border-white/20">
                <p className="text-white font-bold text-lg leading-none">8 Tấm</p>
                <p className="text-[#AAAAAA] text-[11px] font-medium uppercase tracking-wider mt-1">Titanium</p>
              </div>
              <div className="glass-dark rounded-md p-3 text-center border border-white/20">
                <p className="text-white font-bold text-lg leading-none">-850 mV</p>
                <p className="text-[#AAAAAA] text-[11px] font-medium uppercase tracking-wider mt-1">ORP Âm</p>
              </div>
              <div className="glass-dark rounded-md p-3 text-center border border-white/20">
                <p className="text-white font-bold text-lg leading-none">5 Năm</p>
                <p className="text-[#AAAAAA] text-[11px] font-medium uppercase tracking-wider mt-1">Bảo Hành</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 bg-white text-[#111111] px-6 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all rounded-xs mirror-sheen"
              >
                <span>{t.showcase.viewAll}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop?category=cat-filters"
                className="inline-flex items-center gap-1.5 glass-dark-btn text-white px-6 py-3 text-xs uppercase tracking-wider font-medium active:scale-95 transition-all rounded-xs mirror-sheen"
              >
                {t.nav.accessories}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
