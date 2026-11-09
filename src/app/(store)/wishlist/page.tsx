'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const wishlist = useCommerceStore((state) => state.wishlist);
  const products = useCommerceStore((state) => state.products);

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#E5E5E5] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
            Saved Items
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Personal curation saved to your browser session ({savedProducts.length} items).
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold text-[#111111] hover:underline flex items-center gap-1.5"
        >
          Explore More Pieces <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#111111]">
            <Heart className="w-6 h-6 stroke-[1.2]" />
          </div>
          <h2 className="text-xl font-light text-[#111111]">Your Wishlist is Empty</h2>
          <p className="text-xs text-[#777777] mt-2 leading-relaxed">
            As you explore our collection, click the heart icon on any garment to preserve it here for
            future review.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#333333] transition-colors"
          >
            Start Browsing
          </Link>
        </div>
      )}
    </div>
  );
}
