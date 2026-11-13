'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, X, Tag, LayoutGrid, Columns, Sparkles, Droplets, Zap, ShieldCheck } from 'lucide-react';
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
        <span className="text-xs uppercase tracking-widest text-blue-700 font-semibold block mb-1">
          {t.brand.name}
        </span>
        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#111111]">
          {t.shop.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#555555] mt-1 max-w-2xl">
          {t.shop.pageSubtitle}
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-28">
          <div className="glass-card p-5 rounded-2xl border border-blue-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <span className="text-xs uppercase tracking-wider font-bold text-[#111111] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-700" />
                {t.shop.filters}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-blue-700 hover:underline font-semibold"
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
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-blue-900 text-white font-semibold shadow-xs'
                      : 'text-[#444444] hover:bg-blue-50'
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
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-blue-900 text-white font-semibold shadow-xs'
                          : 'text-[#444444] hover:bg-blue-50'
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
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      selectedElectrode === 'all'
                        ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                        : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
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
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        selectedElectrode === count
                          ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                          : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
                      }`}
                    >
                      {count} {language === 'vi' ? 'Tấm' : 'Plates'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special collections */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">
                {language === 'vi' ? 'Phân Loại Nổi Bật' : 'Featured Highlights'}
              </span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: language === 'vi' ? 'Tất cả thiết bị' : 'All Equipment' },
                  { id: 'popular', label: language === 'vi' ? 'Dòng máy biểu tượng' : 'Flagship Icons' },
                  { id: 'new', label: language === 'vi' ? 'Thế hệ mới 2026' : 'New 2026 Generation' },
                  { id: 'sale', label: language === 'vi' ? 'Ưu đãi & Quà tặng kèm' : 'Special Promotions' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedSpecial(item.id);
                      setPage(1);
                    }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${
                      selectedSpecial === item.id
                        ? 'text-blue-700 font-semibold bg-blue-50'
                        : 'text-[#555555] hover:text-[#111111]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111] uppercase tracking-wider">
                  {t.shop.priceRange}
                </span>
                <span className="font-semibold text-blue-700">
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
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-blue-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs font-semibold text-[#111111]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                <span>{t.shop.filters}</span>
              </button>

              <span className="text-xs text-[#555555]">
                {t.shop.showingResults} <strong className="text-[#111111] font-semibold">{filteredProducts.length}</strong> {language === 'vi' ? 'sản phẩm' : 'products'}
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#777777] hidden sm:inline">{t.shop.sortBy}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 outline-none font-medium text-[#111111] cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#777777]">{t.shop.activeFilters}</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-blue-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedElectrode !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-full border border-cyan-200">
                  {selectedElectrode} {language === 'vi' ? 'Tấm điện cực' : 'Plates'}
                  <button onClick={() => setSelectedElectrode('all')} className="hover:text-cyan-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs text-red-600 hover:underline font-medium ml-2"
              >
                {t.shop.clearFilters}
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center glass-card p-10 rounded-3xl border border-blue-100 space-y-4">
              <Droplets className="w-12 h-12 text-blue-400 mx-auto" />
              <h3 className="text-lg font-semibold text-[#111111]">{t.shop.noResultsTitle}</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">{t.shop.noResultsDesc}</p>
              <button
                onClick={resetAllFilters}
                className="inline-block bg-[#111111] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-900 transition-all shadow-md"
              >
                {t.shop.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="glass-dark-btn text-[#111111] px-8 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold border border-[#E5E5E5] hover:border-[#111111] transition-all"
              >
                {language === 'vi' ? 'Xem Thêm Thiết Bị' : 'Load More Products'}
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
          Đang tải danh mục thiết bị Enagic...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
