'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Eye,
  X,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const orders = useCommerceStore((state) => state.orders);
  const updateOrderStatus = useCommerceStore((state) => state.updateOrderStatus);
  const updatePaymentStatus = useCommerceStore((state) => state.updatePaymentStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order ${orderId} marked as ${newStatus}.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handlePaymentChange = (orderId: string, newPayment: PaymentStatus) => {
    updatePaymentStatus(orderId, newPayment);
    toast.success(`Order ${orderId} payment updated to ${newPayment}.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newPayment });
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !internalNote.trim()) return;
    updateOrderStatus(selectedOrder.id, selectedOrder.status, `[Staff Note]: ${internalNote.trim()}`);
    setSelectedOrder({
      ...selectedOrder,
      notes: selectedOrder.notes
        ? `${selectedOrder.notes}\n[Staff Note]: ${internalNote.trim()}`
        : `[Staff Note]: ${internalNote.trim()}`,
    });
    setInternalNote('');
    toast.success('Internal note appended to order.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Order Management
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Process fulfillment, confirm shipments, and audit customer transactions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-[#E5E5E5] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by Order ID or customer..."
            className="w-full bg-[#F5F4F0] pl-9 pr-3 py-2 text-xs outline-none border border-transparent focus:border-[#111111]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Order Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#F5F4F0] px-3 py-2 text-xs border border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Fulfillment Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="bg-[#F5F4F0] px-3 py-2 text-xs border border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-3">Customer</th>
              <th className="py-3.5 px-3">Date</th>
              <th className="py-3.5 px-3">Items</th>
              <th className="py-3.5 px-3">Payment</th>
              <th className="py-3.5 px-3">Fulfillment</th>
              <th className="py-3.5 px-3">Total</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {paginatedOrders.map((o) => (
              <tr key={o.id} className="hover:bg-[#F9F9F8] transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-sm text-[#111111]">{o.id}</td>
                <td className="py-3.5 px-3">
                  <p className="font-medium text-sm text-[#111111]">{o.customerName}</p>
                  <p className="text-[12px] text-[#777777]">{o.customerEmail}</p>
                </td>
                <td className="py-3.5 px-3 text-sm text-[#666666]">{formatDate(o.createdAt)}</td>
                <td className="py-3.5 px-3 font-medium text-sm text-[#111111]">
                  {o.items.length} garment{o.items.length > 1 ? 's' : ''}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                      o.paymentStatus === 'Paid'
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : o.paymentStatus === 'Refunded'
                        ? 'bg-[#FBEAEA] text-[#B74747]'
                        : 'bg-[#FDF6E2] text-[#8C6D1F]'
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                      o.status === 'Delivered'
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : o.status === 'Cancelled'
                        ? 'bg-[#FBEAEA] text-[#B74747]'
                        : o.status === 'Shipped'
                        ? 'bg-[#EBF3FB] text-[#2B4C7E]'
                        : 'bg-[#F5F4F0] text-[#111111]'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-semibold text-sm text-[#111111]">
                  {formatPrice(o.total)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </td>
              </tr>
            ))}
            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#777777]">
                  No orders match criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#777777]">
          <span>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-[#E5E5E5] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-mono">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border border-[#E5E5E5] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail & Management Modal */}
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
              <span className="text-[10px] uppercase font-bold text-[#777777]">Order Management</span>
              <h2 className="text-xl font-light text-[#111111] mt-0.5">{selectedOrder.id}</h2>
              <p className="text-xs text-[#777777]">
                Placed {formatDate(selectedOrder.createdAt)} &bull; Current Status:{' '}
                <strong className="text-[#111111]">{selectedOrder.status}</strong>
              </p>
            </div>

            {/* Quick Status Transition Actions */}
            <div className="bg-[#F5F4F0] p-4 mb-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Quick Status Transitions
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status !== 'Confirmed' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
                    className="px-3 py-1.5 bg-white border text-xs font-medium hover:border-black"
                  >
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status !== 'Processing' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Processing')}
                    className="px-3 py-1.5 bg-white border text-xs font-medium hover:border-black"
                  >
                    Mark Processing
                  </button>
                )}
                {selectedOrder.status !== 'Shipped' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Shipped')}
                    className="px-3 py-1.5 bg-white border text-xs font-medium hover:border-black"
                  >
                    Dispatch / Shipped
                  </button>
                )}
                {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                    className="px-3 py-1.5 bg-[#477A5A] text-white text-xs font-medium hover:bg-[#386247]"
                  >
                    Mark Delivered
                  </button>
                )}
                {selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    className="px-3 py-1.5 bg-[#B74747] text-white text-xs font-medium hover:bg-[#963737]"
                  >
                    Cancel Order & Restock
                  </button>
                )}
              </div>

              {/* Payment toggle */}
              <div className="flex items-center gap-3 pt-2 text-xs border-t border-[#E5E5E5]">
                <span className="text-[#777777]">Payment Status:</span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value as any)}
                  className="bg-white border px-2 py-1 text-xs outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 border p-4">
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Customer
                </p>
                <p>{selectedOrder.customerName}</p>
                <p className="text-[#777777]">{selectedOrder.customerEmail}</p>
                <p className="text-[#777777]">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Destination
                </p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}</p>
                <p>{selectedOrder.shippingAddress.city}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[#E5E5E5] mb-6">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 bg-[#F5F4F0] flex-shrink-0 border border-[#E5E5E5] overflow-hidden">
                      <Image src={it.image} alt={it.productName} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111111]">{it.productName}</p>
                      <p className="text-[#777777]">
                        {it.colorName} / {it.size} &bull; Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[#E5E5E5] pt-3 text-xs space-y-1">
              <div className="flex justify-between text-[#555]">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#B74747]">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#555]">
                <span>Shipping</span>
                <span>{formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#111] pt-2 border-t">
                <span>Grand Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="mt-6 border-t pt-4">
              <p className="text-[11px] uppercase font-semibold text-[#111111] mb-1">
                Internal Order Notes
              </p>
              {selectedOrder.notes ? (
                <pre className="text-xs bg-[#F5F4F0] p-3 text-[#555555] font-sans whitespace-pre-wrap mb-3">
                  {selectedOrder.notes}
                </pre>
              ) : (
                <p className="text-xs text-[#777777] italic mb-3">No internal notes recorded.</p>
              )}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add a new note..."
                  className="flex-1 border px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#111111] text-white px-4 text-xs font-semibold uppercase"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
