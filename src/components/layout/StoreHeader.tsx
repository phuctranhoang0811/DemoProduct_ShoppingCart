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
  Droplets,
  Sparkles,
  PhoneCall,
  Award,
  Globe,
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
  const [activeDropdown, setActiveDropdown] = useState<'ionizers' | 'waters' | null>(null);

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

  const handleMouseEnter = (menu: 'ionizers' | 'waters') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const ionizerProducts = products.filter((p) => p.categoryId === 'cat-ionizers' || p.categoryId === 'cat-spa');

  return (
    <>
      <header
        className="sticky top-0 z-40 glass-nav transition-all duration-300 border-b border-[#0055A5]/10 bg-white/80 backdrop-blur-xl"
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#002B5C]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Enagic & Kangen Water Brand Identity */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0055A5] via-[#0072CE] to-[#00A3E0] flex items-center justify-center text-white shadow-md shadow-[#0055A5]/30 group-hover:scale-105 transition-transform">
                <Droplets className="w-5 h-5 fill-white stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-[0.16em] text-[#002B5C] leading-none flex items-center">
                  ENAGIC<sup className="text-[10px] font-bold text-[#00A3E0] ml-0.5">®</sup>
                </span>
                <span className="text-[9px] uppercase tracking-[0.26em] font-extrabold text-[#0072CE] mt-0.5">
                  KANGEN WATER<sup className="text-[7px]">®</sup>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[13px] uppercase tracking-[0.12em] font-semibold text-[#1B365D] h-full">
            <Link
              href="/"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#0055A5] hover:text-[#0055A5] transition-all"
            >
              {t.nav.home}
            </Link>

            {/* Máy Điện Giải with Hover Mega Menu */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('ionizers')}
            >
              <Link
                href="/shop"
                className={`py-7 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeDropdown === 'ionizers'
                    ? 'border-[#0055A5] text-[#0055A5]'
                    : 'border-transparent hover:border-[#0055A5] hover:text-[#0055A5]'
                }`}
              >
                <span>{t.nav.products}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'ionizers' ? 'rotate-180' : ''
                  }`}
                />
              </Link>
            </div>

            {/* 5 Loại Nước Kangen */}
            <Link
              href="/#waters-section"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#0055A5] hover:text-[#0055A5] transition-all flex items-center gap-1.5"
            >
              <span className="text-[#0072CE]">&bull;</span>
              <span>{t.nav.waterTypes}</span>
            </Link>

            {/* Lõi Lọc & Phụ Kiện */}
            <Link
              href="/shop?category=cat-filters"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#0055A5] hover:text-[#0055A5] transition-all"
            >
              {t.nav.accessories}
            </Link>

            {/* Chứng Nhận Y Tế */}
            <Link
              href="/#certifications"
              onMouseEnter={() => setActiveDropdown(null)}
              className="py-7 border-b-2 border-transparent hover:border-[#0055A5] hover:text-[#0055A5] transition-all flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{t.nav.certifications}</span>
            </Link>
          </nav>

          {/* Right Action Icons: Language, Currency, Search, Wishlist, Cart, Admin */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 text-[#002B5C]">
            {/* Multi-language Switcher: VI | EN */}
            <div className="flex items-center p-0.5 bg-[#EDF3F8] rounded-full border border-[#0055A5]/15 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  language === 'vi'
                    ? 'bg-[#0055A5] text-white shadow-xs scale-105'
                    : 'text-[#4A6B82] hover:text-[#002B5C]'
                }`}
                title="Tiếng Việt (vi_VN)"
                aria-label="Switch to Vietnamese"
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-[#0055A5] text-white shadow-xs scale-105'
                    : 'text-[#4A6B82] hover:text-[#002B5C]'
                }`}
                title="English (en_US)"
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Currency Switcher (VND / USD) */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
              className="glass-btn hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full text-[#002B5C] border-[#0055A5]/20 hover:border-[#0055A5]"
              title={`Switch currency to ${currency === 'USD' ? 'VND (₫)' : 'USD ($)'}`}
              aria-label="Toggle currency"
            >
              <span className="text-[11px] font-mono font-bold text-[#0072CE]">{currency === 'USD' ? '$' : '₫'}</span>
              <span className="text-[11px] font-bold text-[#002B5C]">{currency}</span>
            </button>

            {/* Desktop Instant Search Trigger with Shortcut */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="glass-btn hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-[#4A6B82] font-medium hover:text-[#002B5C] border-[#0055A5]/20"
              aria-label="Open search dialog"
            >
              <Search className="w-3.5 h-3.5 text-[#0055A5] stroke-[2]" />
              <span className="text-[12px] text-[#4A6B82] line-clamp-1 max-w-[130px]">{t.nav.searchPlaceholder}</span>
              <kbd className="text-[10px] bg-white border border-[#0055A5]/20 rounded px-1.5 py-0.2 font-mono font-bold text-[#0055A5] shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 hover:text-[#0055A5] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Account */}
            <Link
              href={currentUser ? '/account' : '/login'}
              className="p-1 hover:text-[#0055A5] transition-colors hidden sm:inline-block relative group"
              aria-label="Account"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In'}
            >
              <User className="w-5 h-5 stroke-[1.7]" />
              {currentUser && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00A3E0] rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1 hover:text-[#0055A5] transition-colors relative"
              aria-label="Wishlist"
              title={t.nav.savedItems}
            >
              <Heart className="w-5 h-5 stroke-[1.7]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#0055A5] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger -> Opens Full Slide-Over Cart Drawer */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1 hover:text-[#0055A5] transition-colors relative flex items-center"
              aria-label="Open shopping bag drawer"
              title={t.nav.shoppingBag}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#0072CE] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in zoom-in-75">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Admin Portal Pill (Preserved as explicitly requested) */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold bg-[#002B5C] text-white hover:bg-[#0055A5] transition-all rounded-full shadow-xs"
              title="Admin Portal"
            >
              <Shield className="w-3 h-3 text-[#00A3E0]" />
              <span>{t.nav.adminPortal}</span>
            </Link>
          </div>
        </div>

        {/* Dropdown Mega Menu for Kangen Ionizers */}
        {activeDropdown === 'ionizers' && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full glass-card border-b border-[#0055A5]/20 shadow-2xl animate-in fade-in duration-150 before:absolute before:-top-3 before:h-3 before:w-full before:content-['']"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-8 grid grid-cols-12 gap-8">
              {/* Column 1: Core Models List */}
              <div className="col-span-4 space-y-3 border-r border-[#E5E5E5] pr-6">
                <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#0055A5] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Dòng Máy Điện Giải Y Tế Chuẩn Nhật Bản</span>
                </span>
                <ul className="space-y-2 pt-1 text-xs">
                  {ionizerProducts.slice(0, 5).map((prod) => (
                    <li key={prod.id}>
                      <Link
                        href={`/product/${prod.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="p-2 rounded-lg hover:bg-[#EDF4FA] transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-[#002B5C] group-hover:text-[#0055A5]">
                            {language === 'vi' ? prod.nameVi || prod.name : prod.nameEn || prod.name}
                          </p>
                          <p className="text-[11px] text-[#666666] line-clamp-1">{prod.materials}</p>
                        </div>
                        <span className="text-[12px] font-bold text-[#0055A5] font-mono ml-2">
                          {formatPrice(prod.price, currency)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: 5 Water Types Overview */}
              <div className="col-span-4 space-y-3 border-r border-[#E5E5E5] pr-6">
                <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#0072CE]">
                  Công Dụng 5 Loại Nước Kangen®
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#EBF6FC] border border-[#00A3E0]/20">
                    <p className="font-bold text-[#0055A5]">1. Nước Kangen Uống (pH 8.5 - 9.5)</p>
                    <p className="text-[11px] text-[#4A6B82]">Giàu Hydro chống lão hóa, thanh lọc cơ thể, nấu ăn ngon.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FDF7E7] border border-[#C5A059]/20">
                    <p className="font-bold text-[#8A6D2B]">2. Nước Kiềm Mạnh (pH 11.5)</p>
                    <p className="text-[11px] text-[#6E5A2A]">Bóc tách thuốc trừ sâu, chất bảo quản và dầu bóng trên rau củ quả.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FDEEEF] border border-[#B74747]/20">
                    <p className="font-bold text-[#B74747]">3. Nước Axit Mạnh (pH 2.5)</p>
                    <p className="text-[11px] text-[#7A3333]">Diệt khuẩn 99.99% vết thương, sát trùng dao thớt dụng cụ nhà bếp.</p>
                  </div>
                </div>
              </div>

              {/* Column 3: Flagship LeveLuk K8 Highlight Banner */}
              <div className="col-span-4 pl-2 flex flex-col justify-center">
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-tr from-[#002B5C] to-[#0055A5] p-6 text-white shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00A3E0] text-[10px] font-extrabold uppercase tracking-wider text-white mb-2">
                      Flagship Model
                    </span>
                    <h4 className="text-xl font-bold leading-tight">Enagic LeveLuk K8</h4>
                    <p className="text-xs text-[#D8E6F3] mt-1 line-clamp-2">
                      8 Tấm điện cực Titan phủ Bạch kim, màn hình cảm ứng LCD 8 thứ tiếng.
                    </p>
                  </div>
                  <Link
                    href="/product/enagic-leveluk-k8"
                    onClick={() => setActiveDropdown(null)}
                    className="inline-flex items-center gap-1.5 bg-white text-[#002B5C] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#00A3E0] hover:text-white transition-all self-start shadow-md"
                  >
                    <span>Khám Phá K8</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#0055A5]/20 glass-card px-6 py-6 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto shadow-2xl bg-white/95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0055A5]">
                Enagic® Kangen Water® Menu
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                  className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#0055A5] text-white"
                >
                  {language.toUpperCase()}
                </button>
                <button
                  onClick={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
                  className="px-2 py-1 text-xs font-bold rounded-full border border-black/20 text-[#111111]"
                >
                  {currency}
                </button>
              </div>
            </div>

            <nav className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-semibold text-[#002B5C]">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] flex items-center justify-between"
              >
                <span>{t.nav.home}</span>
              </Link>

              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] flex items-center justify-between text-[#0055A5] font-bold"
              >
                <span>{t.nav.products} (LeveLuk K8, SD501...)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/#waters-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] flex items-center justify-between"
              >
                <span>{t.nav.waterTypes}</span>
              </Link>

              <Link
                href="/shop?category=cat-filters"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] flex items-center justify-between"
              >
                <span>{t.nav.accessories}</span>
              </Link>

              <Link
                href="/#certifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#F5F4F0] flex items-center justify-between"
              >
                <span>{t.nav.certifications}</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 py-3 bg-[#002B5C] text-white text-center rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Shield className="w-4 h-4 text-[#00A3E0]" />
                <span>{t.nav.adminPortal}</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Instant Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
