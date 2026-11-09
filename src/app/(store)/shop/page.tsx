'use client';

import { useState, useMemo, useEffect, Suspense, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, X, Tag, LayoutGrid, Columns, ArrowUpRight } from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { ProductCard } from '@/components/product/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'all');
  const [selectedSpecial, setSelectedSpecial] = useState(searchParams.get('filter') || 'all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [priceRange, setPriceRange] = useState<number>(500);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [gridDensity, setGridDensity] = useState<'catalog' | 'editorial'>('catalog');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
    const gen = searchParams.get('gender');
    if (gen !== null) setSelectedGender(gen);
    const fil = searchParams.get('filter');
    if (fil !== null) setSelectedSpecial(fil);
  }, [searchParams]);

  // Extract all unique sizes and colors
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s.label)));
    return Array.from(sizes);
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Gender
      if (selectedGender !== 'all') {
        if (p.gender !== selectedGender && p.gender !== 'unisex') return false;
      }

      // Special filters
      if (selectedSpecial === 'new' && !p.newArrival) return false;
      if (selectedSpecial === 'sale' && !p.sale) return false;

      // Price
      if (p.price > priceRange) return false;

      // Size
      if (selectedSize !== 'all') {
        const hasSize = p.sizes.some((s) => s.label === selectedSize && s.stock > 0);
        if (!hasSize) return false;
      }

      // Color
      if (selectedColor !== 'all') {
        const hasColor = p.colors.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase());
        if (!hasColor) return false;
      }

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
    selectedGender,
    selectedSpecial,
    priceRange,
    selectedSize,
    selectedColor,
    sortBy,
  ]);

  const displayedProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = displayedProducts.length < filteredProducts.length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedSpecial('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setPriceRange(500);
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    selectedGender !== 'all' ||
    selectedSpecial !== 'all' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    priceRange < 500;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Header Banner */}
      <div className="mb-8 border-b border-[#E5E5E5] pb-6">
        <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-[#111111]">
          {selectedCategory !== 'all'
            ? categories.find((c) => c.id === selectedCategory)?.name || 'Collection'
            : selectedSpecial === 'new'
            ? 'New Arrivals'
            : selectedSpecial === 'sale'
            ? 'Seasonal Archive & Sale'
            : selectedGender === 'women'
            ? "Women's Collection"
            : selectedGender === 'men'
            ? "Men's Collection"
            : 'All Garments'}
        </h1>
        <p className="text-sm sm:text-base text-[#666666] mt-2 max-w-xl font-normal leading-relaxed">
          Tactile textures, architectural silhouettes, and calm Scandinavian palettes conceived for
          longevity and quiet luxury.
        </p>
      </div>

      {/* Control bar: count, mobile filter trigger, sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#E5E5E5] gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 border border-[#111111] text-xs uppercase font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && '(Active)'}
          </button>
          <span className="text-sm text-[#666666] tracking-normal">
            Showing <strong className="text-[#111111] font-semibold">{filteredProducts.length}</strong> styles
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs uppercase tracking-wider text-[#777777] hover:text-[#111111] underline transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Controls: Grid View Switcher + Sort Selector */}
        <div className="flex items-center gap-6 self-end sm:self-auto">
          {/* Grid View Switcher */}
          <div className="hidden sm:flex items-center gap-1 border-r border-[#E5E5E5] pr-4">
            <button
              type="button"
              onClick={() => setGridDensity('catalog')}
              className={`p-1.5 transition-colors ${
                gridDensity === 'catalog'
                  ? 'text-[#111111] bg-[#F5F4F0]'
                  : 'text-[#999999] hover:text-[#111111]'
              }`}
              title="Catalog Grid (3 Columns)"
              aria-label="Switch to 3 column catalog view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridDensity('editorial')}
              className={`p-1.5 transition-colors ${
                gridDensity === 'editorial'
                  ? 'text-[#111111] bg-[#F5F4F0]'
                  : 'text-[#999999] hover:text-[#111111]'
              }`}
              title="Editorial View (2 Columns)"
              aria-label="Switch to 2 column editorial view"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-[#666666] flex items-center gap-1 uppercase tracking-wider font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs uppercase font-medium bg-transparent border-b border-[#111111] py-1 pl-1 pr-6 outline-none cursor-pointer tracking-wider"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills (Click to remove single filter) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in duration-150">
          <span className="text-[11px] text-[#777777] uppercase tracking-wider mr-1">Active:</span>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] hover:border-[#111111] transition-colors"
            >
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] hover:border-[#111111] transition-colors"
            >
              <span>{categories.find((c) => c.id === selectedCategory)?.name}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {selectedGender !== 'all' && (
            <button
              onClick={() => setSelectedGender('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] capitalize hover:border-[#111111] transition-colors"
            >
              <span>Gender: {selectedGender}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {selectedSpecial !== 'all' && (
            <button
              onClick={() => setSelectedSpecial('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] capitalize hover:border-[#111111] transition-colors"
            >
              <span>{selectedSpecial === 'new' ? 'New Arrivals' : 'Sale Archive'}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {selectedSize !== 'all' && (
            <button
              onClick={() => setSelectedSize('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] hover:border-[#111111] transition-colors"
            >
              <span>Size: {selectedSize}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {selectedColor !== 'all' && (
            <button
              onClick={() => setSelectedColor('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] hover:border-[#111111] transition-colors"
            >
              <span>Color: {selectedColor}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}

          {priceRange < 500 && (
            <button
              onClick={() => setPriceRange(500)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] hover:border-[#111111] transition-colors"
            >
              <span>Under ${priceRange}</span>
              <X className="w-3 h-3 text-[#777777]" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sticky Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-6 border-r border-[#E5E5E5] sticky top-28 self-start max-h-[80vh] overflow-y-auto">
          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-3">
              Categories
            </h3>
            <ul className="space-y-1 text-xs text-[#555555]">
              <li>
                <button
                  onClick={() => { setSelectedCategory('all'); setPage(1); }}
                  className={`w-full text-left py-1 hover:text-[#111111] transition-colors flex items-center justify-between ${
                    selectedCategory === 'all' ? 'font-semibold text-[#111111]' : ''
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-[#999999]">{products.length}</span>
                </button>
              </li>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => { setSelectedCategory(c.id); setPage(1); }}
                      className={`w-full text-left py-1 hover:text-[#111111] transition-colors flex items-center justify-between ${
                        selectedCategory === c.id ? 'font-semibold text-[#111111]' : ''
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-[#999999]">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-3">
              Gender Direction
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'women', 'men'].map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGender(g); setPage(1); }}
                  className={`px-3 py-1.5 text-xs uppercase border transition-all ${
                    selectedGender === g
                      ? 'bg-[#111111] text-white border-[#111111] font-medium'
                      : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="uppercase tracking-widest font-semibold text-[#111111]">Max Price</span>
              <span className="font-semibold font-mono text-[#111111]">${priceRange}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={priceRange}
              onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
              className="w-full accent-[#111111]"
            />
            <div className="flex justify-between text-[10px] text-[#777777] mt-1">
              <span>$50</span>
              <span>$500</span>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-3">
              Sizes
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => { setSelectedSize('all'); setPage(1); }}
                className={`py-1.5 text-xs text-center border transition-all ${
                  selectedSize === 'all'
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'border-[#E5E5E5] hover:border-[#111111]'
                }`}
              >
                All
              </button>
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedSize(s); setPage(1); }}
                  className={`py-1.5 text-xs text-center border transition-all ${
                    selectedSize === s
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'border-[#E5E5E5] hover:border-[#111111]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-3">
              Colour Palette
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedColor('all'); setPage(1); }}
                className={`px-2.5 py-1 text-xs border ${
                  selectedColor === 'all' ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E5E5]'
                }`}
              >
                All
              </button>
              {allColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => { setSelectedColor(c.name); setPage(1); }}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    selectedColor.toLowerCase() === c.name.toLowerCase()
                      ? 'ring-2 ring-[#111111] ring-offset-2'
                      : 'border-black/10 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <>
              <div
                className={
                  gridDensity === 'editorial'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'
                    : 'grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8'
                }
              >
                {displayedProducts.map((product, idx) => (
                  <Fragment key={product.id}>
                    <ProductCard product={product} density={gridDensity} />

                    {/* Editorial Breather 1: SS26 Philosophy quote after 3rd item */}
                    {idx === 2 && (
                      <div
                        className={`my-2 py-10 px-6 sm:px-12 bg-[#F5F4F0] border border-[#E5E5E5] flex flex-col items-center justify-center text-center ${
                          gridDensity === 'editorial' ? 'col-span-1 md:col-span-2' : 'col-span-2 md:col-span-3'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-[0.28em] text-[#777777] font-semibold mb-2">
                          SS26 Philosophy
                        </span>
                        <p className="font-serif italic text-lg sm:text-2xl text-[#111111] max-w-xl leading-relaxed">
                          &ldquo;Form follows silence &mdash; enduring garments crafted from tactile organic fibres and architectural tailoring.&rdquo;
                        </p>
                        <div className="w-8 h-[1px] bg-[#111111] mt-4 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-[#555555]">Copenhagen Atelier</span>
                      </div>
                    )}

                    {/* Editorial Breather 2: Archive series lookbook split card after 6th item */}
                    {idx === 5 && (
                      <div
                        className={`my-2 grid grid-cols-1 md:grid-cols-2 bg-[#111111] text-white overflow-hidden ${
                          gridDensity === 'editorial' ? 'col-span-1 md:col-span-2' : 'col-span-2 md:col-span-3'
                        }`}
                      >
                        <div className="relative aspect-[4/3] md:aspect-auto min-h-[220px]">
                          <Image
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80"
                            alt="Tactile tailoring"
                            fill
                            className="object-cover opacity-90"
                          />
                        </div>
                        <div className="p-6 sm:p-10 flex flex-col justify-center">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B9A58B] font-semibold mb-2">
                            The Archive Series
                          </span>
                          <h3 className="font-serif text-xl sm:text-2xl text-white font-normal mb-2">
                            Quiet Luxury & Conscious Materiality
                          </h3>
                          <p className="text-xs text-[#CCCCCC] leading-relaxed mb-5 font-light">
                            Every silhouette is cut from responsibly sourced Japanese twill, heavyweight mulberry silk, and Mongolian cashmere &mdash; designed to outlive ephemeral seasonal trends.
                          </p>
                          <Link
                            href="/about"
                            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white border-b border-white pb-0.5 self-start hover:text-[#B9A58B] hover:border-[#B9A58B] transition-colors"
                          >
                            <span>Read Sourcing Manifesto</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-12 text-center">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="border border-[#111111] text-[#111111] px-12 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    Load More Styles
                  </button>
                  <p className="text-[11px] text-[#777777] mt-2">
                    Viewing {displayedProducts.length} of {filteredProducts.length} pieces
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-[#E5E5E5] p-8">
              <p className="text-base text-[#111111] font-medium">No garments match your active filters.</p>
              <p className="text-xs text-[#777777] mt-1">
                Try clearing one or more filters to discover related pieces.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 bg-[#111111] text-white px-8 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#333333]"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-xs uppercase tracking-widest font-semibold">Filter Catalog</span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-[#777777]" />
              </button>
            </div>

            {/* Mobile Category */}
            <div>
              <p className="text-xs uppercase font-semibold mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block text-xs py-1 ${selectedCategory === 'all' ? 'font-bold' : ''}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`block text-xs py-1 ${selectedCategory === c.id ? 'font-bold' : ''}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Gender */}
            <div>
              <p className="text-xs uppercase font-semibold mb-2">Gender</p>
              <div className="flex gap-2">
                {['all', 'women', 'men'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`px-3 py-1 text-xs border ${
                      selectedGender === g ? 'bg-black text-white' : ''
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs uppercase font-semibold mb-2">Max Price (${priceRange})</p>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>

            <div className="pt-6 border-t flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 border border-black text-xs uppercase"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-black text-white text-xs uppercase"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-[#777]">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
