'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatPrice } from '@/lib/utils';
import { QuickAddModal } from './QuickAddModal';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  density?: 'editorial' | 'catalog';
}

export function ProductCard({ product, density = 'catalog' }: ProductCardProps) {
  const { t, language } = useTranslation();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const isInWishlist = useCommerceStore((state) => state.isInWishlist(product.id));
  const currency = useCommerceStore((state) => state.currency);

  const localizedName = language === 'vi' ? product.nameVi || product.name : product.nameEn || product.name;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 500);
    toggleWishlist(product.id);
    if (!isInWishlist) {
      toast.success(language === 'vi' ? `Đã lưu vào danh sách yêu thích.` : `Saved to wishlist.`);
    } else {
      toast.info(language === 'vi' ? `Đã bỏ khỏi danh sách yêu thích.` : `Removed from wishlist.`);
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

  const discountPercent =
    product.sale && product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-lg border border-[#EAEAEA] p-3 sm:p-4 hover:border-[#111111] card-interactive transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Container (aspect-square with object-contain for authentic machine visuals) */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#FAFAF9] rounded-md flex items-center justify-center p-2 transition-colors duration-300 group-hover:bg-[#F5F4F0]">
          <Link href={`/product/${product.slug}`} className="relative w-full h-full block">
            <Image
              src={displayImage}
              alt={localizedName}
              fill
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.specifications?.electrodes && (
              <span className="bg-black/85 text-white text-[10px] font-medium uppercase px-2 py-0.5 rounded-sm shadow-xs transition-transform duration-200 group-hover:translate-x-0.5">
                {product.specifications.electrodes} {language === 'vi' ? 'Tấm' : 'Plates'}
              </span>
            )}
            {discountPercent && (
              <span className="bg-[#9E3A3A] text-white text-[10px] font-medium uppercase px-2 py-0.5 rounded-sm shadow-xs animate-pulse-subtle">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 btn-tactile ${
              isInWishlist
                ? 'bg-white text-[#9E3A3A] shadow-xs'
                : 'bg-white/90 text-[#777777] hover:text-[#111111] hover:bg-white shadow-2xs'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${
                isHeartPopping ? 'animate-heart-pop' : ''
              } ${
                isInWishlist ? 'fill-[#9E3A3A] stroke-[#9E3A3A]' : 'stroke-[1.5]'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 flex flex-col flex-1 justify-between">
          <div>
            {/* SKU */}
            <p className="text-[11px] text-[#888888] font-mono">[SKU {product.sku}]</p>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="hover:underline block mt-0.5 group-hover:text-black">
              <h3 className="font-medium text-xs sm:text-sm text-[#111111] line-clamp-1 leading-snug transition-colors">
                {localizedName}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-xs sm:text-sm text-[#111111]">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-[#888888] line-through font-normal">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>
          </div>

          {/* Clean Add to Cart Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="mt-3 w-full bg-[#111111] hover:bg-[#252525] text-white py-2 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 btn-tactile shadow-xs hover:shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.showcase.quickAdd}</span>
          </button>
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
