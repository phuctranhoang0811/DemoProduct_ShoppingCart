'use client';

import { useState, useMemo } from 'react';
import { Search, User, Mail, Phone, Calendar, ShoppingBag, Eye, X, Power } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Customer } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const customers = useCommerceStore((state) => state.customers);
  const orders = useCommerceStore((state) => state.orders);
  const toggleCustomerStatus = useCommerceStore((state) => state.toggleCustomerStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase() ||
        o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Customers
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Registered patrons, purchasing history, and communication credentials.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-[#E5E5E5]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-[#F5F4F0] pl-9 pr-3 py-2 text-sm text-[#111111] outline-none border border-transparent focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-3">Contact Info</th>
              <th className="py-3.5 px-3">Joined</th>
              <th className="py-3.5 px-3">Orders</th>
              <th className="py-3.5 px-3">Lifetime Spend</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filteredCustomers.map((c) => {
              // Calculate actual dynamic total orders and spent from orders dataset
              const liveOrders = orders.filter(
                (o) =>
                  o.customerEmail.toLowerCase() === c.email.toLowerCase() ||
                  o.customerName.toLowerCase() === c.name.toLowerCase()
              );
              const liveSpend = liveOrders
                .filter((o) => o.status !== 'Cancelled')
                .reduce((sum, o) => sum + o.total, 0);

              return (
                <tr key={c.id} className="hover:bg-[#F9F9F8] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-sm text-[#111111]">{c.name}</p>
                    <span className="text-[12px] text-[#777777] font-mono">{c.id}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-sm text-[#111111]">{c.email}</p>
                    <p className="text-[12px] text-[#777777]">{c.phone}</p>
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
                        className="px-3 py-1.5 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
                      >
                        Profile
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
            })}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#E5E5E5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-4 mb-6">
              <span className="text-[10px] uppercase font-bold text-[#777777]">Customer Dossier</span>
              <h2 className="text-xl font-light text-[#111111] mt-0.5">{selectedCustomer.name}</h2>
              <p className="text-xs text-[#777777]">{selectedCustomer.email} &bull; {selectedCustomer.phone}</p>
            </div>

            {/* Address */}
            <div className="mb-6 bg-[#F5F4F0] p-4 text-xs">
              <p className="font-semibold uppercase text-[11px] mb-2 text-[#111111]">Saved Addresses</p>
              {selectedCustomer.addresses.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr) => (
                    <div key={addr.id} className="border-b border-[#E5E5E5] pb-2 last:border-b-0">
                      <p className="font-medium">{addr.fullName} ({addr.phone})</p>
                      <p className="text-[#555]">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#777] italic">No addresses saved yet.</p>
              )}
            </div>

            {/* Orders */}
            <div className="space-y-3">
              <p className="font-semibold uppercase text-[11px] text-[#111111]">
                Purchase History ({customerOrders.length})
              </p>
              {customerOrders.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] max-h-56 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-medium">{ord.id}</span>
                        <p className="text-[10px] text-[#777777]">{formatDate(ord.createdAt)} &bull; {ord.status}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(ord.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777777]">No recorded orders.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="mt-6 w-full bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
