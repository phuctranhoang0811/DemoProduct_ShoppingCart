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

          {/* Installation Guarantee Banner with animated progress */}
          <div className="p-3.5 bg-blue-50/90 backdrop-blur-sm border-b border-blue-100/80 text-xs text-blue-950">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-blue-900">
                <Truck className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
                <span>Complimentary Delivery & Certified In-Home Setup</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full">
                100% UNLOCKED
              </span>
            </div>
            <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out w-full" />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 transition-transform duration-300 hover:scale-110">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#111111]">Your Shopping Bag is Empty</h3>
                  <p className="text-xs text-[#777777] mt-1 max-w-xs">Explore Enagic ionizers and certified filters to experience true hydration.</p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#111111] text-white px-6 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-blue-900 transition-all shadow-md active:scale-95"
                >
                  <Link href="/shop">Explore Collection</Link>
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-4 flex gap-4 animate-cart-item transition-all duration-200 hover:bg-black/[0.01] rounded-md px-1"
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  <div className="relative w-20 h-20 bg-white flex-shrink-0 rounded-lg overflow-hidden border border-[#EAEAEA] p-1 flex items-center justify-center group-hover:shadow-xs transition-shadow">
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-1" sizes="80px" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs font-semibold text-[#111111] hover:underline line-clamp-1"
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#777777] mt-0.5">{item.size}</p>
                      <span className="text-xs font-semibold text-[#111111] block mt-1">
                        {formatPrice(item.price, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#E5E5E5] rounded-xs bg-white p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-[#555555] hover:text-[#111111] btn-tactile transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#111111] tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#555555] hover:text-[#111111] btn-tactile transition-all"
                          aria-label="Increase quantity"
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
            <div className="p-5 border-t border-[#E5E5E5] bg-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">Subtotal</span>
                <span className="font-semibold text-sm text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">Shipping & Technician Setup</span>
                <span className="font-semibold text-[#2D5A27]">FREE (Included)</span>
              </div>
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#111111]">Estimated Total</span>
                <span className="font-bold text-base text-[#111111]">{formatPrice(subtotal, currency)}</span>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-[#111111] hover:bg-[#262626] text-white py-3.5 rounded-xs text-xs uppercase tracking-wider font-semibold btn-tactile transition-all flex items-center justify-center gap-2 shadow-xs group mirror-sheen hover:shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full text-center block text-xs uppercase tracking-wider text-[#737373] hover:text-[#111111] hover:bg-[#F5F4F0] py-2.5 font-medium border border-[#E5E5E5] rounded-xs transition-all duration-150 btn-tactile"
                >
                  View Full Bag
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#737373] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
