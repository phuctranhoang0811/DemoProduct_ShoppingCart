'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Calendar, Clock, ChevronRight, X, MapPin } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function CustomerOrdersPage() {
  const orders = useCommerceStore((state) => state.orders);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // If logged in, show user orders; otherwise show all mock orders for seamless demo testing
  const displayedOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          o.customerName.toLowerCase() === currentUser.name.toLowerCase()
      )
    : orders;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#E5E5E5] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Tracking your past acquisitions and delivery status ({displayedOrders.length} orders).
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold underline text-[#111111]"
        >
          Explore Collection
        </Link>
      </div>

      {displayedOrders.length > 0 ? (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="border border-[#E5E5E5] p-5 sm:p-6 hover:border-[#111111] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-[#111111]">{order.id}</span>
                  <span className="text-xs text-[#777777]">&bull;</span>
                  <span className="text-xs text-[#777777]">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 ${
                      order.status === 'Delivered'
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : order.status === 'Cancelled'
                        ? 'bg-[#FBEAEA] text-[#B74747]'
                        : 'bg-[#F5F4F0] text-[#111111]'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-[#777777]">
                    Payment: <strong className="text-[#111111]">{order.paymentStatus}</strong>
                  </span>
                </div>
              </div>

              {/* Items preview row */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="relative w-14 h-20 bg-[#F5F4F0] flex-shrink-0 overflow-hidden border border-[#E5E5E5]" title={item.productName}>
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ))}
                  <div className="text-xs text-[#555555] pl-2">
                    <p className="font-medium text-[#111111]">{order.items[0]?.productName}</p>
                    {order.items.length > 1 && (
                      <p className="text-[11px] text-[#777777]">
                        + {order.items.length - 1} other item{order.items.length > 2 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-[#777777] block">Total Amount</span>
                    <span className="text-sm font-semibold text-[#111111]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="border border-[#111111] px-4 py-2 text-xs uppercase font-medium hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <Package className="w-12 h-12 text-[#777777] mx-auto mb-3 stroke-[1.2]" />
          <h2 className="text-lg font-light text-[#111111]">No Orders Recorded</h2>
          <p className="text-xs text-[#777777] mt-1">You haven&apos;t placed any orders yet.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#E5E5E5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E5E5E5] pb-4 mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
                Order Invoice
              </span>
              <h2 className="text-xl font-light text-[#111111] mt-0.5">
                Order {selectedOrder.id}
              </h2>
              <p className="text-xs text-[#777777] mt-1">
                Placed on {formatDate(selectedOrder.createdAt)} &bull; Status:{' '}
                <strong className="text-[#111111]">{selectedOrder.status}</strong>
              </p>
            </div>

            {/* Recipient & Address */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-[#F5F4F0] p-4">
              <div>
                <p className="font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Recipient
                </p>
                <p>{selectedOrder.customerName}</p>
                <p className="text-[#777777]">{selectedOrder.customerEmail}</p>
                <p className="text-[#777777]">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Shipping Address
                </p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}</p>
                <p>{selectedOrder.shippingAddress.city}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[#E5E5E5] mb-6">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-16 bg-[#F5F4F0] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-[#111111]">{item.productName}</p>
                      <p className="text-[#777777]">
                        {item.colorName} / {item.size} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#111111]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#555555]">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#B74747]">
                  <span>Discount ({selectedOrder.discountCode})</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#555555]">
                <span>Shipping ({selectedOrder.deliveryMethod})</span>
                <span>{selectedOrder.shippingFee === 0 ? 'Free' : formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#111111] border-t border-[#E5E5E5] pt-2">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-[#111111] text-white py-3 text-xs uppercase font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
