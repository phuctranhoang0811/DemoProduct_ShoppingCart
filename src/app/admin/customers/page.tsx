'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Eye,
  X,
  Power,
  MapPin,
  CreditCard,
  ShieldCheck,
  Tag,
  Award,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Customer } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const customers = useCommerceStore((state) => state.customers);
  const orders = useCommerceStore((state) => state.orders);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);
  const toggleCustomerStatus = useCommerceStore((state) => state.toggleCustomerStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.referralCode && c.referralCode.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  const exactEmailMatch = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || !q.includes('@')) return null;
    return customers.find((c) => c.email.toLowerCase() === q) || (filteredCustomers.length === 1 ? filteredCustomers[0] : null);
  }, [customers, filteredCustomers, searchQuery]);

  const activeCustomer = selectedCustomer || exactEmailMatch;

  const customerOrders = useMemo(() => {
    if (!activeCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerEmail.toLowerCase() === activeCustomer.email.toLowerCase() ||
        o.customerName.toLowerCase() === activeCustomer.name.toLowerCase()
    );
  }, [orders, activeCustomer]);

  const activeCustomerSponsor = useMemo(() => {
    if (!activeCustomer?.referralCode) return null;
    return (
      hellobeeMembers.find(
        (m) => m.referralCode.toUpperCase() === activeCustomer.referralCode?.toUpperCase()
      ) || null
    );
  }, [activeCustomer, hellobeeMembers]);

  const activeCustomerStats = useMemo(() => {
    const validOrders = customerOrders.filter((o) => o.status !== 'Cancelled');
    const totalSpent = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalItems = validOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0),
      0
    );
    return {
      totalOrders: customerOrders.length,
      validOrdersCount: validOrders.length,
      totalSpent,
      totalItems,
    };
  }, [customerOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Customers &amp; Gmail Lookup
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Search customers by Gmail / email address to inspect full profile, sponsor link, and complete purchase history.
          </p>
        </div>
      </div>

      {/* Gmail / Email Lookup Bar */}
      <div className="bg-white p-5 border border-[#E5E5E5] space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by Gmail / email address (e.g. customer@example.com), name, or phone..."
              className="w-full bg-[#F5F4F0] pl-10 pr-9 py-2.5 text-sm text-[#111111] outline-none border border-transparent focus:border-[#111111] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCustomer(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#111111]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <span>Quick Gmail Lookup:</span>
            {customers.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSearchQuery(c.email);
                  setSelectedCustomer(c);
                }}
                className="px-2.5 py-1 bg-[#F5F4F0] hover:bg-[#111111] hover:text-white font-mono text-[11px] transition-colors border border-[#E5E5E5]"
              >
                {c.email}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-3">Gmail / Contact Info</th>
              <th className="py-3.5 px-3">Sponsor Code</th>
              <th className="py-3.5 px-3">Joined</th>
              <th className="py-3.5 px-3">Orders</th>
              <th className="py-3.5 px-3">Lifetime Spend</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-[#777777]">
                  No customer found matching &ldquo;{searchQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const liveOrders = orders.filter(
                  (o) =>
                    o.customerEmail.toLowerCase() === c.email.toLowerCase() ||
                    o.customerName.toLowerCase() === c.name.toLowerCase()
                );
                const liveSpend = liveOrders
                  .filter((o) => o.status !== 'Cancelled')
                  .reduce((sum, o) => sum + o.total, 0);
                const isSelected = activeCustomer?.id === c.id;

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-[#FAF8F5]' : 'hover:bg-[#F9F9F8]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-sm text-[#111111]">{c.name}</p>
                      <span className="text-[11px] text-[#777777] font-mono">{c.id}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-sm font-medium text-[#111111]">{c.email}</p>
                      <p className="text-[12px] text-[#777777]">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      {c.referralCode ? (
                        <div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F4F0] border border-[#E5E5E5] text-[#111111]">
                            {c.referralCode}
                          </span>
                          {c.sponsorName && (
                            <p className="text-[11px] text-[#777777] mt-0.5">{c.sponsorName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#999999] italic">Direct</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#666666]">{formatDate(c.createdAt)}</td>
                    <td className="py-3.5 px-3 font-medium text-sm text-[#111111]">
                      {liveOrders.length} order{liveOrders.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-sm text-[#111111]">
                      {formatPrice(liveSpend)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                          c.status === 'active'
                            ? 'bg-[#EAF3ED] text-[#477A5A]'
                            : 'bg-[#F5F4F0] text-[#777777]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full History</span>
                        </button>
                        <button
                          onClick={() => {
                            toggleCustomerStatus(c.id);
                            toast.info(`Status for ${c.name} updated.`);
                          }}
                          className="p-1.5 hover:text-[#B74747] text-[#777777]"
                          title="Toggle active status"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Customer Dossier & Full Purchase History Panel */}
      {activeCustomer && (
        <div className="bg-white border-2 border-[#111111] p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#111111] text-white">
                  Complete Customer Dossier
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                    activeCustomer.status === 'active'
                      ? 'bg-[#EAF3ED] text-[#477A5A]'
                      : 'bg-[#F5F4F0] text-[#777777]'
                  }`}
                >
                  {activeCustomer.status}
                </span>
                {activeCustomer.membershipTier && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#FAF1E4] text-[#8C5E1E]">
                    {activeCustomer.membershipTier}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] pt-1">{activeCustomer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666]">
                <span className="inline-flex items-center gap-1 font-medium text-[#111111]">
                  <Mail className="w-3.5 h-3.5" /> {activeCustomer.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {activeCustomer.phone || 'No phone on file'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(activeCustomer.createdAt)}
                </span>
                <span className="font-mono text-[11px] text-[#777777]">ID: {activeCustomer.id}</span>
              </div>
            </div>

            {selectedCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] text-xs uppercase font-semibold text-[#555555] hover:border-[#111111] hover:text-[#111111]"
              >
                <X className="w-3.5 h-3.5" /> Close Dossier
              </button>
            )}
          </div>

          {/* Customer KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] block">
                Lifetime Spend
              </span>
              <p className="text-xl font-bold text-[#111111] mt-1 font-mono">
                {formatPrice(activeCustomerStats.totalSpent)}
              </p>
              <span className="text-[11px] text-[#666666]">
                Across {activeCustomerStats.validOrdersCount} valid order{activeCustomerStats.validOrdersCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] block">
                Total Orders &amp; Units
              </span>
              <p className="text-xl font-bold text-[#111111] mt-1 font-mono">
                {activeCustomerStats.totalOrders} Orders ({activeCustomerStats.totalItems} Units)
              </p>
              <span className="text-[11px] text-[#666666]">
                Full equipment &amp; filter history
              </span>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] block">
                Assigned Referral / Sponsor
              </span>
              {activeCustomer.referralCode ? (
                <>
                  <p className="text-lg font-bold text-[#2D5A27] mt-1 font-mono">
                    {activeCustomer.referralCode}
                  </p>
                  <span className="text-[11px] text-[#666666]">
                    {activeCustomerSponsor?.name || activeCustomer.sponsorName || 'Registered Specialist'}
                  </span>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#777777] mt-1">No Referral Code</p>
                  <span className="text-[11px] text-[#777777]">Direct Storefront Customer</span>
                </>
              )}
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] block">
                Account Credentials
              </span>
              <p className="text-sm font-semibold text-[#111111] mt-1 capitalize">
                Role: {activeCustomer.role || 'customer'}
              </p>
              <span className="text-[11px] text-[#666666]">
                {activeCustomer.company || 'Individual Patron Account'}
              </span>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-[#F5F4F0] p-4 border border-[#E5E5E5] space-y-2">
            <p className="font-semibold uppercase text-[11px] tracking-wider text-[#111111] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Saved Delivery Addresses ({activeCustomer.addresses.length})
            </p>
            {activeCustomer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeCustomer.addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-3 border border-[#E5E5E5] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111111]">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-[#111111] text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[#666666]">{addr.phone}</p>
                    <p className="text-[#444444]">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                      {addr.postalCode ? ` ${addr.postalCode}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#777777] italic">No saved addresses on file.</p>
            )}
          </div>

          {/* Detailed Purchase History */}
          <div className="space-y-3">
            <h3 className="font-semibold uppercase text-xs tracking-wider text-[#111111] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Complete Purchase History ({customerOrders.length})
            </h3>

            {customerOrders.length > 0 ? (
              <div className="space-y-4">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="border border-[#E5E5E5] bg-[#FBFBFA] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#111111]">{ord.id}</span>
                        <span className="text-xs text-[#666666]">{formatDate(ord.createdAt)}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                            ord.status === 'Delivered'
                              ? 'bg-[#EAF3ED] text-[#477A5A]'
                              : ord.status === 'Cancelled'
                              ? 'bg-[#FBEAEA] text-[#B74747]'
                              : 'bg-white border border-[#E5E5E5] text-[#111111]'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-[#EAF3ED] text-[#477A5A]'
                              : 'bg-[#FDF6E2] text-[#8C6D1F]'
                          }`}
                        >
                          {ord.paymentStatus} ({ord.paymentMethod.toUpperCase()})
                        </span>
                        {ord.referralCode && (
                          <span className="text-[10px] font-mono bg-[#EBF3EA] text-[#2D5A27] px-2 py-0.5 font-semibold">
                            Ref: {ord.referralCode}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-[#111111]">
                          {formatPrice(ord.total)}
                        </span>
                      </div>
                    </div>

                    {/* Items inside this order */}
                    <div className="divide-y divide-[#E5E5E5] bg-white border border-[#E5E5E5]">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-[#F5F4F0] border border-[#E5E5E5] shrink-0 overflow-hidden">
                              <Image
                                src={it.image}
                                alt={it.productName}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-[#111111]">{it.productName}</p>
                              <p className="text-[11px] text-[#777777]">
                                Variant: {it.colorName} / {it.size} &bull; Qty: {it.quantity} &times;{' '}
                                {formatPrice(it.price)}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-[#111111]">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666666] pt-1">
                      <span>
                        Ship to: {ord.shippingAddress.street}, {ord.shippingAddress.city} ({ord.deliveryMethod})
                      </span>
                      <span>
                        Subtotal: {formatPrice(ord.subtotal)}
                        {ord.discountAmount > 0 ? ` • Discount: -${formatPrice(ord.discountAmount)}` : ''}
                        {` • Shipping: ${formatPrice(ord.shippingFee)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-[#E5E5E5] bg-[#FAF9F5] text-xs text-[#777777]">
                No purchase history recorded for {activeCustomer.email} yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
