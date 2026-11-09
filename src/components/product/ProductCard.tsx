'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
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
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
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

  const currentColor = product.colors[selectedColorIdx] || product.colors[0];
  const activeImage = currentColor?.image || product.images[selectedColorIdx] || product.images[0];
  const displayImage = isHovered && product.images[1] && selectedColorIdx === 0 ? product.images[1] : activeImage;
  const isEditorial = density === 'editorial';

  const discountPercent =
    product.sale && product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with 3:4 aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0] rounded-xs">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes={isEditorial ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            />
          </Link>

          {/* Minimalist Friendly Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {discountPercent && (
              <span className="bg-[#9E3A3A] text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.newArrival && !product.sale && (
              <span className="bg-[#111111] text-white text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
                New
              </span>
            )}
          </div>

          {/* Always Visible, Accessible Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
              isInWishlist
                ? 'bg-white text-[#9E3A3A] shadow-md scale-105'
                : 'bg-white/85 hover:bg-white text-[#111111] hover:text-[#9E3A3A] backdrop-blur-xs shadow-xs hover:scale-110 active:scale-95'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 stroke-[1.6] transition-colors duration-200 ${
                isInWishlist ? 'fill-[#9E3A3A]' : ''
              }`}
            />
          </button>

          {/* Mobile Quick Add Button (Bottom Right) */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="sm:hidden absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white text-[#111111] shadow-md flex items-center justify-center active:scale-90 z-10"
            aria-label="Quick Add to Bag"
            title="Quick add"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Quick Add Button (Hover Slide-up) */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="hidden sm:flex absolute bottom-0 inset-x-0 glass text-[#111111] py-2.5 text-xs uppercase tracking-wider font-semibold border-t border-white/50 items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#111111] hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 pb-2 flex flex-col flex-1">
          {/* Interactive Color Swatches */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-2">
              {product.colors.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColorIdx(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColorIdx === idx
                      ? 'ring-1 ring-offset-1 ring-[#111111] scale-110'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`Color ${c.name}`}
                />
              ))}
              <span className="text-[11px] text-[#777777] ml-1">
                {currentColor.name}
              </span>
            </div>
          )}

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="group-hover:underline">
            <h3 className={`font-normal text-[#111111] line-clamp-1 leading-snug ${
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

          {/* Pricing with Clear Discount Savings */}
          <div className="mt-1 flex items-center gap-2">
            <span className={`font-semibold text-[#111111] ${isEditorial ? 'text-base' : 'text-sm sm:text-[15px]'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-[#888888] line-through font-normal">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="text-[11px] text-[#9E3A3A] font-medium">
                Save {discountPercent}%
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
