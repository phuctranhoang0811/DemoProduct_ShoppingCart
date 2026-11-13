'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Product, ProductColor, ProductSize } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const addProduct = useCommerceStore((state) => state.addProduct);
  const updateProduct = useCommerceStore((state) => state.updateProduct);
  const deleteProduct = useCommerceStore((state) => state.deleteProduct);
  const bulkDeleteProducts = useCommerceStore((state) => state.bulkDeleteProducts);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    materials: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    status: 'active' as 'active' | 'draft' | 'out_of_stock',
    featured: false,
    bestSeller: false,
    newArrival: false,
    sale: false,
    gender: 'unisex' as 'women' | 'men' | 'unisex',
    imageUrl1: '',
    imageUrl2: '',
    // Sizes
    stockXS: 10,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    // Colors
    colorName1: 'Black',
    colorHex1: '#111111',
    colorName2: 'White',
    colorHex2: '#F9F9F9',
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: `COS-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      materials: '100% Organic Cotton',
      price: 120,
      originalPrice: 0,
      categoryId: categories[0]?.id || '',
      status: 'active',
      featured: false,
      bestSeller: false,
      newArrival: true,
      sale: false,
      gender: 'unisex',
      imageUrl1: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000',
      imageUrl2: '',
      stockXS: 8,
      stockS: 12,
      stockM: 10,
      stockL: 6,
      colorName1: 'Deep Black',
      colorHex1: '#111111',
      colorName2: 'Pure White',
      colorHex2: '#FFFFFF',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      materials: p.materials || '',
      price: p.price,
      originalPrice: p.originalPrice || 0,
      categoryId: p.categoryId,
      status: p.status,
      featured: p.featured,
      bestSeller: p.bestSeller,
      newArrival: !!p.newArrival,
      sale: !!p.sale,
      gender: p.gender || 'unisex',
      imageUrl1: p.images[0] || '',
      imageUrl2: p.images[1] || '',
      stockXS: p.sizes.find((s) => s.label === 'XS' || s.label === '36')?.stock || 5,
      stockS: p.sizes.find((s) => s.label === 'S' || s.label === '38')?.stock || 10,
      stockM: p.sizes.find((s) => s.label === 'M' || s.label === '40')?.stock || 8,
      stockL: p.sizes.find((s) => s.label === 'L' || s.label === '42')?.stock || 4,
      colorName1: p.colors[0]?.name || 'Primary',
      colorHex1: p.colors[0]?.hex || '#111111',
      colorName2: p.colors[1]?.name || '',
      colorHex2: p.colors[1]?.hex || '',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) {
      toast.error('Please fill in required fields (Name, SKU, Category).');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than zero.');
      return;
    }

    if (formData.originalPrice > 0 && formData.originalPrice <= formData.price) {
      toast.error('Original price must be greater than sale price.');
      return;
    }

    const images = [formData.imageUrl1];
    if (formData.imageUrl2) images.push(formData.imageUrl2);

    const sizes: ProductSize[] = [
      { id: 's-xs', label: 'XS', stock: Number(formData.stockXS) || 0 },
      { id: 's-s', label: 'S', stock: Number(formData.stockS) || 0 },
      { id: 's-m', label: 'M', stock: Number(formData.stockM) || 0 },
      { id: 's-l', label: 'L', stock: Number(formData.stockL) || 0 },
    ];

    const colors: ProductColor[] = [
      { id: 'c-1', name: formData.colorName1, hex: formData.colorHex1 },
    ];
    if (formData.colorName2 && formData.colorHex2) {
      colors.push({ id: 'c-2', name: formData.colorName2, hex: formData.colorHex2 });
    }

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
    const computedStatus = totalStock === 0 ? 'out_of_stock' : formData.status;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        slug,
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        materials: formData.materials.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        categoryId: formData.categoryId,
        status: computedStatus,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        sale: formData.sale,
        gender: formData.gender,
        images,
        sizes,
        colors,
      });
      toast.success(`Updated garment "${formData.name}".`);
    } else {
      addProduct({
        name: formData.name.trim(),
        slug,
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        materials: formData.materials.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        categoryId: formData.categoryId,
        status: computedStatus,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        sale: formData.sale,
        gender: formData.gender,
        images,
        sizes,
        colors,
      });
      toast.success(`Created garment "${formData.name}".`);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    toast.success('Garment removed from catalog and storefront.');
  };

  const handleBulkDelete = () => {
    bulkDeleteProducts(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteConfirmOpen(false);
    toast.success(`Deleted ${selectedIds.length} selected garments.`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Product Catalog
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Manage garment listings, variants, pricing, and active statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B74747] text-white text-xs uppercase tracking-wider font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter / Search controls */}
      <div className="bg-white p-4 border border-[#E5E5E5] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by title, SKU, or slug..."
            className="w-full bg-[#F5F4F0] pl-9 pr-3 py-2 text-sm text-[#111111] outline-none border border-transparent focus:border-[#111111]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-[#F5F4F0] px-3 py-2 text-sm text-[#111111] border border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#F5F4F0] px-3 py-2 text-sm text-[#111111] border border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="p-3.5 w-9">
                <input
                  type="checkbox"
                  checked={
                    paginatedProducts.length > 0 &&
                    selectedIds.length === paginatedProducts.length
                  }
                  onChange={toggleSelectAll}
                  className="accent-[#111111]"
                />
              </th>
              <th className="py-3.5 px-3">Garment</th>
              <th className="py-3.5 px-3">SKU</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Price</th>
              <th className="py-3.5 px-3">Total Stock</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {paginatedProducts.map((p) => {
              const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
              const category = categories.find((c) => c.id === p.categoryId);
              const isSelected = selectedIds.includes(p.id);

              return (
                <tr key={p.id} className={`hover:bg-[#F9F9F8] transition-colors ${isSelected ? 'bg-[#F5F4F0]' : ''}`}>
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectId(p.id)}
                      className="accent-[#111111]"
                    />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 bg-white rounded-sm flex-shrink-0 border border-[#E5E5E5] p-0.5 overflow-hidden flex items-center justify-center">
                        <Image src={p.images[0]} alt={p.name} fill className="object-contain" sizes="44px" />
                      </div>
                      <div>
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="font-medium text-sm text-[#111111] hover:underline flex items-center gap-1.5"
                        >
                          {p.name} <ExternalLink className="w-3 h-3 text-[#777777]" />
                        </Link>
                        <span className="text-[12px] text-[#777777] block font-mono mt-0.5">
                          /{p.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-sm text-[#555555]">{p.sku}</td>
                  <td className="py-3.5 px-3 text-sm text-[#555555]">{category?.name || 'Unassigned'}</td>
                  <td className="py-3.5 px-3 font-semibold text-sm text-[#111111]">
                    {formatPrice(p.price)}
                    {p.originalPrice && (
                      <span className="block text-xs text-[#777777] line-through font-normal">
                        {formatPrice(p.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-mono font-medium text-sm ${
                        totalStock <= 5 ? 'text-[#B74747] font-bold' : 'text-[#111111]'
                      }`}
                    >
                      {totalStock} units
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                        p.status === 'active'
                          ? 'bg-[#EAF3ED] text-[#477A5A]'
                          : p.status === 'draft'
                          ? 'bg-[#F5F4F0] text-[#777777]'
                          : 'bg-[#FBEAEA] text-[#B74747]'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#F5F4F0]"
                        title="Edit garment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1.5 text-[#555555] hover:text-[#B74747] hover:bg-[#FBEAEA]"
                        title="Delete garment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#777777]">
                  No garments found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E5E5E5] flex items-center justify-between text-sm text-[#555555]">
          <span>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} of{' '}
            {filteredProducts.length} items
          </span>
          <div className="flex gap-1.5 items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs uppercase font-medium border border-[#E5E5E5] hover:bg-[#F5F4F0] disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-xs font-mono font-medium text-[#111111]">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs uppercase font-medium border border-[#E5E5E5] hover:bg-[#F5F4F0] disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#E5E5E5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#777777] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-semibold text-[#111111] mb-4">
              {editingProduct ? `Edit Garment: ${editingProduct.name}` : 'Add New Garment'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Sale Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Primary Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl1}
                    onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-[#777777] block mb-1">Secondary Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl2}
                    onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  />
                </div>

                {/* Stock distribution */}
                <div className="col-span-2 bg-[#F5F4F0] p-3 space-y-2">
                  <p className="font-semibold text-[#111111] uppercase tracking-wider text-[10px]">
                    Size Variant Stock
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-[#777]">XS:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockXS}
                        onChange={(e) => setFormData({ ...formData, stockXS: Number(e.target.value) })}
                        className="w-full bg-white border p-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777]">S:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockS}
                        onChange={(e) => setFormData({ ...formData, stockS: Number(e.target.value) })}
                        className="w-full bg-white border p-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777]">M:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockM}
                        onChange={(e) => setFormData({ ...formData, stockM: Number(e.target.value) })}
                        className="w-full bg-white border p-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777]">L:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockL}
                        onChange={(e) => setFormData({ ...formData, stockL: Number(e.target.value) })}
                        className="w-full bg-white border p-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Options */}
                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#777777] block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full border border-[#E5E5E5] px-3 py-2 outline-none"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>

                <div className="col-span-2 flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="accent-[#111111]"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bestSeller}
                      onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                      className="accent-[#111111]"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newArrival}
                      onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                      className="accent-[#111111]"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sale}
                      onChange={(e) => setFormData({ ...formData, sale: e.target.checked })}
                      className="accent-[#111111]"
                    />
                    <span>Sale Badge</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold"
                >
                  {editingProduct ? 'Save Changes' : 'Create Garment'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 border text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-[#E5E5E5] space-y-4">
            <h3 className="text-base font-semibold text-[#111111]">Delete Garment?</h3>
            <p className="text-xs text-[#777777]">
              This will remove the item from the catalog, cart, and storefront wishlist immediately.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 bg-[#B74747] text-white py-2 text-xs uppercase font-semibold hover:bg-[#963737]"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 border text-xs uppercase font-medium hover:bg-[#F5F4F0]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-[#E5E5E5] space-y-4">
            <h3 className="text-base font-semibold text-[#111111]">
              Delete {selectedIds.length} Garments?
            </h3>
            <p className="text-xs text-[#777777]">
              Are you sure you want to permanently delete all selected items from the store?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex-1 bg-[#B74747] text-white py-2 text-xs uppercase font-semibold hover:bg-[#963737]"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="flex-1 border text-xs uppercase font-medium hover:bg-[#F5F4F0]"
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
