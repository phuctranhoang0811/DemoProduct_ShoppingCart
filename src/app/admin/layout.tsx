'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Network,
  Briefcase,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Shirt },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Hellobee Network', href: '/admin/hellobee', icon: Network },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Discounts', href: '/admin/discounts', icon: TicketPercent },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Employee Workspace', href: '/employee', icon: Briefcase },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const resetDemoData = useCommerceStore((state) => state.resetDemoData);
  const currentUser = useCommerceStore((state) => state.currentUser);
  const loginAsDemo = useCommerceStore((state) => state.loginAsDemo);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    toast.success('Demo data restored to initial state.');
  };

  // RBAC Permission Check: If current user is logged in as Customer, deny admin entry
  const isCustomerOnly = currentUser && currentUser.role === 'customer';

  if (isCustomerOnly) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-[#FBEAEA] text-[#B74747] rounded-full flex items-center justify-center mx-auto border border-[#B74747]/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B74747]">
              Access Denied &bull; Role Authorization
            </span>
            <h1 className="text-xl font-bold text-[#111111]">
              Administrator Privileges Required
            </h1>
          </div>

          <p className="text-xs text-[#666666] leading-relaxed">
            You are currently signed in as <strong>{currentUser.name}</strong> with role{' '}
            <span className="font-mono uppercase font-bold text-[#111111]">CUSTOMER</span>. This area is
            restricted to system administrators.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                loginAsDemo('admin');
                toast.success('Signed in as Administrator (Johnathan Bee)');
              }}
              className="w-full bg-[#111111] text-white py-3 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors shadow-xs"
            >
              1-Click Switch to Administrator (Johnathan Bee)
            </button>

            <button
              onClick={() => {
                loginAsDemo('employee');
                toast.success('Signed in as Employee (David Nguyen)');
              }}
              className="w-full bg-[#2D5A27] text-white py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#23471f] transition-colors"
            >
              Switch to Employee Workspace (David Nguyen)
            </button>

            <Link
              href="/account"
              className="w-full block border border-[#E5E5E5] py-2.5 rounded-xs text-xs uppercase tracking-wider font-medium text-[#555] hover:bg-[#F5F4F0] transition-colors"
            >
              Return to Customer Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col md:flex-row text-[#111111]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white flex-shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-5 border-b border-[#262626] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={36}
              className="h-8 w-auto object-contain"
            />
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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                Commerce Admin Portal
              </h1>
              {currentUser && (
                <span className="hidden sm:inline-block text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded uppercase font-bold font-mono">
                  Role: {currentUser.role?.toUpperCase() || 'ADMIN'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Role Switcher for Evaluator Demo */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-[#888888] uppercase font-bold">Role:</span>
              <button
                onClick={() => {
                  loginAsDemo('employee');
                  toast.success('Switched to Employee role (David Nguyen)');
                }}
                className="text-[10px] uppercase font-bold text-[#2D5A27] bg-[#EBF3EA] px-2 py-0.5 rounded hover:bg-[#d8e8d6]"
                title="Switch to Employee"
              >
                Staff (10%)
              </button>
              <button
                onClick={() => {
                  loginAsDemo('customer');
                  toast.success('Switched to Customer role (Elena Rostova)');
                }}
                className="text-[10px] uppercase font-bold text-[#555] bg-[#F5F4F0] px-2 py-0.5 rounded hover:bg-[#EBEBEB]"
                title="Switch to Customer"
              >
                Customer
              </button>
            </div>

            <Link
              href="/employee"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5A27] text-white text-[11px] uppercase font-semibold hover:bg-[#23471f] transition-colors rounded-xs"
            >
              <Briefcase className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[11px] uppercase font-semibold hover:bg-[#333333] transition-colors rounded-xs"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Staff notice banner if logged in as employee */}
        {currentUser?.role === 'employee' && (
          <div className="bg-[#FAF1E4] border-b border-[#8C5E1E]/20 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-[#8C5E1E]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                You are currently viewing the Administrator Portal in Staff mode ({currentUser.name} - HB-EMP-101).
              </span>
            </div>
            <Link
              href="/employee"
              className="font-bold underline hover:text-[#111111] ml-2 flex-shrink-0"
            >
              Open Employee Workspace &rarr;
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex md:hidden">
          <div className="bg-[#111111] text-white w-64 h-full flex flex-col p-6 animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center pb-6 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={75}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
                <span className="text-[10px] bg-[#333333] px-2 py-0.5 uppercase tracking-wider font-semibold text-[#B9A58B]">
                  Admin
                </span>
              </div>
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
          <div className="bg-white max-w-md w-full p-6 border border-[#E5E5E5] space-y-4 rounded-lg">
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
                className="flex-1 bg-[#B74747] text-white py-2.5 text-xs uppercase font-semibold hover:bg-[#963737] rounded-xs"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 border border-[#E5E5E5] text-[#111111] py-2.5 text-xs uppercase font-medium hover:bg-[#F5F4F0] rounded-xs"
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
