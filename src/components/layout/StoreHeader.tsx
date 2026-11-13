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
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { SearchModal } from '@/components/common/SearchModal';
import { formatPrice } from '@/lib/utils';

export function StoreHeader() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'ionizers' | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cart = useCommerceStore((state) => state.cart);
  const wishlist = useCommerceStore((state) => state.wishlist);
  const currentUser = useCommerceStore((state) => state.currentUser);
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

  const handleMouseEnter = (menu: 'ionizers') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const ionizerProducts = products.filter((p) => p.categoryId === 'cat-ionizers' || p.categoryId === 'cat-spa').slice(0, 4);

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md"
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#111111]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Logo & Kangen Water */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={120}
                height={50}
                priority
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#333333] font-semibold border-l border-gray-300 pl-2.5">
                KANGEN WATER®
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.14em] font-medium text-[#111111] h-full">
            <Link
              href="/"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              {t.nav.home}
            </Link>

            {/* Máy Điện Giải with Hover Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('ionizers')}
            >
              <Link
                href="/shop"
                className={`py-7 border-b-2 transition-all flex items-center gap-1 ${
                  activeDropdown === 'ionizers'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent hover:border-[#111111]'
                }`}
              >
                <span>{t.nav.products}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'ionizers' ? 'rotate-180' : ''
                  }`}
                />
              </Link>

              {/* Minimal Dropdown Menu */}
              {activeDropdown === 'ionizers' && (
                <div
                  className="absolute top-full left-0 w-[560px] bg-white border border-[#E5E5E5] shadow-xl p-6 z-50 animate-in fade-in slide-in-from-top-1 rounded-sm"
                  onMouseEnter={() => handleMouseEnter('ionizers')}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {ionizerProducts.map((p) => {
                      const pName = language === 'vi' ? p.nameVi || p.name : p.nameEn || p.name;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="flex gap-3 p-2 hover:bg-[#F9F9F9] rounded-sm transition-colors group"
                        >
                          <div className="relative w-14 h-16 bg-[#F5F4F0] flex-shrink-0 rounded-xs overflow-hidden">
                            <Image src={p.images[0]} alt={pName} fill className="object-cover" sizes="60px" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#111111] group-hover:underline line-clamp-1">
                              {pName}
                            </p>
                            <p className="text-[11px] text-[#777777] font-mono mt-0.5">{p.sku}</p>
                            <p className="text-xs font-medium text-[#111111] mt-1">{formatPrice(p.price, currency)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex justify-between text-xs">
                    <Link
                      href="/shop"
                      onClick={() => setActiveDropdown(null)}
                      className="font-semibold text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <span>{t.showcase.viewAll}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/shop?category=cat-spa"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Anespa Spa
            </Link>

            <Link
              href="/shop?category=cat-filters"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              {t.nav.accessories}
            </Link>

            <Link
              href="/shop"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all"
            >
              Collection
            </Link>

            <Link
              href="/calculator"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all font-medium text-[#111111]"
            >
              Tax Calculator
            </Link>

            <Link
              href="/hellobee"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#111111] transition-all font-medium text-[#111111] flex items-center gap-1.5"
            >
              <span>Hellobee Network</span>
              <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                1A–5A
              </span>
            </Link>
          </nav>

          {/* Right Action Icons: Language, Currency, Search, Wishlist, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#111111]">
            {/* Currency Badge - Locked to USD per instructions */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border border-[#E5E5E5] bg-[#F5F4F0] text-[#111111]">
              <span>$ USD</span>
            </div>

            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1 hover:text-[#666666] transition-colors flex items-center gap-1.5"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
              <span className="hidden md:inline text-xs text-[#777777] font-normal">Search</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1 hover:text-[#666666] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1 hover:text-[#666666] transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Admin Portal shortcut */}
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#777777] hover:text-[#111111] font-semibold border-l border-[#E5E5E5] pl-3"
              title="Admin Portal"
            >
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={90}
                    height={40}
                    className="h-9 w-auto object-contain"
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#333333] font-semibold border-l border-gray-300 pl-2">
                    KANGEN WATER®
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5 text-[#111111]" />
                </button>
              </div>

              <div className="py-6 space-y-4 text-sm uppercase tracking-wider font-semibold text-[#111111]">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#666666]">
                  {t.nav.home}
                </Link>
                <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#666666]">
                  {t.nav.products}
                </Link>
                <Link href="/shop?category=cat-spa" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#666666]">
                  Anespa Mineral Spa
                </Link>
                <Link href="/shop?category=cat-filters" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#666666]">
                  {t.nav.accessories}
                </Link>
                <Link href="/calculator" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 font-semibold text-[#111111]">
                  Tax Calculator
                </Link>
                <Link href="/hellobee" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1 font-semibold text-[#111111]">
                  <span>Hellobee Network</span>
                  <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs">1A–5A</span>
                </Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-[#111111] hover:text-[#666666]">
                  Admin Portal
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
              <span className="text-[#666666] font-medium">Currency: USD ($)</span>
              <span className="px-2.5 py-1 rounded bg-[#111111] text-white font-bold">EN</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
