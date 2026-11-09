'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, Package, Calendar, MapPin, CreditCard } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice, formatDate } from '@/lib/utils';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orders = useCommerceStore((state) => state.orders);

  const order = useMemo(() => {
    return orders.find((o) => o.id === orderId) || orders[0];
  }, [orders, orderId]);

  if (!order) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-light">Order Not Found</h1>
        <Link
          href="/shop"
          className="inline-block mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Success banner */}
      <div className="text-center space-y-4 pb-8 border-b border-[#E5E5E5]">
        <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto text-[#477A5A]">
          <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-[#477A5A] font-semibold">
          Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#111111]">
          Thank You, {order.customerName.split(' ')[0]}.
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto">
          Your order has been received. A simulated confirmation email has been dispatched to{' '}
          <strong className="text-[#111111]">{order.customerEmail}</strong>.
        </p>
        <div className="inline-block bg-[#F5F4F0] px-4 py-2 text-xs font-mono font-medium">
          Order ID: {order.id}
        </div>
      </div>

      {/* Order Meta details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-b border-[#E5E5E5] text-xs">
        <div className="space-y-1">
          <p className="text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date Placed
          </p>
          <p className="font-medium text-[#111111]">{formatDate(order.createdAt)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Destination
          </p>
          <p className="font-medium text-[#111111]">
            {order.shippingAddress.street}, {order.shippingAddress.city}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Payment
          </p>
          <p className="font-medium text-[#111111] capitalize">
            {order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
          </p>
        </div>
      </div>

      {/* Items list */}
      <div className="py-8 border-b border-[#E5E5E5] space-y-4">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
          Purchased Garments ({order.items.length})
        </h2>
        <div className="divide-y divide-[#E5E5E5]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-20 bg-[#F5F4F0] flex-shrink-0 overflow-hidden border border-[#E5E5E5]">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-xs font-medium text-[#111111] hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-[11px] text-[#777777] mt-0.5">
                    Colour: {item.colorName} &bull; Size: {item.size} &bull; Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#111111]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="py-6 border-b border-[#E5E5E5] space-y-2 text-xs">
        <div className="flex justify-between text-[#555555]">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-[#B74747]">
            <span>Discount ({order.discountCode || 'PROMO'})</span>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#555555]">
          <span>Delivery ({order.deliveryMethod})</span>
          <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-[#111111] pt-2 border-t border-[#E5E5E5]">
          <span>Total Paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Delivery Estimate Box */}
      <div className="mt-8 bg-[#F5F4F0] p-6 text-xs text-[#555555] flex items-start gap-3">
        <Package className="w-5 h-5 text-[#111111] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#111111] uppercase tracking-wider">Estimated Delivery</p>
          <p className="mt-1">
            Expected arrival within 2-4 business days. Track progress anytime inside your customer portal.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/shop"
          className="bg-[#111111] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#333333] text-center"
        >
          Continue Shopping
        </Link>
        <Link
          href="/orders"
          className="border border-[#111111] text-[#111111] px-8 py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#F5F4F0] text-center"
        >
          View Order History
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
