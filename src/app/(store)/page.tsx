'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, RefreshCw, Volume2, VolumeX, Pause, Play, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';

const RUNWAY_REELS = [
  {
    id: 1,
    videoSrc: '/videos/runway.mp4',
    poster: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800',
    label: '[ 01 — OUTERWEAR ]',
    title: 'Cocoon Silhouettes',
    subtitle: 'Double-faced wool architecture',
    link: '/shop?category=cat-outerwear',
  },
  {
    id: 2,
    videoSrc: '/videos/hero.mp4',
    poster: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
    label: '[ 02 — SHIRTS ]',
    title: 'Fluid Precision',
    subtitle: 'Organic poplin & satin weaves',
    link: '/shop?category=cat-shirts',
  },
  {
    id: 3,
    videoSrc: '/videos/nature.mp4',
    poster: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    label: '[ 03 — KNITWEAR ]',
    title: 'Tactile Warmth',
    subtitle: 'Recycled cashmere & merino',
    link: '/shop?category=cat-knitwear',
  },
  {
    id: 4,
    videoSrc: '/videos/runway.mp4',
    poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
    label: '[ 04 — TROUSERS ]',
    title: 'Architectural Drape',
    subtitle: 'Japanese wool twill & flannel',
    link: '/shop?category=cat-trousers',
  },
];

