'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Leaf,
  RefreshCw,
  Truck,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';

const RUNWAY_REELS = [
  {
    id: 1,
    videoSrc: '/videos/runway.mp4',
    poster: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800',
    label: 'Outerwear',
    title: 'Cocoon Silhouettes',
    subtitle: 'Double-faced wool architecture',
    link: '/shop?category=cat-outerwear',
  },
  {
    id: 2,
    videoSrc: '/videos/hero.mp4',
    poster: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
    label: 'Shirts',
    title: 'Fluid Precision',
    subtitle: 'Organic poplin & satin weaves',
    link: '/shop?category=cat-shirts',
  },
  {
    id: 3,
    videoSrc: '/videos/nature.mp4',
    poster: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    label: 'Knitwear',
    title: 'Tactile Warmth',
    subtitle: 'Recycled cashmere & merino',
    link: '/shop?category=cat-knitwear',
  },
  {
    id: 4,
    videoSrc: '/videos/runway.mp4',
    poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
    label: 'Trousers',
    title: 'Architectural Drape',
    subtitle: 'Japanese wool twill & flannel',
    link: '/shop?category=cat-trousers',
  },
];

function ReelCard({ reel }: { reel: (typeof RUNWAY_REELS)[0] }) {
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

  return (
    <div
      className="group relative aspect-[9/16] overflow-hidden bg-[#111111] rounded-sm flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] shadow-md"
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
        alt={reel.title}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

      {/* Play/Pause Status Pill */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="glass-dark text-white text-[10px] font-medium tracking-wider px-2.5 py-1 flex items-center gap-1 rounded-full shadow-xs">
          {isPlaying ? <Pause className="w-2.5 h-2.5 fill-white" /> : <Play className="w-2.5 h-2.5 fill-white" />}
          <span>{isPlaying ? 'Playing' : 'Preview'}</span>
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        <span className="text-[10px] text-[#B9A58B] uppercase tracking-widest font-semibold">{reel.label}</span>
        <h3 className="text-white font-medium text-base sm:text-lg leading-tight mt-1">{reel.title}</h3>
        <p className="text-[#CCCCCC] text-xs mt-0.5 mb-3 line-clamp-1">{reel.subtitle}</p>
        <Link
          href={reel.link}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-white text-[#111111] text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all"
        >
          <span>Shop Look</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const currency = useCommerceStore((state) => state.currency);

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

  const newArrivals = products.filter((p) => p.newArrival && p.status === 'active').slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller && p.status === 'active').slice(0, 8);

  const quickCategories = [
    { label: 'All Garments', href: '/shop' },
    { label: "Women's Collection", href: '/shop?gender=women' },
    { label: "Men's Collection", href: '/shop?gender=men' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Seasonal Sale', href: '/shop?filter=sale' },
    { label: 'Coats & Jackets', href: '/shop?category=cat-outerwear' },
    { label: 'Tailored Trousers', href: '/shop?category=cat-trousers' },
    { label: 'Poplin Shirts', href: '/shop?category=cat-shirts' },
  ];

  return (
    <div className="space-y-14 sm:space-y-20 pb-16">
      {/* ─── 1. BALANCED VIDEO HERO ─── */}
      <section className="relative h-[65vh] min-h-[460px] sm:h-[72vh] w-full bg-[#0A0A0A] overflow-hidden">
        {/* Ambient Video */}
        <video
          ref={heroVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          poster="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=2200&auto=format&fit=crop"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-20 max-w-[1440px] mx-auto">
          <div className="max-w-xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-white/20">
              Spring / Summer 2026 Archive
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1]">
              Timeless Simplicity.<br />Architectural Form.
            </h1>
            <p className="text-sm sm:text-base text-[#D4D4D4] font-normal leading-relaxed max-w-md">
              Enduring wardrobe essentials crafted from organic cotton, heavyweight wool, and recycled cashmere.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="bg-white text-[#111111] px-7 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-[0.98] transition-all rounded-xs shadow-md"
              >
                Shop All Collection
              </Link>
              <Link
                href="/shop?filter=sale"
                className="glass text-white px-7 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-white/20 active:scale-[0.98] transition-all rounded-xs flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-[#D2FF52]" />
                <span>Explore Sale</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Video controls */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2 z-10">
          <button
            onClick={togglePause}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md"
            aria-label={heroPaused ? 'Play video' : 'Pause video'}
            title={heroPaused ? 'Play' : 'Pause'}
          >
            {heroPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md"
            aria-label={heroMuted ? 'Unmute' : 'Mute'}
            title={heroMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {heroMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* ─── 2. TRUST & SHOPPER VALUE BAR ─── */}
      <section className="border-y border-[#E5E5E5] bg-[#FAF9F5] py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Truck className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">Free Worldwide Delivery</p>
                <p className="text-[11px] text-[#666666]">On all orders over {formatPrice(100, currency)}</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">30-Day Easy Returns</p>
                <p className="text-[11px] text-[#666666]">Complimentary home exchange</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Leaf className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">100% Certified Fabrics</p>
                <p className="text-[11px] text-[#666666]">Organic cotton & RWS wool</p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#111111] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#111111]">Guaranteed Security</p>
                <p className="text-[11px] text-[#666666]">Encrypted checkout & Apple Pay</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. QUICK ACCESS CATEGORY PILLS ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#777777] mr-1 flex-shrink-0">
            Quick Shop:
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

      {/* ─── 4. NEW ARRIVALS (8 ITEMS) ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              Seasonal Drop
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>View All ({newArrivals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 5. RUNWAY IN MOTION CAROUSEL ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              Fabric in Motion
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              Runway Series
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
          {RUNWAY_REELS.map((reel) => (
            <div key={reel.id} className="snap-start flex-shrink-0">
              <ReelCard reel={reel} />
            </div>
          ))}

          {/* Explore Catalog CTA Tile */}
          <div className="snap-start flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] aspect-[9/16] bg-[#111111] rounded-sm flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D2FF52]" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">Curated Capsule</h3>
              <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                24 timeless pieces engineered for quiet elegance.
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-white text-[#111111] px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all rounded-xs w-full"
            >
              Explore All Styles
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. CATEGORIES VISUAL GRID ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              Explore Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group flex flex-col text-center"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0] rounded-xs mb-2.5">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:underline transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 7. BEST SELLERS (8 ITEMS) ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] mt-0.5">
              Signature Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?filter=popular"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5 text-[#111111]"
          >
            <span>View All ({bestSellers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 8. SPLIT-SCREEN SOURCING MANIFESTO ─── */}
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
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200"
            >
              <source src="/videos/runway.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
            <div className="absolute bottom-6 left-6">
              <span className="glass-dark text-[#B9A58B] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full font-semibold">
                Atelier Film &bull; SS26
              </span>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 space-y-5 text-white">
            <span className="text-xs uppercase tracking-widest text-[#B9A58B] font-semibold">
              The Sourcing Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight leading-[1.15]">
              Quiet Luxury &<br />Conscious Craft.
            </h2>
            <p className="text-sm text-[#CCCCCC] leading-relaxed font-normal max-w-md">
              Every silhouette is cut from responsibly sourced Japanese twill, heavyweight mulberry silk, and
              Mongolian cashmere &mdash; designed to outlive ephemeral seasonal trends.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="glass-dark rounded-md p-3 text-center">
                <p className="text-white font-bold text-lg leading-none">100%</p>
                <p className="text-[#AAAAAA] text-[11px] uppercase tracking-wider mt-1">Organic</p>
              </div>
              <div className="glass-dark rounded-md p-3 text-center">
                <p className="text-white font-bold text-lg leading-none">24</p>
                <p className="text-[#AAAAAA] text-[11px] uppercase tracking-wider mt-1">Styles</p>
              </div>
              <div className="glass-dark rounded-md p-3 text-center">
                <p className="text-white font-bold text-lg leading-none">30-Day</p>
                <p className="text-[#AAAAAA] text-[11px] uppercase tracking-wider mt-1">Returns</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 bg-white text-[#111111] px-6 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] active:scale-95 transition-all rounded-xs"
              >
                <span>Shop the Edit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop?category=cat-outerwear"
                className="inline-flex items-center gap-1.5 glass text-white px-6 py-3 text-xs uppercase tracking-wider font-medium hover:bg-white/10 active:scale-95 transition-all rounded-xs"
              >
                Outerwear
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
