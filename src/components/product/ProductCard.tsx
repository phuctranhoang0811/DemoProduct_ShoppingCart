'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ShoppingBag, ArrowUpRight, Award, ShieldCheck, Zap } from 'lucide-react';
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
      toast.success(language === 'vi' ? `Đã lưu "${localizedName}" vào danh sách yêu thích.` : `Saved "${localizedName}" to saved devices.`);
    } else {
      toast.info(language === 'vi' ? `Đã bỏ "${localizedName}" khỏi yêu thích.` : `Removed "${localizedName}" from saved devices.`);
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
        className="group relative flex flex-col bg-white rounded-2xl p-2 sm:p-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-[#0055A5]/10 border border-[#0055A5]/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with 3:4 aspect ratio & rounded corners */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-[#F2F7FB] to-[#E5F0F8] rounded-xl border border-[#0055A5]/10 shadow-xs group-hover:shadow-md transition-all duration-300">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={displayImage}
              alt={localizedName}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes={isEditorial ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            />
          </Link>

          {/* Medical & Feature Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.specifications?.electrodes && (
              <span className="glass-badge text-[#003B73] bg-white/90 border border-[#0055A5]/25 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00A3E0] fill-[#00A3E0]" />
                <span>{product.specifications.electrodes} {language === 'vi' ? 'Tấm Điện Cực' : 'Plates'}</span>
              </span>
            )}
            {discountPercent && (
              <span className="glass-badge text-[#B74747] bg-white/90 border border-[#B74747]/30 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                -{discountPercent}%
              </span>
            )}
            {product.newArrival && !product.sale && (
              <span className="glass-badge text-[#0055A5] bg-white/90 border border-[#0055A5]/30 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                {language === 'vi' ? 'Mới 2026' : 'New 2026'}
              </span>
            )}
          </div>

          {/* Floating "View Details" Pill on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="glass-btn text-[#002B5C] text-[10px] uppercase font-bold tracking-[0.16em] px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 mirror-sheen border border-[#0055A5]/25 bg-white/95">
              <span>{t.showcase.viewPiece}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0072CE] stroke-[2.2]" />
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
              isInWishlist
                ? 'bg-white text-[#B74747] border border-[#B74747]/40 shadow-sm scale-105'
                : 'glass-btn text-[#4A6B82] hover:text-[#B74747] hover:scale-110 active:scale-95 border-[#0055A5]/20 bg-white/85'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isInWishlist ? 'Remove from wishlist' : 'Save device'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors duration-200 ${
                isInWishlist ? 'fill-[#B74747] stroke-[#B74747]' : 'stroke-[1.8]'
              }`}
            />
          </button>

          {/* Mobile Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="sm:hidden absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#0055A5] text-white font-semibold flex items-center justify-center active:scale-90 z-10 shadow-md"
            aria-label="Quick Add"
            title="Quick Add"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {/* Desktop Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="hidden sm:flex absolute bottom-0 inset-x-0 bg-white/95 text-[#002B5C] hover:bg-[#0055A5] hover:text-white py-2.5 text-xs uppercase tracking-wider font-bold border-t border-[#0055A5]/15 rounded-b-xl items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md mirror-sheen"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.showcase.quickAdd}</span>
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 pb-1 flex flex-col flex-1">
          {/* Finish / Edition Swatches */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-1.5">
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
                      ? 'ring-2 ring-offset-1 ring-[#0055A5] scale-110'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`Edition ${c.name}`}
                />
              ))}
              <span className="text-[11px] text-[#666666] ml-1 font-medium">
                {currentColor.name}
              </span>
            </div>
          )}

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="group-hover:text-[#0055A5] transition-colors">
            <h3 className={`font-bold text-[#002B5C] line-clamp-1 leading-snug ${
              isEditorial ? 'text-base sm:text-lg' : 'text-sm sm:text-[15px]'
            }`}>
              {localizedName}
            </h3>
          </Link>

          {/* Quick specs preview */}
          {product.specifications?.phRange && (
            <p className="text-[11px] text-[#4A6B82] font-mono mt-0.5 line-clamp-1">
              pH {product.specifications.phRange} &bull; ORP {product.specifications.orp}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#0055A5]/10">
            <div className="flex items-baseline gap-2">
              <span className={`font-extrabold text-[#0055A5] ${isEditorial ? 'text-lg' : 'text-base sm:text-[16px]'}`}>
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#888888] line-through font-normal">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold text-[#00A3E0] uppercase tracking-wider bg-[#E8F4FA] px-2 py-0.5 rounded-full">
              {language === 'vi' ? 'Chính Hãng' : 'Official'}
            </span>
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
