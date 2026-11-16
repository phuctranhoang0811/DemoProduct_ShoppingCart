'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1600&q=75',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1600&q=75',
];

export default function HomePage() {
  const { t } = useTranslation();

  const [heroIndex, setHeroIndex] = useState(0);

  const goHero = (delta: number) =>
    setHeroIndex((i) => (i + delta + HERO_IMAGES.length) % HERO_IMAGES.length);

  useEffect(() => {
    new window.Image().src = HERO_IMAGES[(heroIndex + 1) % HERO_IMAGES.length];
  }, [heroIndex]);

  useEffect(() => {
    const timer = setTimeout(() => goHero(1), 6000);
    return () => clearTimeout(timer);
  }, [heroIndex]);

  return (
    <div className="bg-[#0A0A0A] text-white">

      {/* ─── 1. FULLSCREEN CINEMATIC HERO ─── */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden flex items-center">
        {HERO_IMAGES.map((src, i) =>
          Math.abs(i - heroIndex) > 1 && !(heroIndex === 0 && i === HERO_IMAGES.length - 1) && !(heroIndex === HERO_IMAGES.length - 1 && i === 0) ? null : (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === heroIndex ? 'opacity-90' : 'opacity-0'}`}
          />
          )
        )}

        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        <button
          type="button"
          onClick={() => goHero(-1)}
          aria-label="Previous image"
          className="btn-tactile absolute left-4 bottom-5 sm:bottom-auto sm:left-6 sm:top-1/2 sm:-translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-dark border border-white/20 flex items-center justify-center hover:bg-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => goHero(1)}
          aria-label="Next image"
          className="btn-tactile absolute left-16 bottom-5 sm:left-auto sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-dark border border-white/20 flex items-center justify-center hover:bg-white/20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-8 right-6 sm:bottom-6 sm:right-12 z-30 text-xs font-mono tracking-widest text-white/80">
          {String(heroIndex + 1).padStart(2, '0')} / {HERO_IMAGES.length}
        </div>

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Change Your Water. Change Your Life.
          </h1>
          <p className="mt-4 max-w-md text-sm sm:text-base text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
            Genuine Enagic Kangen Water® ionizers with official warranty.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xs sm:max-w-none">
            <Link
              href="/shop"
              className="btn-tactile inline-flex items-center justify-center px-7 py-3.5 bg-white text-[#111111] text-xs uppercase tracking-wider font-bold hover:bg-white/90"
            >
              Shop Ionizers
            </Link>
            <Link
              href="/hellobee"
              className="btn-tactile inline-flex items-center justify-center px-7 py-3.5 border border-white/60 text-white text-xs uppercase tracking-wider font-bold hover:bg-white/10"
            >
              Hellobee Network
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
