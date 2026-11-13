'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Truck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const { t, language } = useTranslation();
  const cart = useCommerceStore((state) => state.cart);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const settings = useCommerceStore((state) => state.settings);
  const validateDiscount = useCommerceStore((state) => state.validateDiscount);
  const currency = useCommerceStore((state) => state.currency);

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
      toast.error(res.error || (language === 'vi' ? 'Mã ưu đãi không hợp lệ.' : 'Invalid promotional code.'));
      setAppliedDiscount(null);
    } else {
      toast.success(
        language === 'vi'
          ? `Mã ${promoCode.toUpperCase()} đã được áp dụng! Tiết kiệm ${formatPrice(res.discountAmount, currency)}`
          : `Code ${promoCode.toUpperCase()} applied! Saved ${formatPrice(res.discountAmount, currency)}`
      );
      setAppliedDiscount({
        code: promoCode.toUpperCase(),
        amount: res.discountAmount,
      });
    }
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const shippingFee = 0; // Free installation nationwide
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto text-[#111111] border border-[#E5E5E5]">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="text-2xl font-light text-[#111111]">{t.cart.emptyTitle}</h1>
        <p className="text-xs text-[#737373] max-w-sm mx-auto">
          {t.cart.emptyDesc}
        </p>
        <Link
          href="/shop"
          className="inline-block mt-4 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold tracking-wider rounded-xs hover:bg-[#262626] transition-all"
        >
          {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#111111] mb-8 pb-4 border-b border-[#E5E5E5]">
        {t.cart.title} ({cart.reduce((s, i) => s + i.quantity, 0)})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart items list (8 cols) */}
        <div className="lg:col-span-8 divide-y divide-[#E5E5E5]">
          {cart.map((item) => (
            <div key={item.id} className="py-6 flex gap-4 sm:gap-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E5E5] p-1.5 flex items-center justify-center">
                <Image src={item.image} alt={item.productName} fill className="object-contain p-1" sizes="120px" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm sm:text-base font-semibold text-[#111111] hover:underline line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#999999] hover:text-[#B74747] transition-colors"
                      title={t.cart.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#737373] mt-1">{item.size}</p>
                  <span className="text-sm sm:text-base font-semibold text-[#111111] mt-2 block">
                    {formatPrice(item.price, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <div className="flex items-center border border-[#E5E5E5] rounded-xs bg-white p-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-[#555555] hover:text-[#111111]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-[#111111]">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-[#555555] hover:text-[#111111]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-5 sticky top-28">
            <h2 className="text-base font-semibold text-[#111111] border-b border-[#E5E5E5] pb-3 uppercase tracking-wider">
              {language === 'vi' ? 'Tóm Tắt Đơn Hàng' : 'Order Summary'}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-sm text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>{t.cart.shipping}</span>
                <span className="font-semibold text-[#2D5A27]">{t.cart.shippingFree}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-[#2D5A27]">
                  <span>Promo ({appliedDiscount.code})</span>
                  <span className="font-semibold">-{formatPrice(appliedDiscount.amount, currency)}</span>
                </div>
              )}
              <div className="border-t border-[#E5E5E5] pt-3 flex justify-between text-sm font-semibold text-[#111111]">
                <span>{t.cart.total}</span>
                <span className="text-xl font-bold text-[#111111]">{formatPrice(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder={t.cart.promoPlaceholder}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xs border border-[#E5E5E5] outline-none uppercase font-mono focus:border-[#111111] bg-white transition-colors"
              />
              <button
                type="submit"
                className="bg-[#111111] text-white px-4 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-[#262626] transition-all"
              >
                {t.cart.applyCode}
              </button>
            </form>

            <Link
              href="/checkout"
              className="w-full bg-[#111111] hover:bg-[#262626] text-white py-3.5 rounded-xs text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{t.cart.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737373] pt-2 border-t border-[#E5E5E5]">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span>{t.cart.sslSecurity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
