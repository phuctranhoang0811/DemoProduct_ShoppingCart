'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, X, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const currency = useCommerceStore((state) => state.currency);

  // Global ESC key listener
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
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q))
      );
    }).slice(0, 8);
  }, [query, selectedCategory, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex justify-center pt-12 sm:pt-20 px-4">
      <div className="glass-card w-full max-w-2xl shadow-2xl p-6 self-start border border-white/60 animate-in fade-in zoom-in-95 duration-200 rounded-sm">
        {/* Search Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3 w-full">
            <SearchIcon className="w-5 h-5 text-[#111111]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search garments by name, fabric, or SKU (e.g. Wool, Poplin, Coat)..."
              className="w-full text-base sm:text-lg outline-none placeholder-[#888888] bg-transparent text-[#111111] font-normal"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-[#F5F4F0] transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-3 border-b border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs transition-all font-medium whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F5F4F0] text-[#555555] hover:text-[#111111]'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all font-medium whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F5F4F0] text-[#555555] hover:text-[#111111]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Live Search Results List */}
        {query.trim() && (
          <div className="mt-3 max-h-[55vh] overflow-y-auto pr-1">
            {results.length > 0 ? (
              <div className="divide-y divide-[#E5E5E5]">
                {results.map((product) => {
                  const categoryName = categories.find((c) => c.id === product.categoryId)?.name;
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 hover:bg-[#F5F4F0] px-2 rounded-xs transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-14 h-18 bg-[#F5F4F0] rounded-xs flex-shrink-0 overflow-hidden border border-[#E5E5E5]">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="56px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-[#111111] group-hover:underline truncate">
                            {product.name}
                          </p>
                          {product.sale && (
                            <span className="text-[10px] font-semibold bg-[#9E3A3A] text-white px-1.5 py-0.2 rounded-full">
                              Sale
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#777777] mt-0.5">
                          {categoryName} &bull; <span className="font-mono text-[11px]">{product.sku}</span>
                        </p>
                        {/* Swatches */}
                        {product.colors.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {product.colors.map((c) => (
                              <span
                                key={c.id}
                                className="w-2 h-2 rounded-full border border-black/15 inline-block"
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <span className="font-semibold text-sm text-[#111111] block">
                          {formatPrice(product.price, currency)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-[#888888] line-through block">
                            {formatPrice(product.originalPrice, currency)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                <div className="pt-4 text-center">
                  <Link
                    href={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#B9A58B]"
                  >
                    <span>View all matching garments in Shop</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#777777] text-sm space-y-2">
                <p className="font-medium text-[#111111]">No garments found matching &ldquo;{query}&rdquo;.</p>
                <p className="text-xs text-[#777777]">
                  Try searching with broader terms like &ldquo;Wool&rdquo;, &ldquo;Shirt&rdquo;, or &ldquo;Black&rdquo;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Popular Searches when query is empty */}
        {!query.trim() && (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                <span>Popular Searches</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Poplin Shirt',
                  'Wool Trousers',
                  'Cocoon Coat',
                  'Cashmere',
                  'Double-Faced Wool',
                  'Organic Cotton',
                  'Black Dress',
                  'Trench Coat',
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-[#F5F4F0] text-xs font-medium text-[#333333] hover:bg-[#111111] hover:text-white transition-all shadow-2xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] text-[#777777]">
              <span>Tip: Press <kbd className="bg-[#E5E5E5] text-[#111111] px-1.5 py-0.5 rounded font-mono">ESC</kbd> to close</span>
              <span>All 24 SS26 styles available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
