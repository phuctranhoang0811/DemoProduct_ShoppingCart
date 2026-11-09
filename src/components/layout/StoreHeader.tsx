'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Shield,
  ChevronDown,
  ArrowRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { SearchModal } from '@/components/common/SearchModal';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export function StoreHeader() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'women' | 'men' | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<'women' | 'men' | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cart = useCommerceStore((state) => state.cart);
  const wishlist = useCommerceStore((state) => state.wishlist);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const currency = useCommerceStore((state) => state.currency);
  const setCurrency = useCommerceStore((state) => state.setCurrency);
  const setIsCartDrawerOpen = useCommerceStore((state) => state.setIsCartDrawerOpen);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Global Cmd+K / Ctrl+K listener for instant search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close cart drawer on route change
  useEffect(() => {
    setIsCartDrawerOpen(false);
  }, [pathname, setIsCartDrawerOpen]);

  const handleMouseEnter = (menu: 'women' | 'men') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all"
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#111111]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* COS Brand Identity */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-[0.28em] text-[#111111] uppercase select-none hover:opacity-80 transition-opacity"
            >
              COS
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[13px] uppercase tracking-[0.14em] font-medium text-[#111111] h-full">
            <Link
              href="/shop?filter=new"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              New Arrivals
            </Link>

            {/* Women with Hover Mega Menu */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('women')}
            >
              <Link
                href="/shop?gender=women"
                className={`py-7 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeDropdown === 'women'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent hover:border-[#111111]'
                }`}
              >
                <span>Women</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'women' ? 'rotate-180' : ''
                  }`}
                />
              </Link>
            </div>

            {/* Men with Hover Mega Menu */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('men')}
            >
              <Link
                href="/shop?gender=men"
                className={`py-7 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeDropdown === 'men'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent hover:border-[#111111]'
                }`}
              >
                <span>Men</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'men' ? 'rotate-180' : ''
                  }`}
                />
              </Link>
            </div>

            <Link
              href="/shop?category=cat-shirts"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Shirts
            </Link>

            <Link
              href="/shop?category=cat-trousers"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Trousers
            </Link>

            <Link
              href="/shop?category=cat-outerwear"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Outerwear
            </Link>

            <Link
              href="/shop?category=cat-accessories"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Accessories
            </Link>

            <Link
              href="/shop?filter=sale"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent text-[#B74747] font-semibold hover:border-[#B74747] transition-all"
            >
              Sale
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#111111]">
            {/* Currency Switcher */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border border-[#E5E5E5] bg-[#FAF9F5] hover:border-[#111111] transition-all shadow-2xs"
              title={`Switch currency to ${currency === 'USD' ? 'VND (₫)' : 'USD ($)'}`}
              aria-label="Toggle currency"
            >
              <span className="text-[11px] font-mono text-[#777777]">{currency === 'USD' ? '$' : '₫'}</span>
              <span className="text-[11px]">{currency}</span>
            </button>

            {/* Desktop Instant Search Trigger with Shortcut */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E5E5] bg-[#F5F4F0] hover:border-[#111111] transition-all text-xs text-[#666666]"
              aria-label="Open search dialog"
            >
              <Search className="w-3.5 h-3.5 text-[#111111]" />
              <span className="text-[12px]">Search garments...</span>
              <kbd className="text-[10px] bg-white border border-[#D0D0D0] rounded px-1.5 py-0.2 font-mono text-[#444444] shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 hover:opacity-60 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.4]" />
            </button>

            {/* Account */}
            <Link
              href={currentUser ? '/account' : '/login'}
              className="p-1 hover:opacity-60 transition-opacity hidden sm:inline-block relative group"
              aria-label="Account"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In'}
            >
              <User className="w-5 h-5 stroke-[1.4]" />
              {currentUser && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#477A5A] rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1 hover:opacity-60 transition-opacity relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.4]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger -> Opens Full Slide-Over Cart Drawer */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1 hover:opacity-60 transition-opacity relative flex items-center"
              aria-label="Open shopping bag drawer"
              title="Open shopping bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.4]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Admin Switcher */}
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold bg-[#F5F4F0] hover:bg-[#E5E5E5] transition-colors border border-[#E5E5E5]"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

        {/* Dropdown Mega Menu for Women & Men with Safe Hover Bridge */}
        {activeDropdown && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-white/95 backdrop-blur-2xl border-b border-[#E5E5E5] shadow-2xl animate-in fade-in duration-150 before:absolute before:-top-3 before:h-3 before:w-full before:content-['']"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-12 gap-10">
              {/* Column 1: Featured & Highlights */}
              <div className="col-span-3 space-y-4 border-r border-[#E5E5E5] pr-6">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#888888]">
                  {activeDropdown === 'women' ? "Women's Collection" : "Men's Collection"}
                </span>
                <ul className="space-y-3 text-xs uppercase tracking-wider pt-1">
                  <li>
                    <Link
                      href={`/shop?gender=${activeDropdown}`}
                      onClick={() => setActiveDropdown(null)}
                      className="font-bold text-[#111111] hover:text-[#B9A58B] transition-colors flex items-center justify-between"
                    >
                      <span>Explore Entire {activeDropdown === 'women' ? 'Women' : 'Men'} Range</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/shop?gender=${activeDropdown}&filter=new`}
                      onClick={() => setActiveDropdown(null)}
                      className="text-[#555555] hover:text-[#111111] transition-colors flex items-center justify-between"
                    >
                      <span>New In This Week</span>
                      <span className="text-[10px] text-[#477A5A] font-semibold bg-[#EAF3ED] px-1.5 py-0.5">Fresh</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/shop?gender=${activeDropdown}&filter=sale`}
                      onClick={() => setActiveDropdown(null)}
                      className="text-[#B74747] font-semibold hover:underline"
                    >
                      Seasonal Archive & Sale
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Categories Grid with Item Counts */}
              <div className="col-span-5 space-y-4 border-r border-[#E5E5E5] pr-6">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#888888]">
                  Browse Categories
                </span>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-1 text-xs">
                  {categories
                    .filter((c) => {
                      if (activeDropdown === 'men' && c.slug === 'dresses') return false;
                      return true;
                    })
                    .map((cat) => {
                      const count = products.filter(
                        (p) =>
                          p.categoryId === cat.id &&
                          (p.gender === activeDropdown || p.gender === 'unisex')
                      ).length;
                      return (
                        <Link
                          key={cat.id}
                          href={`/shop?gender=${activeDropdown}&category=${cat.id}`}
                          onClick={() => setActiveDropdown(null)}
                          className="text-[#333333] hover:text-[#111111] hover:translate-x-1 transition-all flex items-center justify-between group py-1"
                        >
                          <span className="group-hover:font-medium">{cat.name}</span>
                          <span className="text-[11px] text-[#999999] font-mono">({count})</span>
                        </Link>
                      );
                    })}
                </div>
              </div>

              {/* Column 3: Curated Capsule Card */}
              <div className="col-span-4 pl-4 flex items-center">
                <Link
                  href={`/shop?gender=${activeDropdown}&filter=new`}
                  onClick={() => setActiveDropdown(null)}
                  className="group relative w-full aspect-[16/10] overflow-hidden bg-[#F5F4F0] block border border-[#E5E5E5]"
                >
                  <Image
                    src={
                      activeDropdown === 'women'
                        ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop'
                        : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
                    }
                    alt={activeDropdown === 'women' ? 'Women Editorial' : 'Men Editorial'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="380px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#D2C8BC] font-semibold">
                      Capsule Story
                    </span>
                    <p className="text-base font-light tracking-tight mt-0.5">
                      {activeDropdown === 'women'
                        ? 'Fluid Silhouettes & Sculptural Silk'
                        : 'Architectural Tailoring & Wool Twill'}
                    </p>
                    <span className="text-[11px] underline mt-1 text-[#E5E5E5] group-hover:text-white">
                      Discover Collection &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E5E5] bg-white px-6 py-6 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-medium">
              <Link
                href="/shop?filter=new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#111111]"
              >
                New Arrivals
              </Link>

              {/* Mobile Women Accordion */}
              <div className="border-b border-[#F5F4F0] py-2.5">
                <div className="flex items-center justify-between">
                  <Link
                    href="/shop?gender=women"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#111111] font-semibold"
                  >
                    Women
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === 'women' ? null : 'women')}
                    className="p-1 text-[#777777]"
                    aria-label="Toggle Women categories"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileExpanded === 'women' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                {mobileExpanded === 'women' && (
                  <div className="pl-3 pt-3 space-y-2 text-[11px] text-[#666666]">
                    <Link
                      href="/shop?gender=women"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1 font-semibold text-[#111111]"
                    >
                      &rarr; All Women&apos;s Garments
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?gender=women&category=${cat.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 hover:text-[#111111]"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Men Accordion */}
              <div className="border-b border-[#F5F4F0] py-2.5">
                <div className="flex items-center justify-between">
                  <Link
                    href="/shop?gender=men"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#111111] font-semibold"
                  >
                    Men
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === 'men' ? null : 'men')}
                    className="p-1 text-[#777777]"
                    aria-label="Toggle Men categories"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileExpanded === 'men' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                {mobileExpanded === 'men' && (
                  <div className="pl-3 pt-3 space-y-2 text-[11px] text-[#666666]">
                    <Link
                      href="/shop?gender=men"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1 font-semibold text-[#111111]"
                    >
                      &rarr; All Men&apos;s Garments
                    </Link>
                    {categories
                      .filter((c) => c.slug !== 'dresses')
                      .map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?gender=men&category=${cat.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-1 hover:text-[#111111]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              <Link
                href="/shop?category=cat-shirts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#111111]"
              >
                Shirts
              </Link>

              <Link
                href="/shop?category=cat-trousers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#111111]"
              >
                Trousers
              </Link>

              <Link
                href="/shop?category=cat-outerwear"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#111111]"
              >
                Outerwear
              </Link>

              <Link
                href="/shop?category=cat-accessories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#111111]"
              >
                Accessories
              </Link>

              <Link
                href="/shop?filter=sale"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] text-[#B74747] font-semibold"
              >
                Sale
              </Link>

              <div className="pt-4 flex flex-col space-y-3">
                <Link
                  href={currentUser ? '/account' : '/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-xs uppercase tracking-wider text-[#777777]"
                >
                  <User className="w-4 h-4" />
                  {currentUser ? `Account (${currentUser.name})` : 'Sign In / Register'}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-xs uppercase tracking-wider font-semibold text-[#111111]"
                >
                  <Shield className="w-4 h-4" />
                  Switch to Admin Portal
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
