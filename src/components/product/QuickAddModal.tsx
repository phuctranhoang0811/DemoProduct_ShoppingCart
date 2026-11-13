'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Check } from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickAddModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const { t, language } = useTranslation();
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedPackage, setSelectedPackage] = useState<string>(product.sizes[0]?.label || '');
  const addToCart = useCommerceStore((state) => state.addToCart);
  const currency = useCommerceStore((state) => state.currency);

  if (!isOpen) return null;

  const productName = language === 'vi' ? product.nameVi || product.name : product.nameEn || product.name;
  const pkgLabel = selectedPackage || product.sizes[0]?.label || 'Standard';

  const handleAddToCart = () => {
    const pkgObj = product.sizes.find((s) => s.label === pkgLabel) || product.sizes[0];
    const stockAvailable = pkgObj ? pkgObj.stock : 10;

    addToCart({
      id: `${product.id}-${selectedColor?.id || 'default'}-${pkgLabel}`,
      productId: product.id,
      productName,
      slug: product.slug,
      image: selectedColor?.image || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor || { id: 'c-default', name: 'Standard', hex: '#111111' },
      size: pkgLabel,
      quantity: 1,
      stock: stockAvailable,
    });

    toast.success(
      language === 'vi'
        ? `Đã thêm ${productName} vào giỏ hàng.`
        : `Added ${productName} to your bag.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-modal max-w-md w-full p-6 border border-white/80 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150 rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-white/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4 mb-5">
          <div className="relative w-20 h-20 bg-white flex-shrink-0 rounded-md overflow-hidden border border-[#E5E5E5] p-1.5">
            <Image
              src={selectedColor?.image || product.images[0]}
              alt={productName}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">{productName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-[#111111]">{formatPrice(product.price, currency)}</span>
              {product.originalPrice && (
                <span className="text-xs text-[#777777] line-through">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#777777] mt-1 font-mono">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Package configuration selection */}
        {product.sizes.length > 0 && (
          <div className="mb-5 space-y-2">
            <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider block">
              {t.productDetail.packages}
            </span>
            <div className="space-y-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedPackage(s.label)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    pkgLabel === s.label
                      ? 'border-blue-700 bg-blue-50 text-blue-950 font-semibold'
                      : 'border-[#E5E5E5] bg-white text-[#444444] hover:border-[#111111]'
                  }`}
                >
                  <span>{s.label}</span>
                  {pkgLabel === s.label && <Check className="w-4 h-4 text-blue-700" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md active:scale-95 transition-all mirror-sheen"
        >
          {t.productDetail.addToCart}
        </button>
      </div>
    </div>
  );
}
