'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Check } from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickAddModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const addToCart = useCommerceStore((state) => state.addToCart);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first.');
      return;
    }

    const sizeObj = product.sizes.find((s) => s.label === selectedSize);
    const stockAvailable = sizeObj ? sizeObj.stock : 0;

    if (stockAvailable <= 0) {
      toast.error('Selected size is out of stock.');
      return;
    }

    addToCart({
      id: `${product.id}-${selectedColor.id}-${selectedSize}`,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: selectedColor.image || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      stock: stockAvailable,
    });

    toast.success(`Added ${product.name} (${selectedSize}) to bag.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-6 border border-[#E5E5E5] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4 mb-5">
          <div className="relative w-20 h-26 bg-[#F5F4F0] flex-shrink-0">
            <Image
              src={selectedColor.image || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#111111]">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-[#777777] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#777777] mt-1">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#777777]">Color</span>
              <span className="font-medium text-[#111111]">{selectedColor.name}</span>
            </div>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    selectedColor.id === c.id
                      ? 'border-[#111111] ring-1 ring-[#111111] ring-offset-2'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor.id === c.id && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#f9f9f9'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#777777]">Select Size</span>
            <span className="text-[11px] text-[#777777] underline">True to size</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((s) => {
              const isOut = s.stock <= 0;
              const isSelected = selectedSize === s.label;
              return (
                <button
                  key={s.id}
                  disabled={isOut}
                  onClick={() => setSelectedSize(s.label)}
                  className={`py-2 text-xs font-medium border text-center transition-all ${
                    isOut
                      ? 'bg-[#F5F4F0] text-[#A0A0A0] border-[#E5E5E5] cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  {s.label}
                  {s.stock > 0 && s.stock <= 3 && (
                    <span className="block text-[9px] text-[#B74747] font-normal">
                      Only {s.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#262626] transition-colors"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
