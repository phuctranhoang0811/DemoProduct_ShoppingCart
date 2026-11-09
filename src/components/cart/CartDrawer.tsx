'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck, Check, ShieldCheck } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export function CartDrawer() {
  const isCartDrawerOpen = useCommerceStore((state) => state.isCartDrawerOpen);
  const setIsCartDrawerOpen = useCommerceStore((state) => state.setIsCartDrawerOpen);
  const cart = useCommerceStore((state) => state.cart);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const currency = useCommerceStore((state) => state.currency);

  const drawerRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white border-l border-[#E5E5E5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#111111]">
                Your Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-[#E5E5E5] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-[#F5F4F0] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Truck className={`w-4 h-4 ${isFreeShipping ? 'text-[#477A5A]' : 'text-[#111111]'}`} />
              {isFreeShipping ? (
                <span className="font-semibold text-[#477A5A] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Congratulations! You unlocked Free Delivery.
                </span>
              ) : (
                <span className="text-[#333333]">
                  Add <strong className="text-[#111111] font-semibold">{formatPrice(shippingRemaining, currency)}</strong> more for <strong>Free Delivery</strong>
                </span>
              )}
            </div>
            <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-[#477A5A]' : 'bg-[#111111]'
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5] p-5">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="relative w-20 h-26 bg-[#F5F4F0] rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E5E5]"
                  >
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="text-sm font-medium text-[#111111] hover:underline line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info(`Removed "${item.productName}" from bag.`);
                        }}
                        className="text-[#999999] hover:text-[#B74747] p-1 transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color & Size tags */}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: item.color.hex }}
                        title={item.color.name}
                      />
                      <span className="text-xs text-[#666666]">{item.color.name}</span>
                      <span className="text-[#CCCCCC]">&bull;</span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 bg-[#F5F4F0] text-[#111111] rounded-xs">
                        Size {item.size}
                      </span>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E5E5E5] rounded-xs bg-[#FAF9F5]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-[#555555] hover:text-[#111111] active:bg-[#E5E5E5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#111111] min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1.5 text-[#555555] hover:text-[#111111] active:bg-[#E5E5E5] disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-[#111111]">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5F4F0] flex items-center justify-center text-[#777777]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[#111111]">Your bag is currently empty</h3>
                  <p className="text-xs text-[#777777] mt-1 max-w-xs">
                    Explore our SS26 collection and discover timeless architectural essentials.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#111111] text-white px-7 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors rounded-xs"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E5E5E5] bg-[#FAF9F5] space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111111]">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-[#666666] text-xs">
                  <span>Shipping</span>
                  <span>{isFreeShipping ? <strong className="text-[#477A5A]">Free</strong> : 'Calculated at checkout'}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full bg-[#111111] text-white py-3.5 px-6 rounded-xs text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-[#333333] active:scale-[0.99] transition-all shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full block text-center border border-[#111111] text-[#111111] py-2.5 rounded-xs text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
              >
                View Full Bag Details
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777777] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#477A5A]" />
                <span>SSL Encrypted Checkout &bull; 30-Day Free Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
