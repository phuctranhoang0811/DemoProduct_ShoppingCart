'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Droplets } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const currency = useCommerceStore((state) => state.currency);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedElectrode, setSelectedElectrode] = useState<number | 'all'>('all');
  const [selectedSpecial, setSelectedSpecial] = useState(searchParams.get('filter') || 'all');
  const [priceRange, setPriceRange] = useState<number>(currency === 'VND' ? 200000000 : 7000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
    const fil = searchParams.get('filter');
    if (fil !== null) setSelectedSpecial(fil);
  }, [searchParams]);

  useEffect(() => {
    setPriceRange(currency === 'VND' ? 200000000 : 7000);
  }, [currency]);

  // Available electrode options from products
  const electrodeOptions = useMemo(() => {
    const set = new Set<number>();
    products.forEach((p) => {
      if (p.specifications?.electrodes) {
        const val = Number(p.specifications.electrodes);
        if (!isNaN(val)) set.add(val);
      }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameVi = p.nameVi?.toLowerCase() || '';
        const nameEn = p.nameEn?.toLowerCase() || '';
        const descVi = p.descriptionVi?.toLowerCase() || '';
        const descEn = p.descriptionEn?.toLowerCase() || '';
        const match =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          nameVi.includes(q) ||
          nameEn.includes(q) ||
          descVi.includes(q) ||
          descEn.includes(q);
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Special filters
      if (selectedSpecial === 'new' && !p.newArrival) return false;
      if (selectedSpecial === 'sale' && !p.sale) return false;
      if (selectedSpecial === 'popular' && !p.bestSeller) return false;

      // Electrodes filter
      if (selectedElectrode !== 'all') {
        if (Number(p.specifications?.electrodes) !== selectedElectrode) return false;
      }

      // Price
      const itemPrice = currency === 'VND' ? p.price * 25000 : p.price;
      if (itemPrice > priceRange) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedElectrode,
    selectedSpecial,
    priceRange,
    currency,
    sortBy,
  ]);

  const displayedProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = displayedProducts.length < filteredProducts.length;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedElectrode('all');
    setSelectedSpecial('all');
    setPriceRange(currency === 'VND' ? 200000000 : 7000);
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedElectrode !== 'all' ||
    selectedSpecial !== 'all' ||
    searchQuery.trim().length > 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 border-b border-[#E5E5E5] pb-6">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          {t.shop.pageTitle}
        </h1>
        <p className="text-xs text-[#777777] mt-1 max-w-xl">
          {t.shop.pageSubtitle}
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-28">
          <div className="p-5 rounded-xs border border-[#E5E5E5] bg-white space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#111111]" />
                {t.shop.filters}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-[#777777] hover:text-[#111111] underline"
                >
                  {t.shop.resetFilters}
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">
                {t.shop.categories}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#111111] text-white font-medium'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F5F4F0]'
                  }`}
                >
                  {t.shop.allCategories}
                </button>
                {categories.map((cat) => {
                  const catName = language === 'vi' ? cat.nameVi || cat.name : cat.nameEn || cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setPage(1);
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xs transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#111111] text-white font-medium'
                          : 'text-[#666666] hover:text-[#111111] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Electrode Plates Filter */}
            {electrodeOptions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">
                  {t.shop.electrodesFilter}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedElectrode('all');
                      setPage(1);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xs border transition-colors ${
                      selectedElectrode === 'all'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#111111]'
                    }`}
                  >
                    {language === 'vi' ? 'Tất Cả' : 'All'}
                  </button>
                  {electrodeOptions.map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setSelectedElectrode(count);
                        setPage(1);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-xs border transition-colors ${
                        selectedElectrode === count
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#111111]'
                      }`}
                    >
                      {count} {language === 'vi' ? 'Tấm' : 'Plates'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price slider */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111] uppercase tracking-wider">
                  {t.shop.priceRange}
                </span>
                <span className="font-medium text-[#111111]">
                  {formatPrice(currency === 'VND' ? priceRange / 25000 : priceRange, currency)}
                </span>
              </div>
              <input
                type="range"
                min={currency === 'VND' ? 500000 : 50}
                max={currency === 'VND' ? 200000000 : 7000}
                step={currency === 'VND' ? 1000000 : 50}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#111111] cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#E5E5E5] text-xs font-semibold text-[#111111]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.shop.filters}</span>
              </button>

              <span className="text-xs text-[#777777]">
                {t.shop.showingResults} <strong className="text-[#111111] font-semibold">{filteredProducts.length}</strong>
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#777777] hidden sm:inline">{t.shop.sortBy}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-white border border-[#E5E5E5] rounded-xs px-2.5 py-1.5 outline-none font-medium text-[#111111] cursor-pointer"
              >
                <option value="popular">{t.shop.sortPopular}</option>
                <option value="newest">{t.shop.sortNewest}</option>
                <option value="price-asc">{t.shop.sortPriceAsc}</option>
                <option value="price-desc">{t.shop.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#F5F4F0] text-[#111111] px-2.5 py-1 rounded-full">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedElectrode !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#F5F4F0] text-[#111111] px-2.5 py-1 rounded-full">
                  {selectedElectrode} {language === 'vi' ? 'Tấm' : 'Plates'}
                  <button onClick={() => setSelectedElectrode('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#F5F4F0] text-[#111111] px-2.5 py-1 rounded-full">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#777777] hover:text-[#111111] underline ml-1"
              >
                {t.shop.clearFilters}
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Droplets className="w-8 h-8 text-[#CCCCCC] mx-auto" />
              <h3 className="text-base font-normal text-[#111111]">{t.shop.noResultsTitle}</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">{t.shop.noResultsDesc}</p>
              <button
                onClick={resetAllFilters}
                className="inline-block mt-2 bg-[#111111] text-white px-5 py-2 rounded-xs text-xs font-semibold"
              >
                {t.shop.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="bg-white text-[#111111] px-8 py-3 rounded-xs text-xs uppercase tracking-wider font-semibold border border-[#E5E5E5] hover:border-[#111111] transition-colors"
              >
                {language === 'vi' ? 'Xem Thêm' : 'Load More'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto px-4 py-20 text-center text-xs text-[#777777]">
          Loading...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
