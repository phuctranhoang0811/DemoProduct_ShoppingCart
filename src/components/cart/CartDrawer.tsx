'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck, Check, ShieldCheck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export function CartDrawer() {
  const { t, language } = useTranslation();
  const isCartDrawerOpen = useCommerceStore((state) => state.isCartDrawerOpen);
  const setIsCartDrawerOpen = useCommerceStore((state) => state.setIsCartDrawerOpen);
  const cart = useCommerceStore((state) => state.cart);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const currency = useCommerceStore((state) => state.currency);

  const drawerRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md glass-drawer shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-900" />
              <h2 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                {t.cart.title} ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-white/80 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Installation Guarantee Banner */}
          <div className="p-3.5 bg-blue-50/80 backdrop-blur-sm border-b border-blue-100 flex items-center gap-2 text-xs text-blue-950 font-medium">
            <Truck className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>{t.cart.freeDeliveryUnlocked}</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#111111]">{t.cart.emptyTitle}</h3>
                  <p className="text-xs text-[#777777] mt-1 max-w-xs">{t.cart.emptyDesc}</p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#111111] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-900 transition-all shadow-md"
                >
                  <Link href="/shop">{t.cart.startShopping}</Link>
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="relative w-20 h-22 bg-[#F5F8FA] flex-shrink-0 rounded-xl overflow-hidden border border-black/5">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs font-semibold text-[#111111] hover:text-blue-700 line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title={t.cart.remove}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#777777] mt-0.5">{item.size}</p>
                      <span className="text-xs font-semibold text-blue-900 block mt-1">
                        {formatPrice(item.price, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/60 bg-white/70 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">{t.cart.subtotal}</span>
                <span className="font-semibold text-base text-blue-950">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">{t.cart.shipping}</span>
                <span className="font-semibold text-emerald-700">{t.cart.shippingFree}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
                <span className="font-bold text-[#111111]">{t.cart.total}</span>
                <span className="font-bold text-lg text-blue-900">{formatPrice(subtotal, currency)}</span>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mirror-sheen"
                >
                  <span>{t.cart.checkout}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full text-center block text-xs text-[#555555] hover:text-[#111111] py-1.5 font-medium"
                >
                  {t.cart.viewBag}
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>{t.cart.sslSecurity}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
