'use client';

import { useState } from 'react';
import {
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Power,
  Calendar,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Discount, DiscountType } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDiscountsPage() {
  const discounts = useCommerceStore((state) => state.discounts);
  const addDiscount = useCommerceStore((state) => state.addDiscount);
  const updateDiscount = useCommerceStore((state) => state.updateDiscount);
  const deleteDiscount = useCommerceStore((state) => state.deleteDiscount);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(100);
  const [maxDiscount, setMaxDiscount] = useState<number>(50);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(200);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setCode(`PROMO${Math.floor(10 + Math.random() * 90)}`);
    setType('percentage');
    setValue(15);
    setMinOrderAmount(150);
    setMaxDiscount(60);
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setUsageLimit(100);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (d: Discount) => {
    setEditingDiscount(d);
    setCode(d.code);
    setType(d.type);
    setValue(d.value);
    setMinOrderAmount(d.minOrderAmount);
    setMaxDiscount(d.maxDiscount || 0);
    setStartDate(d.startDate.split('T')[0]);
    setEndDate(d.endDate.split('T')[0]);
    setUsageLimit(d.usageLimit);
    setIsActive(d.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) {
      toast.error('Code and positive value are required.');
      return;
    }

    if (editingDiscount) {
      updateDiscount(editingDiscount.id, {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: maxDiscount > 0 ? Number(maxDiscount) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        usageLimit: Number(usageLimit),
        isActive,
      });
      toast.success(`Discount "${code}" updated.`);
    } else {
      addDiscount({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: maxDiscount > 0 ? Number(maxDiscount) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        usageLimit: Number(usageLimit),
        isActive,
      });
      toast.success(`Discount code "${code}" created.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDiscount(id);
    setDeleteId(null);
    toast.success('Discount code deleted.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Promotions & Discounts
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Configure campaign discount vouchers, minimum basket amounts, and usage caps.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Voucher</span>
        </button>
      </div>

      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-3">Type & Value</th>
              <th className="py-3.5 px-3">Min. Order</th>
              <th className="py-3.5 px-3">Valid Period</th>
              <th className="py-3.5 px-3">Usage</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {discounts.map((d) => (
              <tr key={d.id} className="hover:bg-[#F9F9F8] transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-sm text-[#111111] bg-[#F5F4F0] px-2.5 py-1 border border-[#E5E5E5]">
                    {d.code}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-medium text-sm text-[#111111]">
                  {d.type === 'percentage' ? `${d.value}% OFF` : `$${d.value} OFF`}
                  {d.maxDiscount ? ` (Cap $${d.maxDiscount})` : ''}
                </td>
                <td className="py-3.5 px-3 text-sm text-[#555555]">${d.minOrderAmount}</td>
                <td className="py-3.5 px-3 text-sm text-[#666666]">
                  {formatDate(d.startDate)} – {formatDate(d.endDate)}
                </td>
                <td className="py-3.5 px-3 font-mono text-sm text-[#555555]">
                  {d.usedCount} / {d.usageLimit}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                      d.isActive
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : 'bg-[#FBEAEA] text-[#B74747]'
                    }`}
                  >
                    {d.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(d)}
                      className="p-1.5 hover:text-[#111111] text-[#777777]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateDiscount(d.id, { isActive: !d.isActive });
                        toast.info(`Discount ${d.code} ${!d.isActive ? 'activated' : 'paused'}.`);
                      }}
                      className="p-1.5 hover:text-[#477A5A] text-[#777777]"
                      title="Toggle active"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(d.id)}
                      className="p-1.5 hover:text-[#B74747] text-[#777777]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-[#E5E5E5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-sm uppercase font-semibold text-[#111111] mb-4">
              {editingDiscount ? `Edit: ${editingDiscount.code}` : 'Create Promotion Voucher'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full border px-3 py-2 outline-none font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border px-3 py-2 outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full border px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Min. Order ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full border px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Max Cap ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    placeholder="Optional"
                    className="w-full border px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full border px-3 py-2 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#111111]"
                />
                <span>Active for immediate checkout redemption</span>
              </label>

              <div className="pt-3 border-t flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold"
                >
                  Save Code
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 border text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-[#E5E5E5] space-y-4">
            <h3 className="text-base font-semibold text-[#111111]">Delete Voucher?</h3>
            <p className="text-xs text-[#777777]">
              Customers will no longer be able to redeem this code during checkout.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#B74747] text-white py-2 text-xs uppercase font-semibold"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 border text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
