'use client';

import { useState, useEffect } from 'react';
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

const TRUST_STATS = [
  { figure: '50+', label: 'Countries Worldwide' },
  { figure: '1974', label: 'Founded in Osaka' },
  { figure: '5-Yr', label: 'Factory Warranty' },
  { figure: 'ISO', label: '13485 Certified' },
];

export default function HomePage() {
  const { t } = useTranslation();

  const [heroIndex, setHeroIndex] = useState(0);

  const goHero = (delta: number) =>
    setHeroIndex((i) => (i + delta + HERO_IMAGES.length) % HERO_IMAGES.length);

  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      new window.Image().src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => goHero(1), 6000);
    return () => clearTimeout(timer);
  }, [heroIndex]);

  return (
    <div className="bg-[#0A0A0A] text-white">

      {/* ─── 1. FULLSCREEN CINEMATIC HERO ─── */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden flex items-center">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === heroIndex ? 'opacity-90' : 'opacity-0'}`}
          />
        ))}

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

        <h1 className="sr-only">Change Your Water. Change Your Life.</h1>
      </section>

      {/* ─── 2. OVERSIZED STAT CALLOUTS (replaces icon+text trust bar) ─── */}
      <section className="border-y border-white/[0.07] bg-[#0D0D0D]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.07]">
            {TRUST_STATS.map((s) => (
              <div key={s.figure} className="py-8 px-6 lg:px-10 flex flex-col gap-1 group">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-none group-hover:text-cyan-300 transition-colors duration-300">
                  {s.figure}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#555] font-mono mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
