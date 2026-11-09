'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';
import { QuickAddModal } from './QuickAddModal';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  density?: 'editorial' | 'catalog';
}

export function ProductCard({ product, density = 'catalog' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const isInWishlist = useCommerceStore((state) => state.isInWishlist(product.id));

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isInWishlist) {
      toast.success(`Saved "${product.name}" to wishlist.`);
    } else {
      toast.info(`Removed "${product.name}" from wishlist.`);
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickAddOpen(true);
  };

  const displayImage = isHovered && product.images[1] ? product.images[1] : product.images[0];
  const isEditorial = density === 'editorial';

  return (
    <>
      <div
        className="group relative flex flex-col bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with 3:4 aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0]">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes={isEditorial ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            />
          </Link>

          {/* Luxury Floating "VIEW" Pill on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white/90 backdrop-blur-md text-[#111111] text-[10px] uppercase font-semibold tracking-[0.2em] px-4 py-2 border border-black/5 shadow-xs flex items-center gap-1">
              <span>View Piece</span>
              <ArrowUpRight className="w-3 h-3 stroke-[1.5]" />
            </span>
          </div>

          {/* Editorial Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.sale && product.originalPrice && (
              <span className="bg-[#B74747] text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5">
                Sale
              </span>
            )}
            {product.newArrival && (
              <span className="bg-[#111111] text-white text-[9px] uppercase font-medium tracking-widest px-2 py-0.5">
                New
              </span>
            )}
          </div>

          {/* Minimalist Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 ${
              isInWishlist
                ? 'bg-white text-[#B74747] shadow-sm'
                : 'bg-white/80 text-[#111111] hover:bg-white hover:scale-110'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 stroke-[1.5] ${isInWishlist ? 'fill-[#B74747]' : ''}`}
            />
          </button>

          {/* Quick Add Overlay Slide-up Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="absolute bottom-0 inset-x-0 bg-white/95 text-[#111111] py-3 text-[11px] uppercase tracking-[0.18em] font-semibold border-t border-[#E5E5E5] flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#111111] hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 pb-2 flex flex-col flex-1">
          {/* Swatches */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-[#777777]">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          <Link href={`/product/${product.slug}`} className="group-hover:underline">
            <h3 className={`font-normal text-[#111111] line-clamp-1 leading-snug tracking-tight ${
              isEditorial ? 'text-base sm:text-lg font-medium' : 'text-sm sm:text-[15px]'
            }`}>
              {product.name}
            </h3>
          </Link>

          {isEditorial && product.materials && (
            <p className="text-xs text-[#777777] font-mono mt-0.5 line-clamp-1">
              {product.materials.split('.')[0]}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2">
            <span className={`font-medium text-[#111111] ${isEditorial ? 'text-base' : 'text-sm sm:text-[15px]'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-[#777777] line-through font-normal">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickAddModal
        product={product}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}
