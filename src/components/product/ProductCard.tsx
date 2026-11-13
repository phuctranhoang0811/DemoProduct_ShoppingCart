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

  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const isInWishlist = useCommerceStore((state) => state.isInWishlist(product.id));
  const currency = useCommerceStore((state) => state.currency);

  const localizedName = language === 'vi' ? product.nameVi || product.name : product.nameEn || product.name;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  const isEditorial = density === 'editorial';

  const discountPercent =
    product.sale && product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0] rounded-xs border border-black/[0.04]">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={displayImage}
              alt={localizedName}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes={isEditorial ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            />
          </Link>

          {/* Minimal Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.specifications?.electrodes && (
              <span className="glass-badge text-[#111111] bg-white/90 border border-black/10 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full shadow-2xs">
                {product.specifications.electrodes} {language === 'vi' ? 'Tấm' : 'Plates'}
              </span>
            )}
            {discountPercent && (
              <span className="glass-badge text-[#9E3A3A] bg-white/90 border border-[#9E3A3A]/30 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full shadow-2xs">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
              isInWishlist
                ? 'bg-white text-[#9E3A3A] shadow-xs'
                : 'bg-white/80 text-[#555555] hover:text-[#111111] hover:bg-white'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isInWishlist ? 'fill-[#9E3A3A] stroke-[#9E3A3A]' : 'stroke-[1.5]'
              }`}
            />
          </button>

          {/* Desktop Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="hidden sm:flex absolute bottom-0 inset-x-0 bg-white/95 text-[#111111] hover:bg-[#111111] hover:text-white py-2.5 text-[11px] uppercase tracking-wider font-semibold border-t border-black/5 items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>{t.showcase.quickAdd}</span>
          </button>
        </div>

        {/* Content */}
        <div className="pt-2.5 flex flex-col flex-1">
          {/* Swatches */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1 mb-1">
              {product.colors.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColorIdx(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    selectedColorIdx === idx
                      ? 'ring-1 ring-offset-1 ring-[#111111] scale-110'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="hover:underline">
            <h3 className={`font-normal text-[#111111] line-clamp-1 leading-snug ${
              isEditorial ? 'text-base' : 'text-xs sm:text-[13px]'
            }`}>
              {localizedName}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-medium text-xs sm:text-sm text-[#111111]">
              {formatPrice(product.price, currency)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-[#888888] line-through font-normal">
                {formatPrice(product.originalPrice, currency)}
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
