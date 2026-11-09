'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  TicketPercent,
  MessageSquare,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Shirt },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Discounts', href: '/admin/discounts', icon: TicketPercent },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const resetDemoData = useCommerceStore((state) => state.resetDemoData);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    toast.success('Demo data restored to initial state.');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col md:flex-row text-[#111111]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white flex-shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-6 border-b border-[#262626] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-[0.2em] uppercase">COS</span>
            <span className="text-[10px] bg-[#333333] px-2 py-0.5 uppercase tracking-wider font-semibold text-[#B9A58B]">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] uppercase tracking-wider font-medium rounded-none transition-colors ${
                  isActive
                    ? 'bg-white text-[#111111] font-semibold'
                    : 'text-[#999999] hover:bg-[#222222] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#262626] space-y-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#B74747] hover:bg-[#222222] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#222222] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-[#E5E5E5] h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-[#111111]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium uppercase tracking-wider text-[#111111]">
              Commerce Management Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#B74747] text-[#B74747] text-[11px] uppercase font-semibold hover:bg-[#FBEAEA] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[11px] uppercase font-semibold hover:bg-[#333333] transition-colors"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex md:hidden">
          <div className="bg-[#111111] text-white w-64 h-full flex flex-col p-6 animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center pb-6 border-b border-[#262626]">
              <span className="text-lg font-bold tracking-[0.2em] uppercase">COS ADMIN</span>
              <button onClick={() => setIsMobileOpen(false)}>
                <X className="w-5 h-5 text-[#999999]" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider rounded-none ${
                      isActive ? 'bg-white text-[#111111] font-semibold' : 'text-[#999999]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-[#262626] space-y-2">
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-[#999999] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-[#E5E5E5] space-y-4">
            <h3 className="text-base font-semibold text-[#111111]">
              Reset All Demo Data?
            </h3>
            <p className="text-xs text-[#777777] leading-relaxed">
              This will restore all products, orders, categories, customers, discounts, and inventory
              adjustments back to initial mock datasets and clear your custom edits from LocalStorage.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-[#B74747] text-white py-2.5 text-xs uppercase font-semibold hover:bg-[#963737]"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 border border-[#E5E5E5] text-[#111111] py-2.5 text-xs uppercase font-medium hover:bg-[#F5F4F0]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
