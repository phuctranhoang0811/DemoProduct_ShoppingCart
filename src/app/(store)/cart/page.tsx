'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const cart = useCommerceStore((state) => state.cart);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const settings = useCommerceStore((state) => state.settings);
  const validateDiscount = useCommerceStore((state) => state.validateDiscount);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const res = validateDiscount(promoCode, subtotal);
    if (!res.valid) {
      toast.error(res.error || 'Invalid promotional code.');
      setAppliedDiscount(null);
    } else {
      toast.success(`Code ${promoCode.toUpperCase()} applied! Saved ${formatPrice(res.discountAmount)}`);
      setAppliedDiscount({
        code: promoCode.toUpperCase(),
        amount: res.discountAmount,
      });
    }
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const isFreeShipping = subtotal >= settings.freeShippingThreshold;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : settings.shippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center">
        <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#111111]">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="text-2xl font-light text-[#111111]">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-[#777777] mt-2 max-w-sm mx-auto">
          Explore our seasonal collection to discover enduring garments designed with purpose.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-8 bg-[#111111] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#333333] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] mb-8 pb-4 border-b border-[#E5E5E5]">
        Shopping Bag ({cart.reduce((t, i) => t + i.quantity, 0)})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-[#E5E5E5]">
            {cart.map((item) => (
              <div key={item.id} className="py-6 flex gap-4 sm:gap-6">
                {/* Thumbnail */}
                <div className="relative w-24 h-32 sm:w-28 sm:h-38 bg-[#F5F4F0] flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-base sm:text-lg font-medium text-[#111111] hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info('Item removed from bag.');
                        }}
                        className="text-[#777777] hover:text-[#B74747] p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#666666] pt-1">
                      <span>Size: <strong className="text-[#111111] font-medium">{item.size}</strong></span>
                      <span className="flex items-center gap-1.5">
                        Colour:
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <strong className="text-[#111111] font-medium">{item.color.name}</strong>
                      </span>
                    </div>

                    <div className="pt-2 text-base font-semibold text-[#111111]">
                      {formatPrice(item.price)}
                      {item.originalPrice && (
                        <span className="text-sm text-[#777777] line-through ml-2 font-normal">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center border border-[#E5E5E5] h-10">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-3 text-[#111111] hover:bg-[#F5F4F0]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold font-mono w-9 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.stock}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-3 text-[#111111] hover:bg-[#F5F4F0] disabled:text-[#CCCCCC]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-base font-semibold text-[#111111]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center text-sm">
            <Link
              href="/shop"
              className="text-[#111111] underline hover:text-[#777777] font-medium"
            >
              &larr; Continue Exploring
            </Link>
          </div>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-[#F5F4F0] p-6 sm:p-7 space-y-6 sticky top-24">
            <h2 className="text-sm uppercase tracking-[0.14em] font-semibold text-[#111111] pb-3 border-b border-[#E5E5E5]">
              Order Summary
            </h2>

            {/* Promo code form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs text-[#666666] block uppercase tracking-wider font-medium">
                Promotional Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. WELCOME10, COS20"
                  className="bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm flex-1 outline-none uppercase font-mono placeholder:normal-case"
                />
                <button
                  type="submit"
                  className="bg-[#111111] text-white px-5 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <p className="text-xs text-[#477A5A] flex items-center gap-1 font-medium">
                  <Tag className="w-3.5 h-3.5" /> Code &quot;{appliedDiscount.code}&quot; active
                </p>
              )}
            </form>

            {/* Free shipping progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-xs text-[#666666]">
                <span>
                  {isFreeShipping
                    ? 'You qualified for complimentary standard shipping'
                    : `Add ${formatPrice(settings.freeShippingThreshold - subtotal)} more for free shipping`}
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#111111] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-sm border-t border-[#E5E5E5] pt-4">
              <div className="flex justify-between text-[#555555]">
                <span>Subtotal</span>
                <span className="font-medium text-[#111111]">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#B74747]">
                  <span>Discount ({appliedDiscount?.code})</span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#555555]">
                <span>Estimated Shipping</span>
                <span className="font-medium text-[#111111]">{shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold text-[#111111] border-t border-[#E5E5E5] pt-3">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="block w-full text-center bg-[#111111] text-white py-4 text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold hover:bg-[#333333] transition-colors"
            >
              Proceed to Checkout
            </Link>

            <div className="text-xs text-[#777777] flex items-center justify-center gap-2 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#477A5A]" />
              <span>Simulated low-friction checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
