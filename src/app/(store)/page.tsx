'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Truck,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Sparkles,
  Droplets,
  CheckCircle2,
  Award,
  X,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const KANGEN_WATER_TYPES = [
  {
    ph: '11.5',
    tag: 'Non-Drinking',
    label: 'Strong Kangen',
    color: 'text-purple-300',
    accent: 'bg-purple-500',
    borderColor: 'border-purple-500/30',
    title: 'Extraordinary cleaning and emulsifying power. Dissolves agricultural chemicals and grease without detergents.',
  },
  {
    ph: '8.5–9.5',
    tag: 'Daily Drinking',
    label: 'Kangen Drinking®',
    color: 'text-cyan-300',
    accent: 'bg-cyan-400',
    borderColor: 'border-cyan-500/30',
    title: 'Antioxidant-rich alkaline ionized water with active molecular hydrogen and negative ORP down to -850 mV.',
  },
  {
    ph: '7.0',
    tag: 'Neutral',
    label: 'Clean Water',
    color: 'text-emerald-300',
    accent: 'bg-emerald-400',
    borderColor: 'border-emerald-500/30',
    title: 'Purified through activated carbon. Ideal for medications and preparing infant formula.',
  },
  {
    ph: '4.0–6.0',
    tag: 'Personal Care',
    label: 'Beauty Water',
    color: 'text-amber-300',
    accent: 'bg-amber-400',
    borderColor: 'border-amber-500/30',
    title: 'Matches human skin pH. Functions as a natural astringent toner for pores, skin, and hair.',
  },
  {
    ph: '2.5',
    tag: 'Sanitizing',
    label: 'Strong Acidic',
    color: 'text-rose-300',
    accent: 'bg-rose-500',
    borderColor: 'border-rose-500/30',
    title: 'Hypochlorous acid with hospital-grade antimicrobial efficacy. Endorsed for kitchen disinfection in Japan.',
  },
];

const TRUST_STATS = [
  { figure: '50+', label: 'Countries Worldwide' },
  { figure: '1974', label: 'Founded in Osaka' },
  { figure: '5-Yr', label: 'Factory Warranty' },
  { figure: 'ISO', label: '13485 Certified' },
];

