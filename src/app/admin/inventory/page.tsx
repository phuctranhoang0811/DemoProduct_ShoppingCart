'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Boxes,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Product, ProductSize } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminInventoryPage() {
  const products = useCommerceStore((state) => state.products);
  const settings = useCommerceStore((state) => state.settings);
  const adjustStock = useCommerceStore((state) => state.adjustStock);
  const inventoryMovements = useCommerceStore((state) => state.inventoryMovements);

  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [stockDelta, setStockDelta] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Restock delivery from warehouse');

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedSize || stockDelta === 0) {
      toast.error('Please specify valid product, size, and quantity.');
      return;
    }

    adjustStock(selectedProduct.id, selectedSize, stockDelta, adjustReason);
    toast.success(`Inventory updated: ${stockDelta > 0 ? `+${stockDelta}` : stockDelta} units.`);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Inventory Management
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Monitor SKU levels across size variants, restock garments, and audit stock journals.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#E5E5E5] p-1 rounded-none text-xs">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'stock' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#555555]'
            }`}
          >
            Variant Stock Overview
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'movements' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#555555]'
            }`}
          >
            Stock Movement History ({inventoryMovements.length})
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4 font-semibold">Garment</th>
                  <th className="py-3.5 px-3 font-semibold">SKU</th>
                  <th className="py-3.5 px-3 font-semibold">Size Variant Levels</th>
                  <th className="py-3.5 px-3 font-semibold">Aggregate Stock</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {products.map((p) => {
                  const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                  const isLow = totalStock <= settings.lowStockThreshold && totalStock > 0;
                  const isOut = totalStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F9F9F8] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-14 bg-[#F5F4F0] flex-shrink-0 border border-[#E5E5E5] overflow-hidden">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#111111]">{p.name}</p>
                            <span className="text-[12px] text-[#777777] capitalize">{p.gender || 'Unisex'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-sm text-[#555555]">{p.sku}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-2">
                          {p.sizes.map((s) => (
                            <span
                              key={s.id}
                              className={`px-2 py-0.5 border text-xs font-mono ${
                                s.stock <= settings.lowStockThreshold
                                  ? 'border-[#B74747] text-[#B74747] bg-[#FBEAEA]'
                                  : 'border-[#E5E5E5] text-[#111111]'
                              }`}
                            >
                              <strong>{s.label}</strong>: {s.stock}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#111111]">
                            {totalStock}
                          </span>
                          {isOut ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#B74747] bg-[#FBEAEA] px-2 py-0.5">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D1F] bg-[#FDF6E2] px-2 py-0.5">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#477A5A] bg-[#EAF3ED] px-2 py-0.5">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setSelectedSize(p.sizes[0]?.label || '');
                            setStockDelta(10);
                            setAdjustReason('Factory inventory intake');
                          }}
                          className="px-3 py-1.5 border border-[#111111] text-xs uppercase tracking-wider font-semibold hover:bg-[#111111] hover:text-white transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Movements Audit Table */
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-3 font-semibold">Garment</th>
                <th className="py-3.5 px-3 font-semibold">Size</th>
                <th className="py-3.5 px-3 font-semibold">Delta</th>
                <th className="py-3.5 px-3 font-semibold">Reason / Audit Trail</th>
              </tr>
            </thead>
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[#777777] uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Garment Name</th>
                <th className="py-3 px-3 font-semibold">Variant</th>
                <th className="py-3 px-3 font-semibold">Change</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {inventoryMovements.map((m) => (
                <tr key={m.id} className="hover:bg-[#F9F9F8]">
                  <td className="py-3 px-4 text-[#777777]">{formatDate(m.date)}</td>
                  <td className="py-3 px-3 font-medium text-[#111111]">{m.productName}</td>
                  <td className="py-3 px-3 font-mono">{m.variantInfo}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-bold flex items-center gap-1 ${
                        m.change > 0 ? 'text-[#477A5A]' : 'text-[#B74747]'
                      }`}
                    >
                      {m.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {m.change > 0 ? `+${m.change}` : m.change}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#555555]">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-[#E5E5E5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-sm uppercase font-semibold text-[#111111] mb-1">
              Adjust Inventory Stock
            </h2>
            <p className="text-xs text-[#777777] mb-4">{selectedProduct.name} ({selectedProduct.sku})</p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Select Size Variant</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full border px-3 py-2 outline-none"
                >
                  {selectedProduct.sizes.map((s) => (
                    <option key={s.id} value={s.label}>
                      Size {s.label} (Current Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">
                  Quantity Adjustment (positive to add, negative to deduct)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="w-full border px-3 py-2 outline-none font-mono"
                  />
                  <span className="text-xs text-[#777777] whitespace-nowrap">units</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier delivery, inventory count sync"
                  className="w-full border px-3 py-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold"
                >
                  Confirm Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 border text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
