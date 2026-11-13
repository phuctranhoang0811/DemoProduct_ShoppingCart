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
  ShieldCheck,
  Globe,
  SlidersHorizontal,
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartBounced, setIsCartBounced] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cart = useCommerceStore((state) => state.cart);
  const wishlist = useCommerceStore((state) => state.wishlist);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const products = useCommerceStore((state) => state.products);
  const currency = useCommerceStore((state) => state.currency);
  const setIsCartDrawerOpen = useCommerceStore((state) => state.setIsCartDrawerOpen);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Trigger bounce animation when cart count changes
  useEffect(() => {
    if (totalCartItems > 0) {
      setIsCartBounced(true);
      const timer = setTimeout(() => setIsCartBounced(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalCartItems]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    setIsCartDrawerOpen(false);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname, setIsCartDrawerOpen]);

  const handleMouseEnter = (menu: 'ionizers') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  };

  const ionizerProducts = products
    .filter((p) => p.categoryId === 'cat-ionizers' || p.categoryId === 'cat-spa')
    .slice(0, 4);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-[#E5E5E5]'
            : 'bg-white/90 backdrop-blur-sm border-[#E5E5E5]/70'
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-16 lg:h-20'
          }`}
        >
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#111111] hover:text-[#555555] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Logo & Medical Tagline */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo.png"
                alt="Enagic Kangen Water Logo"
                width={120}
                height={50}
                priority
                className={`w-auto object-contain transition-all duration-300 group-hover:opacity-85 ${
                  isScrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-11 lg:h-12'
                }`}
              />
              <span className="hidden sm:inline-block text-[10px] tracking-[0.22em] text-[#333333] font-semibold border-l border-gray-300 pl-2.5 uppercase">
                KANGEN WATER®
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 text-[11px] xl:text-xs uppercase tracking-[0.12em] font-medium text-[#111111] h-full">
            <Link
              href="/"
              onMouseEnter={() => setActiveDropdown(null)}
              className={`h-full flex items-center border-b-2 transition-colors ${
                pathname === '/'
                  ? 'border-[#111111] text-[#111111] font-semibold'
                  : 'border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111]'
              }`}
            >
              {t.nav.home}
            </Link>

            {/* Products Dropdown Anchor */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('ionizers')}
            >
              <Link
                href="/shop"
                className={`h-full flex items-center gap-1 border-b-2 transition-colors ${
                  activeDropdown === 'ionizers' || pathname.startsWith('/shop')
                    ? 'border-[#111111] text-[#111111] font-semibold'
                    : 'border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111]'
                }`}
              >
                <span>{t.nav.products}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'ionizers' ? 'rotate-180' : ''
                  }`}
                />
              </Link>

              {/* Flyout Mega Dropdown */}
              {activeDropdown === 'ionizers' && (
                <div
                  className="absolute top-full left-0 w-[580px] bg-white border border-[#E5E5E5] shadow-2xl p-6 z-50 rounded-b-md animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => handleMouseEnter('ionizers')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0F0F0]">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#777777]">
                      {language === 'vi' ? 'Thiết Bị Điện Giải Chuẩn Y Tế' : 'Flagship Medical Ionizers'}
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11px] font-semibold text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <span>{t.showcase.viewAll}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {ionizerProducts.map((p) => {
                      const pName = language === 'vi' ? p.nameVi || p.name : p.nameEn || p.name;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="flex gap-3 p-2.5 rounded-sm hover:bg-[#F9F9F8] transition-colors border border-transparent hover:border-[#EEEEEE] group"
                        >
                          <div className="relative w-14 h-16 bg-[#F5F4F0] flex-shrink-0 rounded-xs overflow-hidden">
                            <Image
                              src={p.images[0]}
                              alt={pName}
                              fill
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              sizes="60px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#111111] group-hover:underline truncate">
                              {pName}
                            </p>
                            <p className="text-[10px] text-[#777777] font-mono mt-0.5">{p.sku}</p>
                            <p className="text-xs font-bold text-[#111111] mt-1">
                              {formatPrice(p.price, currency)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-[#666666]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#477A5A]" />
                      <span>{language === 'vi' ? 'Bảo hành chính hãng Enagic 3-5 năm' : 'Official Enagic 3-5 Year Warranty'}</span>
                    </span>
                    <Link
                      href="/shop?category=cat-filters"
                      onClick={() => setActiveDropdown(null)}
                      className="font-medium hover:text-[#111111] underline"
                    >
                      {t.nav.accessories} &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/shop?category=cat-spa"
              onMouseEnter={() => setActiveDropdown(null)}
              className={`h-full flex items-center border-b-2 transition-colors ${
                pathname === '/shop' && typeof window !== 'undefined' && window.location.search.includes('cat-spa')
                  ? 'border-[#111111] text-[#111111] font-semibold'
                  : 'border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111]'
              }`}
            >
              Anespa Spa
            </Link>

            <Link
              href="/shop?category=cat-filters"
              onMouseEnter={() => setActiveDropdown(null)}
              className="h-full flex items-center border-b-2 border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111] transition-colors"
            >
              {t.nav.accessories}
            </Link>

            <Link
              href="/calculator"
              onMouseEnter={() => setActiveDropdown(null)}
              className={`h-full flex items-center border-b-2 transition-colors ${
                pathname === '/calculator'
                  ? 'border-[#111111] text-[#111111] font-semibold'
                  : 'border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111]'
              }`}
            >
              {language === 'vi' ? 'Tính Thuế' : 'Tax Calculator'}
            </Link>

            <Link
              href="/hellobee"
              onMouseEnter={() => setActiveDropdown(null)}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-colors ${
                pathname === '/hellobee'
                  ? 'border-[#111111] text-[#111111] font-semibold'
                  : 'border-transparent text-[#222222] hover:text-[#111111] hover:border-[#111111]'
              }`}
            >
              <span>Hellobee Network</span>
              <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[9px] uppercase tracking-wider font-bold rounded-xs">
                1A–5A
              </span>
            </Link>
          </nav>

          {/* Right Action Icons: Language, Search, Wishlist, User, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-[#111111]">
            {/* Language Switcher Toggle */}
            <div className="flex items-center border border-[#E5E5E5] rounded-full p-0.5 bg-[#F5F4F0] text-[10px] font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'vi'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
                title="Tiếng Việt"
                aria-label="Tiếng Việt"
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
                title="English"
                aria-label="English"
              >
                EN
              </button>
            </div>

            {/* Currency Badge */}
            <div className="hidden xl:flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border border-[#E5E5E5] bg-[#F5F4F0] text-[#333333]">
              <span>$ USD</span>
            </div>

            {/* Instant Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#222222] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors flex items-center gap-1.5"
              aria-label="Search"
              title="Search (Cmd+K / Ctrl+K)"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden xl:inline text-xs text-[#777777] font-normal">
                {language === 'vi' ? 'Tìm...' : 'Search'}
              </span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-[#222222] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors relative"
              aria-label="Wishlist"
              title={language === 'vi' ? 'Danh sách yêu thích' : 'Wishlist'}
            >
              <Heart className="w-4 h-4 stroke-[1.75]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Account Link */}
            <Link
              href={currentUser ? '/account' : '/login'}
              className="p-2 text-[#222222] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors relative"
              aria-label="User Account"
              title={
                currentUser
                  ? `${language === 'vi' ? 'Tài khoản' : 'Account'}: ${currentUser.name}`
                  : language === 'vi'
                  ? 'Đăng nhập'
                  : 'Sign In'
              }
            >
              <User className="w-4 h-4 stroke-[1.75]" />
              {currentUser && (
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#477A5A] rounded-full ring-1 ring-white" />
              )}
            </Link>

            {/* Shopping Bag Trigger with spring animation */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className={`p-2 text-[#222222] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-all relative ${
                isCartBounced ? 'animate-cart-bounce text-blue-900 scale-110' : ''
              }`}
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              {totalCartItems > 0 && (
                <span
                  className={`absolute top-0 right-0 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-transform ${
                    isCartBounced ? 'animate-badge-pop bg-blue-900 scale-125' : ''
                  }`}
                >
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Portal Shortcuts depending on Role */}
            {currentUser?.role === 'employee' ? (
              <Link
                href="/employee"
                className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#EBF3EA] text-[#2D5A27] px-2.5 py-1 font-bold rounded-xs hover:bg-[#d8e8d6] transition-colors"
                title="Employee Workspace"
              >
                <span>Staff Portal</span>
              </Link>
            ) : currentUser?.role === 'admin' ? (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#111111] text-white px-2.5 py-1 font-bold rounded-xs hover:bg-[#333333] transition-colors"
                title="Admin Portal"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#B9A58B]" />
                <span>Admin</span>
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-2 border-l border-[#E5E5E5] pl-2.5">
                <Link
                  href="/employee"
                  className="text-[10px] uppercase tracking-wider text-[#777777] hover:text-[#111111] font-semibold transition-colors"
                  title="Employee Portal"
                >
                  Staff
                </Link>
                <span className="text-[#CCCCCC]">/</span>
                <Link
                  href="/admin"
                  className="text-[10px] uppercase tracking-wider text-[#777777] hover:text-[#111111] font-semibold transition-colors"
                  title="Admin Portal"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={90}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#333333] font-semibold border-l border-gray-300 pl-2">
                    KANGEN WATER®
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#111111] hover:bg-[#F5F4F0] rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-[#F5F4F0] border border-[#E5E5E5] text-xs text-[#777777] hover:bg-[#EEEEEE] transition-colors"
              >
                <Search className="w-4 h-4 text-[#777777]" />
                <span>{language === 'vi' ? 'Tìm kiếm máy, phụ kiện...' : 'Search products, parts...'}</span>
              </button>

              {/* Navigation Links */}
              <div className="py-5 space-y-3.5 text-xs uppercase tracking-wider font-semibold text-[#111111]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#666666] transition-colors"
                >
                  {t.nav.home}
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#666666] transition-colors"
                >
                  {t.nav.products} ({language === 'vi' ? 'Máy Điện Giải' : 'Ionizers'})
                </Link>
                <Link
                  href="/shop?category=cat-spa"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#666666] transition-colors"
                >
                  Anespa DX Mineral Spa
                </Link>
                <Link
                  href="/shop?category=cat-filters"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#666666] transition-colors"
                >
                  {t.nav.accessories}
                </Link>
                <Link
                  href="/calculator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 font-semibold text-[#111111] hover:text-[#666666] transition-colors"
                >
                  {language === 'vi' ? 'Công Cụ Tính Thuế' : 'Tax Calculator (US & VN)'}
                </Link>
                <Link
                  href="/hellobee"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 font-semibold text-[#111111] hover:text-[#666666] transition-colors"
                >
                  <span>Hellobee Network</span>
                  <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[9px] uppercase tracking-wider font-bold rounded-xs">
                    1A–5A
                  </span>
                </Link>
              </div>

              {/* Account & Quick Actions */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                <Link
                  href={currentUser ? '/account' : '/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-xs font-semibold text-[#111111]"
                >
                  <User className="w-4 h-4" />
                  <span>
                    {currentUser
                      ? `${language === 'vi' ? 'Tài khoản' : 'Account'} (${currentUser.name})`
                      : language === 'vi'
                      ? 'Đăng nhập / Đăng ký'
                      : 'Sign In / Register'}
                  </span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-semibold text-[#111111]"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Sản phẩm yêu thích' : 'Wishlist'}</span>
                  </span>
                  {wishlist.length > 0 && (
                    <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-bold rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCartDrawerOpen(true);
                  }}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#111111]"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.cart.title}</span>
                  </span>
                  {totalCartItems > 0 && (
                    <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-bold rounded-full">
                      {totalCartItems}
                    </span>
                  )}
                </button>

                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-xs font-medium text-[#777777] hover:text-[#111111]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer with Working Language Toggle */}
            <div className="pt-5 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
              <span className="text-[#666666] font-medium">Currency: USD ($)</span>
              <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-full p-0.5 bg-[#F5F4F0]">
                <button
                  type="button"
                  onClick={() => setLanguage('vi')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    language === 'vi' ? 'bg-[#111111] text-white' : 'text-[#666666]'
                  }`}
                >
                  VI
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    language === 'en' ? 'bg-[#111111] text-white' : 'text-[#666666]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
