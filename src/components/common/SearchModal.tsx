'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const products = useCommerceStore((state) => state.products);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.status === 'active' &&
        (p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center pt-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl p-6 self-start border border-[#E5E5E5] animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3 w-full">
            <SearchIcon className="w-5 h-5 text-[#777777]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, SKU or description..."
              className="w-full text-lg outline-none placeholder-[#999999] bg-transparent text-[#111111]"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#777777] hover:text-[#111111] transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {query.trim() && (
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="divide-y divide-[#E5E5E5]">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 hover:bg-[#F5F4F0] px-2 transition-colors group"
                  >
                    <div className="relative w-14 h-20 bg-[#F5F4F0] flex-shrink-0 overflow-hidden border border-[#E5E5E5]">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#111111] group-hover:underline">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#777777] mt-0.5 font-mono">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-sm text-[#111111]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#777777] line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                <div className="pt-4 text-center">
                  <Link
                    href={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#B9A58B]"
                  >
                    View all results in Shop <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#777777] text-sm">
                No products found matching &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-[#777777] mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Cashmere', 'Poplin Shirt', 'Wool Trousers', 'Trench Coat', 'Black Dress', 'Leather Bag'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 bg-[#F5F4F0] text-xs hover:bg-[#E5E5E5] transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
