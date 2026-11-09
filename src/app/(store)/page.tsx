'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, RefreshCw } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';

export default function HomePage() {
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  const newArrivals = products.filter((p) => p.newArrival && p.status === 'active').slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller && p.status === 'active').slice(0, 4);

  return (
    <div className="space-y-24 lg:space-y-32">
      {/* Hero Section */}
      <section className="relative h-[88vh] min-h-[580px] w-full bg-[#111111] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=2200&auto=format&fit=crop"
          alt="COS Minimal Autumn Collection"
          fill
          priority
          className="object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 lg:p-24 max-w-[1440px] mx-auto">
          <div className="max-w-xl text-white space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#D2C8BC] font-semibold">
              Capsule Collection 2026
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]">
              LESS, BUT BETTER.
            </h1>
            <p className="text-xs sm:text-sm text-[#D4D4D4] font-light leading-relaxed max-w-md">
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
                className="border border-white/70 text-white px-8 py-3.5 text-xs uppercase tracking-[0.18em] font-medium hover:bg-white/10 active:scale-[0.99] transition-all backdrop-blur-xs"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
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

      {/* New Arrivals */}
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
            View All ({newArrivals.length}+) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Collection Banner */}
      <section className="bg-[#F5F4F0] py-16 sm:py-24 border-y border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E5E5E5]">
              <Image
                src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200&auto=format&fit=crop"
                alt="Editorial Capsule"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6 lg:pl-6">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#777777] font-semibold">
                The Architectural Capsule
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#111111] leading-[1.12]">
                Sculptural Form.<br />Uncompromising Ease.
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-lg font-light">
                Engineered silhouettes inspired by modernist brutalism and tailored with fluid Japanese
                wool twill. Pieces conceived to transcend seasonal cycles and become permanent
                fixtures in your wardrobe.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop?category=cat-outerwear"
                  className="inline-block bg-[#111111] text-white px-8 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#333333] active:scale-[0.99] transition-all"
                >
                  Discover Tailoring
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
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

      {/* Brand Values / Philosophy */}
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