function ReelCard({ reel }: { reel: typeof RUNWAY_REELS[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      className="group relative aspect-[9/16] overflow-hidden bg-[#111111] flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[300px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={reel.poster}
        alt={reel.title}
        fill
        className={`object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        sizes="300px"
      />
      <video
        ref={videoRef}
        src={reel.videoSrc}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

      {/* Play indicator */}
      <div className={`absolute top-3 right-3 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <span className="glass-dark text-white text-[9px] uppercase tracking-widest px-2.5 py-1 flex items-center gap-1 rounded-full">
          <Play className="w-2.5 h-2.5 fill-white" />
          Hover
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        <span className="text-[9px] text-[#B9A58B] uppercase tracking-[0.2em] font-semibold">{reel.label}</span>
        <h3 className="text-white font-light text-base sm:text-lg leading-tight mt-1">{reel.title}</h3>
        <p className="text-[#AAAAAA] text-[11px] mt-0.5 mb-3">{reel.subtitle}</p>
        <Link
          href={reel.link}
          className="inline-flex items-center gap-1 glass text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-white hover:text-[#111111] transition-all duration-300 font-semibold"
        >
          Shop Look <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
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
      reelScrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const newArrivals = products.filter((p) => p.newArrival && p.status === 'active').slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller && p.status === 'active').slice(0, 4);

  return (
    <div className="space-y-24 lg:space-y-32">
      {/* ─── 1. CINEMATIC VIDEO HERO ─── */}
      <section className="relative h-[92vh] min-h-[600px] w-full bg-[#0A0A0A] overflow-hidden">
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

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 lg:p-24">
          <div className="max-w-xl text-white space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#B9A58B] font-semibold">
              Capsule Collection SS26
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]">
              LESS,<br />BUT BETTER.
            </h1>
            <p className="text-xs sm:text-sm text-[#C8C8C8] font-light leading-relaxed max-w-md">
              Discover timeless essentials designed for everyday living. Tactile natural fabrics,
              precise architectural cuts, and calm Scandinavian palettes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-white text-[#111111] px-8 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#F5F4F0] active:scale-[0.99] transition-all shadow-md"
              >
                Explore Collection
              </Link>
              <Link
                href="/shop?filter=new"
                className="glass border border-white/40 text-white px-8 py-3.5 text-xs uppercase tracking-[0.18em] font-medium hover:bg-white/15 active:scale-[0.99] transition-all"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {/* Video controls — bottom right */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2">
          <button
            onClick={togglePause}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 transition-all"
            aria-label={heroPaused ? 'Play video' : 'Pause video'}
          >
            {heroPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="glass-dark text-white p-2.5 rounded-full hover:bg-white/20 transition-all"
            aria-label={heroMuted ? 'Unmute' : 'Mute'}
          >
            {heroMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <span className="text-[9px] text-white uppercase tracking-[0.25em]">Scroll</span>
          <div className="w-px h-10 bg-white/50 animate-pulse" />
        </div>
      </section>

      {/* ─── 2. RUNWAY REELS / LOOKBOOK STORIES ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777] font-semibold">
              Motion & Craft
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] mt-1">
              Runway Series
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollReels('left')}
              className="p-2 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollReels('right')}
              className="p-2 border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#111111] hover:text-white transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={reelScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {RUNWAY_REELS.map((reel) => (
            <div key={reel.id} className="snap-start flex-shrink-0">
              <ReelCard reel={reel} />
            </div>
          ))}

          {/* CTA tile */}
          <div className="snap-start flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[300px] aspect-[9/16] bg-[#111111] flex flex-col items-center justify-center gap-5 p-8">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4 text-[#B9A58B]" />
              </div>
              <p className="text-xs text-[#AAAAAA] leading-relaxed font-light">
                24 exclusive styles across 6 categories.
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-white text-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#F5F4F0] transition-all w-full text-center"
            >
              View All ↗
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-[#999999] mt-3 text-center sm:text-left">
          Hover over each piece to see it in motion.
        </p>
      </section>

      {/* ─── 3. FEATURED CATEGORIES ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777] font-semibold">
              Curated Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group flex flex-col text-center"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0] mb-3">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium text-[#111111] group-hover:text-[#B9A58B] transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 4. NEW ARRIVALS ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777] font-semibold">
              Latest Release
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 5. SPLIT-SCREEN CRAFTSMANSHIP VIDEO ─── */}
      <section className="bg-[#0A0A0A] py-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          {/* Video side */}
          <div className="relative min-h-[300px] lg:min-h-[520px] overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
            <div className="absolute bottom-6 left-6">
              <span className="glass-dark text-[#B9A58B] text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full font-semibold">
                [ Atelier Film — SS26 ]
              </span>
            </div>
          </div>

          {/* Text side */}
          <div className="bg-[#0A0A0A] flex flex-col justify-center p-10 sm:p-14 lg:p-16 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B9A58B] font-semibold">
              The Sourcing Manifesto
            </span>
            <h2 className="text-3xl sm:text-4xl text-white font-light tracking-tight leading-[1.15]">
              Quiet Luxury &<br />Conscious Craft.
            </h2>
            <p className="text-sm text-[#888888] leading-relaxed font-light max-w-md">
              Every silhouette is cut from responsibly sourced Japanese twill, heavyweight mulberry silk, and
              Mongolian cashmere — designed to outlive ephemeral seasonal trends and become permanent
              fixtures in your wardrobe.
            </p>

            {/* Stats glass cards row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { stat: '100%', label: 'Organic' },
                { stat: '24', label: 'Styles' },
                { stat: '30-Day', label: 'Returns' },
              ].map(({ stat, label }) => (
                <div key={label} className="glass-dark rounded-xl p-3 text-center">
                  <p className="text-white font-semibold text-lg leading-none">{stat}</p>
                  <p className="text-[#777777] text-[10px] uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 bg-white text-[#111111] px-6 py-3 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#F5F4F0] transition-all"
              >
                Shop the Edit <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop?category=cat-outerwear"
                className="inline-flex items-center gap-1.5 glass border border-white/20 text-white px-6 py-3 text-xs uppercase tracking-[0.18em] font-medium hover:bg-white/10 transition-all"
              >
                Outerwear
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BEST SELLERS ─── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777] font-semibold">
              Wardrobe Staples
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] mt-1">
              Signature Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold hover:underline flex items-center gap-1.5"
          >
            Explore Wardrobe <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 7. BRAND VALUES ─── */}
      <section className="border-t border-b border-[#E5E5E5] py-20 bg-[#FBFBFA]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
            <div className="space-y-3 px-4">
              <Leaf className="w-6 h-6 mx-auto text-[#111111] stroke-[1.4]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Conscious Materials</h3>
              <p className="text-xs text-[#777777] leading-relaxed font-light">
                100% sustainably sourced organic cotton, RWS certified wool, and recycled cashmere.
              </p>
            </div>
            <div className="space-y-3 px-4">
              <Sparkles className="w-6 h-6 mx-auto text-[#111111] stroke-[1.4]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Timeless Longevity</h3>
              <p className="text-xs text-[#777777] leading-relaxed font-light">
                Constructed with durable seams and classic cuts meant to endure for a decade.
              </p>
            </div>
            <div className="space-y-3 px-4">
              <ShieldCheck className="w-6 h-6 mx-auto text-[#111111] stroke-[1.4]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Ethical Craft</h3>
              <p className="text-xs text-[#777777] leading-relaxed font-light">
                Partnered exclusively with audited family-owned ateliers across Portugal and Italy.
              </p>
            </div>
            <div className="space-y-3 px-4">
              <RefreshCw className="w-6 h-6 mx-auto text-[#111111] stroke-[1.4]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Effortless Returns</h3>
              <p className="text-xs text-[#777777] leading-relaxed font-light">
                Complimentary 30-day returns and exchanges for a serene shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
