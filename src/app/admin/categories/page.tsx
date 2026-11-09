'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit2, Trash2, X, FolderTree, ExternalLink } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Category } from '@/types';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const addCategory = useCommerceStore((state) => state.addCategory);
  const updateCategory = useCommerceStore((state) => state.updateCategory);
  const deleteCategory = useCommerceStore((state) => state.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description);
    setImage(c.image);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        image: image.trim(),
        status,
      });
      toast.success(`Category "${name}" updated.`);
    } else {
      addCategory({
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        image: image.trim(),
        status,
      });
      toast.success(`Category "${name}" created.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setDeleteId(null);
    toast.success('Category removed.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Categories
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Organize garments by classification and editorial sections.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => {
          const productCount = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div key={c.id} className="bg-white border border-[#E5E5E5] flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full bg-[#F5F4F0] overflow-hidden">
                  <Image src={c.image} alt={c.name} fill className="object-cover" sizes="300px" />
                  <span
                    className={`absolute top-2 right-2 text-[9px] uppercase font-bold px-2 py-0.5 ${
                      c.status === 'active'
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : 'bg-[#F5F4F0] text-[#777777]'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">{c.name}</h3>
                  <p className="text-[11px] text-[#777777] font-mono mt-0.5">/{c.slug}</p>
                  <p className="text-xs text-[#555555] mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <span className="font-medium text-[#777777]">{productCount} active garments</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 hover:text-[#111111] text-[#777777]"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 hover:text-[#B74747] text-[#777777]"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
              {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated from name"
                  className="w-full border px-3 py-2 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full border px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border px-3 py-2 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#777777] block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border px-3 py-2 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] text-white py-2.5 text-xs uppercase font-semibold"
                >
                  Save Category
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
            <h3 className="text-base font-semibold text-[#111111]">Delete Category?</h3>
            <p className="text-xs text-[#777777]">
              Garments in this category will remain in the catalog as unassigned.
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
