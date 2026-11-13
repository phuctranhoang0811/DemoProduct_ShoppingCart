'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, X, ArrowRight, Sparkles, Droplets } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const currency = useCommerceStore((state) => state.currency);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      const nameVi = p.nameVi?.toLowerCase() || '';
      const nameEn = p.nameEn?.toLowerCase() || '';
      const descVi = p.descriptionVi?.toLowerCase() || '';
      const descEn = p.descriptionEn?.toLowerCase() || '';
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        nameVi.includes(q) ||
        nameEn.includes(q) ||
        descVi.includes(q) ||
        descEn.includes(q)
      );
    }).slice(0, 6);
  }, [query, selectedCategory, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-2xl shadow-2xl p-6 self-start border border-white/80 animate-scale-in duration-200 rounded-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/60">
          <div className="flex items-center gap-3 w-full">
            <SearchIcon className="w-5 h-5 text-blue-700" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full text-base sm:text-lg outline-none placeholder-[#888888] bg-transparent text-[#111111] font-normal"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-white/80 transition-colors btn-tactile"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all duration-150 btn-tactile ${
              selectedCategory === 'all'
                ? 'bg-blue-900 text-white font-medium shadow-xs'
                : 'text-[#666666] hover:bg-blue-50'
            }`}
          >
            {t.shop.allCategories}
          </button>
          {categories.map((c) => {
            const catName = language === 'vi' ? c.nameVi || c.name : c.nameEn || c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all duration-150 btn-tactile ${
                  selectedCategory === c.id
                    ? 'bg-blue-900 text-white font-medium shadow-xs'
                    : 'text-[#666666] hover:bg-blue-50'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777777] space-y-2">
              <Droplets className="w-8 h-8 text-blue-400 mx-auto" />
              <p>{t.shop.noResultsTitle}</p>
            </div>
          ) : results.length > 0 ? (
            results.map((product) => {
              const pName = language === 'vi' ? product.nameVi || product.name : product.nameEn || product.name;
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-blue-50/60 transition-colors group"
                >
                  <div className="relative w-14 h-16 bg-[#F5F8FA] flex-shrink-0 rounded-lg overflow-hidden border border-black/5">
                    <Image src={product.images[0]} alt={pName} fill className="object-cover" sizes="60px" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-[#111111] group-hover:text-blue-700 transition-colors">
                      {pName}
                    </h4>
                    <p className="text-[11px] text-[#777777] font-mono mt-0.5">{product.sku}</p>
                    <span className="text-xs font-semibold text-blue-900 mt-1 block">
                      {formatPrice(product.price, currency)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-[#888888]">
              {language === 'vi'
                ? 'Gợi ý: Tìm "K8", "SD501", "FC1", "Anespa", "Titanium"...'
                : 'Suggestions: Try searching "K8", "SD501", "FC1", "Anespa"...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
