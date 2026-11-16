'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, X } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { fetchCheckoutQuote, type CheckoutQuote } from '@/lib/orders-client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const { t } = useTranslation();
  const cart = useCommerceStore((state) => state.cart);
  const authMode = useCommerceStore((state) => state.authMode);
  const settings = useCommerceStore((state) => state.settings);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const validateDiscount = useCommerceStore((state) => state.validateDiscount);
  const appliedDiscountCode = useCommerceStore((state) => state.appliedDiscountCode);
  const setAppliedDiscountCode = useCommerceStore((state) => state.setAppliedDiscountCode);
  const currency = useCommerceStore((state) => state.currency);

  const [promoCode, setPromoCode] = useState(appliedDiscountCode ?? '');
  const [serverQuote, setServerQuote] = useState<CheckoutQuote | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  useEffect(() => {
    if (appliedDiscountCode && !promoCode) setPromoCode(appliedDiscountCode);
  }, [appliedDiscountCode, promoCode]);

  useEffect(() => {
    if (cart.length === 0 || authMode === 'local') {
      setServerQuote(null);
      return;
    }

    let cancelled = false;
    void fetchCheckoutQuote(cart, appliedDiscountCode).then((quote) => {
      if (cancelled) return;
      if (!quote) {
        setServerQuote(null);
        return;
      }
      if (quote.error && appliedDiscountCode) {
        toast.error(quote.error);
        setAppliedDiscountCode(null);
      }
      setServerQuote(quote);
    });

    return () => {
      cancelled = true;
    };
  }, [authMode, cart, appliedDiscountCode, setAppliedDiscountCode]);

  const localSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const activeValidation = !serverQuote && appliedDiscountCode ? validateDiscount(appliedDiscountCode, localSubtotal) : null;
  const localAppliedDiscount =
    appliedDiscountCode && activeValidation?.valid
      ? { code: appliedDiscountCode, amount: activeValidation.discountAmount }
      : null;

  const subtotal = serverQuote ? serverQuote.subtotal : localSubtotal;
  const appliedDiscount = serverQuote
    ? serverQuote.discountCode && serverQuote.discountAmount > 0
      ? { code: serverQuote.discountCode, amount: serverQuote.discountAmount }
      : null
    : localAppliedDiscount;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (authMode !== 'local') {
      setIsApplyingPromo(true);
      const quote = await fetchCheckoutQuote(cart, clean);
      setIsApplyingPromo(false);
      if (quote) {
        if (quote.error) {
          toast.error(quote.error);
          return;
        }
        const resolvedCode = quote.discountCode ?? clean;
        setAppliedDiscountCode(resolvedCode);
        setServerQuote(quote);
        toast.success(
          `Code ${resolvedCode} applied! Saved ${formatPrice(quote.discountAmount, currency)}`
        );
        return;
      }
    }

    const res = validateDiscount(clean, localSubtotal);
    if (!res.valid) {
      toast.error(res.error || 'Invalid promotional code.');
      setAppliedDiscountCode(null);
    } else {
      setAppliedDiscountCode(clean);
      toast.success(
        `Code ${clean} applied! Saved ${formatPrice(res.discountAmount, currency)}`
      );
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscountCode(null);
    setPromoCode('');
    toast.info('Promotional code removed.');
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const payableAfterDiscount = Math.max(0, subtotal - discountAmount);
  const localShippingFee =
    settings.shippingFee > 0 &&
    (settings.freeShippingThreshold === 0 || payableAfterDiscount < settings.freeShippingThreshold)
      ? settings.shippingFee
      : 0;
  const shippingFee = serverQuote ? serverQuote.shippingFee : localShippingFee;
  const grandTotal = serverQuote ? serverQuote.total : payableAfterDiscount + shippingFee;

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
        <div className="lg:col-span-8 space-y-4">
          {/* Animated Free Setup & Delivery Meter */}
          <div className="bg-blue-50/90 border border-blue-200/80 rounded-lg p-4 text-xs text-blue-950">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-semibold text-blue-900">
                <Truck className="w-4 h-4 text-blue-700 animate-pulse" />
                <span>Complimentary Delivery & Certified In-Home Installation Unlocked</span>
              </span>
              <span className="text-[10px] uppercase font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                Eligible
              </span>
            </div>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-700 w-full" />
            </div>
          </div>

          <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-lg bg-white px-4">
            {cart.map((item, idx) => (
              <div
                key={item.id}
                className="py-6 flex gap-4 sm:gap-6 animate-cart-item transition-all"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-md overflow-hidden flex-shrink-0 border border-[#E5E5E5] p-1.5 flex items-center justify-center">
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
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info(`Removed ${item.productName} from bag`);
                        }}
                        className="text-[#999999] hover:text-[#B74747] transition-colors p-1"
                        title="Remove item"
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
                    <div className="flex items-center border border-[#E5E5E5] rounded-xs bg-white p-1 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-[#555555] hover:text-[#111111] active:scale-75 transition-transform"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#111111] tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-[#555555] hover:text-[#111111] active:scale-75 transition-transform"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-xs space-y-5 sticky top-28">
            <h2 className="text-base font-semibold text-[#111111] border-b border-[#E5E5E5] pb-3 uppercase tracking-wider">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-sm text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>{t.cart.shipping}</span>
                <span className="font-semibold text-[#2D5A27]">
                  {shippingFee === 0 ? t.cart.shippingFree : formatPrice(shippingFee, currency)}
                </span>
              </div>
              {appliedDiscount && (
                <div className="flex items-center justify-between text-[#2D5A27]">
                  <span className="flex items-center gap-1.5">
                    <span>Promo ({appliedDiscount.code})</span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[#777777] hover:text-[#B74747]"
                      aria-label="Remove promo code"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
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
                disabled={isApplyingPromo}
                className="bg-[#111111] text-white px-4 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-[#262626] disabled:opacity-60 transition-all"
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
