'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const settings = useCommerceStore((state) => state.settings);
  const updateSettings = useCommerceStore((state) => state.updateSettings);

  const [form, setForm] = useState({
    storeName: settings.storeName,
    storeDescription: settings.storeDescription,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    shippingFee: settings.shippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    currency: settings.currency,
    announcementText: settings.announcementText,
    lowStockThreshold: settings.lowStockThreshold,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: form.storeName,
      storeDescription: form.storeDescription,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      shippingFee: Number(form.shippingFee),
      freeShippingThreshold: Number(form.freeShippingThreshold),
      currency: form.currency,
      announcementText: form.announcementText,
      lowStockThreshold: Number(form.lowStockThreshold),
    });
    toast.success('Store parameters saved and synchronized with storefront.');
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
          Store Settings
        </h1>
        <p className="text-sm text-[#666666] mt-1">
          Configure general store identity, announcement banners, shipping tariffs, and inventory thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 border border-[#E5E5E5] text-xs">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pb-2 border-b border-[#E5E5E5]">
          Store Identity & Contact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Store Brand Name</label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full border px-3 py-2 outline-none font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Primary Currency</label>
            <input
              type="text"
              required
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full border px-3 py-2 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Concierge Email</label>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full border px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full border px-3 py-2 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] text-[#777777] block mb-1">Brand Description</label>
            <textarea
              rows={2}
              value={form.storeDescription}
              onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
              className="w-full border px-3 py-2 outline-none resize-none"
            />
          </div>
        </div>

        <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pt-4 pb-2 border-b border-[#E5E5E5]">
          Storefront Announcement Bar
        </h2>

        <div>
          <label className="text-[11px] text-[#777777] block mb-1">
            Announcement Message (Visible at very top of storefront)
          </label>
          <input
            type="text"
            value={form.announcementText}
            onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
            className="w-full border px-3 py-2 outline-none"
          />
        </div>

        <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] pt-4 pb-2 border-b border-[#E5E5E5]">
          Shipping Tariffs & Logistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Standard Shipping Fee ($)</label>
            <input
              type="number"
              min="0"
              value={form.shippingFee}
              onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
              className="w-full border px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Free Shipping Order Threshold ($)</label>
            <input
              type="number"
              min="0"
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
              className="w-full border px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#777777] block mb-1">Low-Stock Alert Threshold (Units)</label>
            <input
              type="number"
              min="1"
              value={form.lowStockThreshold}
              onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
              className="w-full border px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#111111] text-white px-6 py-2.5 text-xs uppercase font-semibold hover:bg-[#333333]"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
}