export default function HomePage() {
  const { t } = useTranslation();

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const [heroPaused, setHeroPaused] = useState(false);
  const [activeWater, setActiveWater] = useState(1);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTrailerModalOpen) {
        setIsTrailerModalOpen(false);
        heroVideoRef.current?.play().catch(() => {});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrailerModalOpen]);

  const toggleHeroMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroMuted;
      setHeroMuted(!heroMuted);
    }
  };

  const toggleHeroPause = () => {
    if (heroVideoRef.current) {
      if (heroPaused) {
        heroVideoRef.current.play();
      } else {
        heroVideoRef.current.pause();
      }
      setHeroPaused(!heroPaused);
    }
  };

  const handlePlayReview = () => {
    heroVideoRef.current?.pause();
    setIsTrailerModalOpen(true);
  };

  const active = KANGEN_WATER_TYPES[activeWater];

  return (
    <div className="bg-[#0A0A0A] text-white">

      {/* ─── 1. FULLSCREEN CINEMATIC HERO ─── */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden flex items-end">
        <video
          ref={heroVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
          poster="https://images.unsplash.com/photo-1546554137-f86b9593a222?q=85&w=2200&auto=format&fit=crop"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none" />

        <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pb-16 sm:pb-24 z-20">
          <div className="max-w-2xl text-white space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 glass-dark text-white text-[11px] font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/25">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Product Trailer & Review</span>
              </span>
              <span className="text-[11px] tracking-widest text-[#B9A58B] uppercase font-mono font-medium hidden sm:inline">
                Osaka Atelier • Est. 1974
              </span>
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-[64px] font-normal tracking-tight leading-[1.08] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              Change Your Water.<br />Change Your Life.®
            </h1>

            <p className="text-sm sm:text-base text-[#F0F0F0] font-normal leading-relaxed max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              Watch the official Enagic® product trailer review. Original Japanese medical-grade water ionizers engineered with solid platinum-dipped titanium plates.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="bg-white text-[#111111] px-8 py-3.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] btn-tactile transition-all rounded-xs shadow-lg mirror-sheen flex items-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handlePlayReview}
                className="glass-dark-btn text-white px-7 py-3.5 text-xs uppercase tracking-wider font-semibold btn-tactile transition-all rounded-xs flex items-center gap-2 border border-white/30 hover:border-white/60"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Watch Trailer Review</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 flex items-center gap-2.5 z-20">
          <button
            onClick={toggleHeroPause}
            className="glass-dark text-white p-3 rounded-full hover:bg-white/20 active:scale-95 transition-all"
            aria-label={heroPaused ? 'Play' : 'Pause'}
          >
            {heroPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleHeroMute}
            className="glass-dark text-white p-3 rounded-full hover:bg-white/20 active:scale-95 transition-all"
            aria-label={heroMuted ? 'Unmute' : 'Mute'}
          >
            {heroMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
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

      {/* ─── 3. EDITORIAL SPLIT — Engineering Specs ─── */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">

          {/* Left — sticky editorial anchor */}
          <div className="lg:sticky lg:top-28 space-y-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#B9A58B] font-semibold">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Japanese Medical Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight">
              Built for a<br />
              <em className="not-italic text-cyan-300">Lifetime</em> of<br />
              Cellular Health.
            </h2>
            <p className="text-sm text-[#888] leading-relaxed max-w-sm">
              Every Enagic® ionizer is hand-assembled in Osaka under strict ISO 13485 medical device certification — an engineering standard maintained since 1974.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-white hover:text-cyan-300 transition-colors pt-2"
            >
              Browse All Models <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right — numbered spec items */}
          <div className="space-y-0 divide-y divide-white/[0.07]">
            {[
              {
                num: '01',
                badge: 'Electrode Chamber',
                title: 'Solid Platinum-Coated Titanium',
                desc: '99.97% pure medical-grade solid titanium plates electroplated with continuous platinum for exceptional electrical conductivity and zero corrosion over decades.',
                metric: '99.97% Pure Platinum-Titanium',
                Icon: Sparkles,
              },
              {
                num: '02',
                badge: 'Electrolysis Power',
                title: 'Negative ORP to −850 mV',
                desc: 'Continuous DC electrolysis generates concentrated dissolved molecular hydrogen (H₂), transforming tap water into a potent antioxidant beverage that neutralizes free radicals.',
                metric: 'Up to −850 mV Active ORP',
                Icon: Zap,
              },
              {
                num: '03',
                badge: 'Manufacturing Standard',
                title: 'ISO 13485 Medical Device License',
                desc: 'Every unit individually hand-assembled in Osaka by master technicians under Japan Ministry of Health, Labour and Welfare certification.',
                metric: 'Certified Medical Device Factory',
                Icon: ShieldCheck,
              },
            ].map((p) => (
              <div key={p.num} className="py-8 group grid grid-cols-[48px_1fr] gap-6">
                <span className="text-xs font-mono text-[#444] mt-1 select-none">{p.num}</span>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#666]">{p.badge}</span>
                  <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#888] leading-relaxed">{p.desc}</p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-cyan-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    {p.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. INTERACTIVE 5 WATERS — Tab + Feature Panel ─── */}
      <section className="border-t border-white/[0.07] bg-[#0D0D0D] py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-[#B9A58B] font-semibold font-mono">
                Versatile Electrolysis Output
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
                5 Distinct Water Types
              </h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-wider font-semibold text-[#777] hover:text-white transition-colors flex items-center gap-1.5 shrink-0">
              View Compatible Models <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none mb-10">
            {KANGEN_WATER_TYPES.map((w, i) => (
              <button
                key={w.label}
                onClick={() => setActiveWater(i)}
                className={`shrink-0 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeWater === i
                    ? 'bg-white text-[#0A0A0A] border-white'
                    : 'border-white/15 text-[#777] hover:border-white/40 hover:text-white'
                }`}
              >
                pH {w.ph}
              </button>
            ))}
          </div>

          {/* Feature panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center">
            {/* Decorative pH number */}
            <div className="relative flex items-center justify-center min-h-[220px] select-none overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111]">
              <span
                className={`absolute text-[160px] sm:text-[220px] font-black leading-none ${active.color} opacity-[0.08] pointer-events-none tracking-tighter`}
              >
                {active.ph}
              </span>
              <div className="relative z-10 text-center space-y-3 px-8">
                <div className={`inline-block w-3 h-3 rounded-full ${active.accent} mb-2`} />
                <p className={`text-5xl sm:text-6xl font-light ${active.color} tracking-tight`}>
                  pH {active.ph}
                </p>
                <span className="block text-[11px] uppercase tracking-widest text-[#555] font-mono">
                  {active.tag}
                </span>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-5 py-4">
              <h3 className={`text-2xl sm:text-3xl font-semibold ${active.color} tracking-tight`}>
                {active.label}
              </h3>
              <div className={`w-10 h-px ${active.accent}`} />
              <p className="text-sm text-[#AAAAAA] leading-relaxed max-w-md">
                {active.title}
              </p>
              <div className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${active.color} border ${active.borderColor} px-3 py-1.5 rounded-full`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active.accent}`} />
                {active.tag}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. OFFICIAL QUALITY CERTIFICATIONS & ACCREDITATIONS ─── */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-20 sm:py-24">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20">

          {/* Left — editorial label */}
          <div className="shrink-0 lg:w-56 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#555] font-mono">
              Global Accreditations
            </span>
            <h3 className="text-xl sm:text-2xl font-light text-white leading-snug">
              Quality You<br />Can Certify.
            </h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Every Enagic® ionizer meets the world's most demanding industrial, environmental, and medical quality standards.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-white/[0.08]" />

          {/* Right — official accreditation badges */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              {
                code: 'ISO 13485:2016',
                org: 'ISO / IEC Compliant',
                title: 'Medical Devices QA',
                desc: 'Stringent standard for medical equipment design and cleanroom production in Osaka.',
                logoSrc: '/images/certifications/iso-13485.svg',
                isPng: false,
                accentColor: 'text-cyan-300',
              },
              {
                code: 'ISO 9001:2015',
                org: 'ISO / IEC Compliant',
                title: 'Quality Management',
                desc: 'Rigorous end-to-end quality inspection across every manufacturing phase.',
                logoSrc: '/images/certifications/iso-9001.svg',
                isPng: false,
                accentColor: 'text-blue-300',
              },
              {
                code: 'ISO 14001:2015',
                org: 'ISO / IEC Compliant',
                title: 'Environmental Systems',
                desc: 'Eco-conscious manufacturing certified for reduced environmental footprint.',
                logoSrc: '/images/certifications/iso-14001.svg',
                isPng: false,
                accentColor: 'text-emerald-300',
              },
              {
                code: 'WQA Gold Seal',
                org: 'Water Quality Association',
                title: 'Gold Seal Certified',
                desc: 'Highest global water quality accreditation awarded under NSF/ANSI standards.',
                logoSrc: '/images/certifications/wqa-gold-seal.png',
                isPng: true,
                accentColor: 'text-amber-300',
              },
            ].map((acc) => (
              <div
                key={acc.code}
                className="group flex flex-col items-center text-center gap-3.5 p-5 rounded-2xl border border-white/[0.08] bg-[#111111] hover:border-white/25 hover:bg-[#141414] transition-all duration-300"
              >
                {/* Official Certification Emblem Container */}
                <div className="relative w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={acc.logoSrc}
                    alt={`${acc.title} Official Certification`}
                    width={72}
                    height={72}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Code & Standard */}
                <div className="space-y-0.5">
                  <span className={`block text-xs font-mono font-bold tracking-tight ${acc.accentColor}`}>
                    {acc.code}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#666] font-mono">
                    {acc.org}
                  </span>
                </div>

                {/* Micro hairline divider */}
                <div className="w-8 h-px bg-white/10" />

                {/* Title + Desc */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {acc.title}
                  </p>
                  <p className="text-[10px] text-[#777] leading-relaxed">
                    {acc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FULL-BLEED EDITORIAL CTA ─── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] border-t border-white/[0.07]">
        {/* Background runway video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <source src="/videos/runway.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-24 sm:py-32">
          <div className="max-w-xl space-y-6">
            <span className="text-[11px] uppercase tracking-widest text-[#B9A58B] font-semibold font-mono">
              Official Enagic® Japan Store
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
              Upgrade Your<br />
              Family's<br />
              <em className="not-italic text-cyan-300">Hydration.</em>
            </h2>
            <p className="text-sm text-[#888] leading-relaxed max-w-sm">
              Explore medical water ionizers, certified replacement filters, and mineral spa systems — all backed by a 5-year factory warranty.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="bg-white text-[#111111] px-8 py-3.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] btn-tactile transition-all rounded-xs shadow-lg flex items-center gap-2"
              >
                Browse All Products
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/calculator"
                className="glass-dark-btn text-white px-7 py-3.5 text-xs uppercase tracking-wider font-semibold btn-tactile transition-all rounded-xs border border-white/30 hover:border-white/60"
              >
                Tax & Commission Calculator
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative trust bar inside CTA */}
        <div className="relative z-10 border-t border-white/[0.07]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07]">
              {[
                { Icon: Truck, label: t.trustBar.item4Title, sub: t.trustBar.item4Desc },
                { Icon: RefreshCw, label: t.trustBar.item3Title, sub: t.trustBar.item3Desc },
                { Icon: Zap, label: t.trustBar.item2Title, sub: t.trustBar.item2Desc },
                { Icon: ShieldCheck, label: t.trustBar.item1Title, sub: t.trustBar.item1Desc },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 py-5 px-5 lg:px-8">
                  <Icon className="w-4 h-4 text-[#555] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#CCCCCC] leading-none">{label}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ENAGIC PRODUCT TRAILER LIGHTBOX MODAL ─── */}
      {isTrailerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setIsTrailerModalOpen(false);
            heroVideoRef.current?.play().catch(() => {});
          }}
        >
          <div
            className="relative w-full max-w-4xl bg-[#111111] border border-white/20 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                    Official Enagic® LeveLuk K8 Product Trailer
                  </h3>
                  <p className="text-[11px] text-[#888]">
                    The Mighty 8-Plate Medical Water Ionizer • 5-Year Factory Warranty
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTrailerModalOpen(false);
                  heroVideoRef.current?.play().catch(() => {});
                }}
                className="text-[#888] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/Ka8CD9W4Ywg?autoplay=1&rel=0"
                title="Enagic LeveLuk K8 Official Product Showcase"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#141414] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-[#888]">
                <span>• 8 Solid Platinum-Dipped Titanium Plates</span>
                <span>• pH 2.5 - 11.5 Spectrum</span>
                <span>• ORP down to -850 mV</span>
              </div>
              <Link
                href="/product/enagic-leveluk-k8"
                onClick={() => setIsTrailerModalOpen(false)}
                className="bg-white text-[#111111] px-5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F4F0] btn-tactile transition-all rounded-xs flex items-center gap-1.5"
              >
                <span>View K8 Machine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
