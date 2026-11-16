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
  Briefcase,
  LogOut,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { useTranslation } from '@/i18n/useTranslation';
import { SearchModal } from '@/components/common/SearchModal';
import { formatPrice } from '@/lib/utils';

export function StoreHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();
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
  const setCurrency = useCommerceStore((state) => state.setCurrency);
  const logout = useCommerceStore((state) => state.logout);
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

  const isHome = pathname === '/';
  const isDarkHeader = isHome;
  const isTransparent = isHome && !isScrolled;

  // Honey on dark headers; deep honey (AA contrast on white) on light headers
  const navLinkClass = (active: boolean) =>
    `group/nav relative whitespace-nowrap shrink-0 h-full flex items-center gap-1.5 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--honey-strong)] rounded-sm ${
      isDarkHeader
        ? active
          ? 'text-[var(--honey)] font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
          : 'text-white/75 hover:text-[var(--honey)] focus-visible:text-[var(--honey)]'
        : active
        ? 'text-[var(--honey-deep)] font-bold'
        : 'text-[#444444] hover:text-[var(--honey-deep)] focus-visible:text-[var(--honey-deep)]'
    }`;

  const navUnderline = (active: boolean) => (
    <span
      aria-hidden
      className={`absolute bottom-3.5 left-0 right-0 h-[2px] rounded-full origin-left transition-transform duration-300 ${
        isDarkHeader
          ? 'bg-[var(--honey)] shadow-[0_0_8px_rgba(246,201,76,0.8)]'
          : 'bg-[var(--honey-strong)]'
      } ${active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100 group-focus-visible/nav:scale-x-100'}`}
    />
  );

  return (
    <>
      <header
        className={`z-40 transition-all duration-300 ${
          isHome
            ? isTransparent
              ? 'fixed top-0 inset-x-0 bg-transparent border-b border-transparent text-white'
              : 'fixed top-0 inset-x-0 bg-[#0A0A0A]/95 backdrop-blur-md shadow-2xl border-b border-white/10 text-white'
            : `sticky top-0 border-b ${
                isScrolled
                  ? 'bg-white/95 backdrop-blur-md shadow-sm border-[#E5E5E5]'
                  : 'bg-white/90 backdrop-blur-sm border-[#E5E5E5]/70'
              }`
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-16 lg:h-20'
          }`}
        >
          {/* Brand Logo & Medical Tagline */}
          <div className="flex items-center justify-start shrink-0">
            {/* Mobile hamburger button */}
            <div className="flex items-center lg:hidden mr-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2.5 -ml-2.5 transition-colors ${
                  isDarkHeader ? 'text-white hover:text-white/80' : 'text-[#111111] hover:text-[#555555]'
                }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
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
              <span className={`hidden sm:block text-sm xl:text-base tracking-[0.22em] font-bold uppercase whitespace-nowrap transition-colors ${
                isDarkHeader ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' : 'text-[#111111]'
              }`}>
                HelloBee
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Mathematically Centered Zone */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-[11px] xl:text-xs uppercase tracking-[0.1em] xl:tracking-[0.14em] font-semibold h-full px-2">
            <Link
              href="/"
              onMouseEnter={() => setActiveDropdown(null)}
              className={navLinkClass(pathname === '/')}
            >
              <span>{t.nav.home}</span>
              {navUnderline(pathname === '/')}
            </Link>

            {/* Products Dropdown Anchor */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter('ionizers')}
            >
              <Link
                href="/shop"
                className={navLinkClass(
                  activeDropdown === 'ionizers' || pathname.startsWith('/shop') || pathname.startsWith('/product')
                )}
              >
                <span>{t.nav.products}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'ionizers' ? 'rotate-180' : ''
                  }`}
                />
                {navUnderline(
                  activeDropdown === 'ionizers' || pathname.startsWith('/shop') || pathname.startsWith('/product')
                )}
              </Link>

              {/* Flyout Mega Dropdown */}
              {activeDropdown === 'ionizers' && (
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 w-[580px] border shadow-2xl p-6 z-50 rounded-b-md animate-scale-in duration-200 ${
                    isDarkHeader
                      ? 'bg-[#141414] border-[#2A2A2A] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#111111]'
                  }`}
                  onMouseEnter={() => handleMouseEnter('ionizers')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
                    isDarkHeader ? 'border-[#262626]' : 'border-[#F0F0F0]'
                  }`}>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                      isDarkHeader ? 'text-[#888888]' : 'text-[#777777]'
                    }`}>
                      Featured Medical Ionizers
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setActiveDropdown(null)}
                      className={`text-[11px] font-semibold hover:underline flex items-center gap-1 ${
                        isDarkHeader ? 'text-white' : 'text-[#111111]'
                      }`}
                    >
                      <span>{t.showcase.viewAll}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {ionizerProducts.map((p) => {
                      const pName = p.nameEn || p.name;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex gap-3 p-2.5 rounded-sm transition-colors border group ${
                            isDarkHeader
                              ? 'border-transparent hover:border-[#E0A82E]/50 hover:bg-[#1C1C1C]'
                              : 'border-transparent hover:border-[#E0A82E]/60 hover:bg-[var(--honey-tint)]'
                          }`}
                        >
                          <div className={`relative w-14 h-16 flex-shrink-0 rounded-xs overflow-hidden ${
                            isDarkHeader ? 'bg-[#1C1C1C]' : 'bg-[#F5F4F0]'
                          }`}>
                            <Image
                              src={p.images[0]}
                              alt={pName}
                              fill
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              sizes="60px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold group-hover:underline truncate ${
                              isDarkHeader ? 'text-white' : 'text-[#111111]'
                            }`}>
                              {pName}
                            </p>
                            <p className={`text-[10px] font-mono mt-0.5 ${
                              isDarkHeader ? 'text-[#888888]' : 'text-[#777777]'
                            }`}>{p.sku}</p>
                            <p className={`text-xs font-bold mt-1 ${
                              isDarkHeader ? 'text-[var(--honey)]' : 'text-[#111111]'
                            }`}>
                              {formatPrice(p.price, currency)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${
                    isDarkHeader ? 'border-[#262626] text-[#AAAAAA]' : 'border-[#F0F0F0] text-[#666666]'
                  }`}>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#477A5A]" />
                      <span>Official Enagic 3-5 Year Warranty</span>
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setActiveDropdown(null)}
                      className={`font-medium underline ${
                        isDarkHeader ? 'text-white hover:text-[var(--honey)]' : 'text-[#111111]'
                      }`}
                    >
                      Browse Full Catalog &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/calculator"
              onMouseEnter={() => setActiveDropdown(null)}
              className={navLinkClass(pathname === '/calculator')}
            >
              <span>Tax Calculator</span>
              {navUnderline(pathname === '/calculator')}
            </Link>

            <Link
              href="/hellobee"
              onMouseEnter={() => setActiveDropdown(null)}
              className={navLinkClass(pathname === '/hellobee')}
            >
              <span>Hellobee Network</span>
              {navUnderline(pathname === '/hellobee')}
            </Link>
          </nav>

          {/* Right Action Icons: Currency, Search, Wishlist, User, Cart, Portals */}
          <div className={`flex items-center justify-end shrink-0 gap-2 sm:gap-3 transition-colors ${
            isDarkHeader ? 'text-white' : 'text-[#111111]'
          }`}>
            {/* Interactive Currency Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
                className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors shrink-0 btn-tactile ${
                  isDarkHeader
                    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm'
                    : 'border-[#E5E5E5] bg-[#F5F4F0] text-[#333333] hover:border-gray-300 hover:bg-[#EAE8E3]'
                }`}
                title="Click to toggle currency ($ USD / ₫ VND)"
                aria-label="Toggle currency"
              >
                <span>{currency === 'USD' ? '$ USD' : '₫ VND'}</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className={`hidden sm:block h-4 w-px transition-colors ${
              isDarkHeader ? 'bg-white/20' : 'bg-[#E5E5E5]'
            }`} />

            {/* Core Action Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              {/* Instant Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`p-2.5 sm:p-2 rounded-full transition-all duration-150 flex items-center justify-center shrink-0 btn-tactile hover:scale-105 ${
                  isDarkHeader
                    ? 'text-white hover:text-[var(--honey)] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[var(--honey-deep)] hover:bg-[var(--honey-tint)]'
                }`}
                aria-label="Search"
                title="Search (Cmd+K / Ctrl+K)"
              >
                <Search className="w-4 h-4 stroke-[1.8]" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={`p-2.5 sm:p-2 rounded-full transition-all duration-150 relative flex items-center justify-center shrink-0 btn-tactile hover:scale-105 ${
                  isDarkHeader
                    ? 'text-white hover:text-[var(--honey)] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[var(--honey-deep)] hover:bg-[var(--honey-tint)]'
                }`}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="w-4 h-4 stroke-[1.8]" />
                {wishlist.length > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold animate-badge-pop ${
                    isDarkHeader ? 'bg-white text-[#111111]' : 'bg-[#111111] text-white'
                  }`}>
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Account with Dropdown */}
              <div className="relative group/user shrink-0">
                <Link
                  href={currentUser ? '/account' : '/login'}
                  className={`p-2.5 sm:p-2 rounded-full transition-all duration-150 relative flex items-center justify-center btn-tactile hover:scale-105 ${
                    isDarkHeader
                      ? 'text-white hover:text-[var(--honey)] hover:bg-white/10'
                      : 'text-[#222222] hover:text-[var(--honey-deep)] hover:bg-[var(--honey-tint)]'
                  }`}
                  aria-label="User Account"
                  title={
                    currentUser
                      ? `Account: ${currentUser.name}`
                      : 'Sign In'
                  }
                >
                  <User className="w-4 h-4 stroke-[1.8]" />
                  {currentUser && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#477A5A] rounded-full ring-1 ring-white" />
                  )}
                </Link>

                {/* Account Dropdown Menu */}
                <div className="absolute right-0 top-full pt-1.5 hidden group-hover/user:block z-50 animate-scale-in duration-200">
                  <div className={`w-56 border shadow-xl rounded-md py-2 text-xs ${
                    isDarkHeader
                      ? 'bg-[#141414] border-[#2A2A2A] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#111111]'
                  }`}>
                    {currentUser ? (
                      <>
                        <div className={`px-3.5 py-2 border-b ${
                          isDarkHeader ? 'border-[#262626]' : 'border-[#F0F0F0]'
                        }`}>
                          <p className={`font-semibold truncate ${isDarkHeader ? 'text-white' : 'text-[#111111]'}`}>{currentUser.name}</p>
                          <p className={`text-[10px] truncate ${isDarkHeader ? 'text-[#888888]' : 'text-[#777777]'}`}>{currentUser.email}</p>
                          <span className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase font-bold rounded ${
                            isDarkHeader ? 'bg-[#222222] text-[#AAAAAA]' : 'bg-[#F5F4F0] text-[#555555]'
                          }`}>
                            {currentUser.role}
                          </span>
                        </div>
                        <Link
                          href="/account"
                          className={`flex items-center px-3.5 py-2 transition-colors ${
                            isDarkHeader ? 'text-[#CCCCCC] hover:bg-[#222222]' : 'text-[#333333] hover:bg-[#F9F9F8]'
                          }`}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          className={`flex items-center px-3.5 py-2 transition-colors ${
                            isDarkHeader ? 'text-[#CCCCCC] hover:bg-[#222222]' : 'text-[#333333] hover:bg-[#F9F9F8]'
                          }`}
                        >
                          Order History
                        </Link>
                        {currentUser.role === 'employee' && (
                          <Link
                            href="/employee"
                            className="flex items-center gap-1.5 px-3.5 py-2 text-[#2D5A27] bg-[#EBF3EA]/60 hover:bg-[#EBF3EA] font-semibold transition-colors"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Staff Workspace</span>
                          </Link>
                        )}
                        {currentUser.role === 'admin' && (
                          <Link
                            href="/admin"
                            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold transition-colors ${
                              isDarkHeader ? 'bg-[#222222] text-white hover:bg-[#2A2A2A]' : 'bg-[#F5F4F0] text-[#111111] hover:bg-[#EEEEEE]'
                            }`}
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        <div className={`border-t mt-1 pt-1 ${
                          isDarkHeader ? 'border-[#262626]' : 'border-[#F0F0F0]'
                        }`}>
                          <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full flex items-center gap-1.5 px-3.5 py-2 text-left text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`px-3.5 py-2 border-b ${
                          isDarkHeader ? 'border-[#262626]' : 'border-[#F0F0F0]'
                        }`}>
                          <p className={`text-[11px] font-semibold ${isDarkHeader ? 'text-white' : 'text-[#111111]'}`}>
                            Enagic® Account
                          </p>
                        </div>
                        <Link
                          href="/login"
                          className={`flex items-center px-3.5 py-2 font-semibold transition-colors ${
                            isDarkHeader ? 'text-white hover:bg-[#222222]' : 'text-[#111111] hover:bg-[#F9F9F8]'
                          }`}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          className={`flex items-center px-3.5 py-2 transition-colors ${
                            isDarkHeader ? 'text-[#AAAAAA] hover:bg-[#222222]' : 'text-[#555555] hover:bg-[#F9F9F8]'
                          }`}
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Shopping Bag Trigger with spring animation */}
              <button
                type="button"
                onClick={() => {
                  setIsCartBounced(true);
                  setTimeout(() => setIsCartBounced(false), 500);
                  setIsCartDrawerOpen(true);
                }}
                className={`p-2.5 sm:p-2 rounded-full transition-all duration-150 relative flex items-center justify-center shrink-0 btn-tactile hover:scale-105 active:scale-95 ${
                  isDarkHeader
                    ? 'text-white hover:text-[var(--honey)] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[var(--honey-deep)] hover:bg-[var(--honey-tint)]'
                } ${
                  isCartBounced ? 'animate-cart-bounce text-[var(--honey)] scale-110' : ''
                }`}
                aria-label="Shopping Bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                {totalCartItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold transition-transform ${
                      isDarkHeader ? 'bg-white text-[#111111]' : 'bg-[#111111] text-white'
                    } ${
                      isCartBounced ? 'animate-badge-pop scale-125' : ''
                    }`}
                  >
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>

            {!currentUser && (
              <Link
                href="/login"
                className={`hidden sm:inline-flex items-center text-[10px] uppercase tracking-wider px-3 py-1.5 font-bold rounded-xs transition-colors shrink-0 btn-tactile ${
                  isDarkHeader
                    ? 'bg-white text-[#111111] hover:bg-white/85'
                    : 'bg-[#111111] text-white hover:bg-[#333333]'
                }`}
              >
                Login
              </Link>
            )}
            {/* Portal Shortcuts depending on Role / Quick access */}
            {currentUser?.role === 'employee' ? (
              <Link
                href="/employee"
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2.5 py-1 font-bold rounded-xs transition-colors shrink-0 ml-0.5 ${
                  isDarkHeader
                    ? 'bg-white/15 text-white border border-white/30 hover:bg-white/25 backdrop-blur-sm'
                    : 'bg-[#EBF3EA] text-[#2D5A27] hover:bg-[#d8e8d6]'
                }`}
                title="Employee Workspace"
              >
                <span>Staff</span>
              </Link>
            ) : currentUser?.role === 'admin' ? (
              <Link
                href="/admin"
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2.5 py-1 font-bold rounded-xs transition-colors shrink-0 ml-0.5 ${
                  isDarkHeader
                    ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm'
                    : 'bg-[#111111] text-white hover:bg-[#333333]'
                }`}
                title="Admin Portal"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#B9A58B]" />
                <span>Admin</span>
              </Link>
            ) : (
              <div className="relative group/portal hidden xl:block shrink-0">
                <button
                  type="button"
                  className={`flex items-center gap-1 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded transition-all font-semibold ${
                    isDarkHeader
                      ? 'border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                      : 'border border-[#E5E5E5] hover:border-gray-400 bg-white hover:bg-[#FAFAF9] text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  <span>Portal</span>
                  <ChevronDown className={`w-3 h-3 ${isDarkHeader ? 'text-white/80' : 'text-[#888888]'}`} />
                </button>
                <div className="absolute right-0 top-full pt-1.5 hidden group-hover/portal:block z-50 animate-scale-in">
                  <div className={`w-44 border shadow-lg rounded-md py-1.5 text-xs ${
                    isDarkHeader
                      ? 'bg-[#141414] border-[#2A2A2A] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#111111]'
                  }`}>
                    <Link
                      href="/employee"
                      className={`flex items-center gap-2 px-3 py-2 font-medium transition-colors ${
                        isDarkHeader ? 'text-[#CCCCCC] hover:bg-[#222222]' : 'text-[#333333] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#888888]" />
                      <span>Staff Workspace</span>
                    </Link>
                    <Link
                      href="/admin"
                      className={`flex items-center gap-2 px-3 py-2 font-medium transition-colors ${
                        isDarkHeader ? 'text-[#CCCCCC] hover:bg-[#222222]' : 'text-[#333333] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#888888]" />
                      <span>Admin Console</span>
                    </Link>
                  </div>
                </div>
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
                    HELLOBEE
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
                <span>Search products, parts...</span>
              </button>

              {/* Navigation Links */}
              <div className="py-5 space-y-3.5 text-xs uppercase tracking-wider font-semibold text-[#111111]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[var(--honey-deep)] transition-colors"
                >
                  {t.nav.home}
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[var(--honey-deep)] transition-colors"
                >
                  {t.nav.products}
                </Link>
                <Link
                  href="/calculator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 font-semibold text-[#111111] hover:text-[var(--honey-deep)] transition-colors"
                >
                  Tax Calculator (US & VN)
                </Link>
                <Link
                  href="/hellobee"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 font-semibold text-[#111111] hover:text-[var(--honey-deep)] transition-colors"
                >
                  <span>Hellobee Network</span>
                </Link>
              </div>

              {/* Account & Quick Actions */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                {currentUser ? (
                  <Link
                      href={currentUser ? '/account' : '/login'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2 text-xs font-semibold text-[#111111]"
                    >
                      <User className="w-4 h-4" />
                      <span>
                        {currentUser
                          ? `Account (${currentUser.name})`
                          : 'Sign In / Register'}
                      </span>
                    </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#111111] text-white rounded-xs"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-semibold text-[#111111]"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
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
                  href="/employee"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-xs font-medium text-[#777777] hover:text-[#111111]"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Staff Workspace</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-xs font-medium text-[#777777] hover:text-[#111111]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer with Interactive Currency */}
            <div className="pt-5 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#777777] font-medium">Currency</span>
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-full border border-[#E5E5E5] bg-[#F5F4F0] text-[#333333] hover:bg-[#EAE8E3] transition-colors"
              >
                {currency === 'USD' ? '$ USD' : '₫ VND'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
