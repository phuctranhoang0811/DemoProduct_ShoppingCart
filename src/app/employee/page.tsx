'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  Users,
  ShoppingBag,
  Boxes,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  Filter,
  Check,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { OrderStatus, Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function EmployeePage() {
  const currentUser = useCommerceStore((state) => state.currentUser);
  const loginAsDemo = useCommerceStore((state) => state.loginAsDemo);
  const logout = useCommerceStore((state) => state.logout);
  const orders = useCommerceStore((state) => state.orders);
  const customers = useCommerceStore((state) => state.customers);
  const updateOrderStatus = useCommerceStore((state) => state.updateOrderStatus);
  const products = useCommerceStore((state) => state.products);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);
  const commissions = useCommerceStore((state) => state.commissions);
  const requestPayout = useCommerceStore((state) => state.requestPayout);
  const currency = useCommerceStore((state) => state.currency);

  const [activeTab, setActiveTab] = useState<'orders' | 'leads' | 'inventory' | 'referral'>('orders');
  const [orderFilter, setOrderFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutBank, setPayoutBank] = useState('Chase Bank / Vietcombank');
  const [payoutAccount, setPayoutAccount] = useState('001100223344');

  // Lead contact simulation state
  const [leads, setLeads] = useState([
    {
      id: 'lead-01',
      name: 'Dr. Arthur Vance',
      phone: '+1 (555) 234-8899',
      email: 'a.vance@wellnessclinic.org',
      interestedIn: 'Kangen K8 (8-Plate Medical Grade)',
      status: 'Consultation Scheduled',
      date: 'Today, 10:30 AM',
      notes: 'Requested clinic installation for 2 doctor consultation rooms.',
    },
    {
      id: 'lead-02',
      name: 'Claire Beauchamp',
      phone: '+1 (555) 987-1234',
      email: 'claire.b@highrise.io',
      interestedIn: 'Anespa DX Mineral Ion Water Spa',
      status: 'Quote Sent',
      date: 'Yesterday',
      notes: 'Interested in luxury master bathroom shower mineral filtration.',
    },
    {
      id: 'lead-03',
      name: 'Marcus Lindqvist',
      phone: '+1 (555) 912-3456',
      email: 'marcus.l@nordicminimal.com',
      interestedIn: 'Leveluk SD501 Platinum',
      status: 'Water Test Demo Requested',
      date: 'Nov 12',
      notes: 'Needs technician to perform pH and ORP chemical drop test at home.',
    },
  ]);

  // Current employee member record
  const currentMember = hellobeeMembers.find((m) =>
    currentUser?.role === 'employee'
      ? m.referralCode === currentUser.referralCode || m.role === 'EMPLOYEE'
      : m.role === 'EMPLOYEE'
  ) || hellobeeMembers[2];
  const employeeCode = currentMember?.referralCode || 'HB-EMP-101';
  const assignedClients = customers.filter(
    (c) => c.referralCode?.toUpperCase() === employeeCode.toUpperCase()
  );
  const referralLink = `https://enagic-store.com/checkout?ref=${employeeCode}`;

  // Employee sees only their own referral orders; admin sees all
  const myOrders =
    currentUser?.role === 'admin'
      ? orders
      : orders.filter(
          (o) => o.referralCode?.toUpperCase() === employeeCode.toUpperCase()
        );

  const isAuthorized = currentUser && (currentUser.role === 'employee' || currentUser.role === 'admin');

  // If user is not an employee or admin, show role-based access gate
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 bg-[#FAF1E4] text-[#8C5E1E] rounded-full flex items-center justify-center mx-auto border border-[#8C5E1E]/20">
            <Briefcase className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C5E1E]">
              Restricted Area &bull; Role Authorization
            </span>
            <h1 className="text-xl font-bold text-[#111111]">
              Employee Workspace Required
            </h1>
          </div>

          <p className="text-xs text-[#666666] leading-relaxed">
            {currentUser
              ? `You are currently logged in as ${currentUser.name} with role "${currentUser.role?.toUpperCase()}". To become a certified referral employee, you must purchase a qualifying $1,500 water ionizer and accept consultant terms.`
              : 'Sign in with an authorized employee account to access customer fulfillment, inventory lookup, and sales commission records.'}
          </p>

          <div className="pt-2 space-y-2">
            <Link
              href="/hellobee"
              className="w-full bg-[#111111] text-white py-3 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Unlock Employee Status ($1,500 Device) &rarr;</span>
            </Link>

            <button
              onClick={() => {
                loginAsDemo('employee');
                toast.success('Signed in as David Nguyen (Employee / HB-EMP-101)');
              }}
              className="w-full bg-[#2D5A27] text-white py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#23471f] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Demo Switch: Sign In as David Nguyen</span>
            </button>

            <Link
              href="/login"
              className="w-full block border border-[#E5E5E5] py-2.5 rounded-xs text-xs uppercase tracking-wider font-medium text-[#555] hover:bg-[#F5F4F0] transition-colors"
            >
              Go to Standard Sign In
            </Link>

            <Link
              href="/"
              className="block text-xs text-[#777777] hover:text-[#111111] pt-2"
            >
              &larr; Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders (scoped to employee's own referrals, or all for admin)
  const filteredOrders = myOrders.filter((o) => {
    const matchesFilter = orderFilter === 'ALL' || o.status === orderFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus, `Updated by staff ${currentUser.name}`);
    toast.success(`Order #${orderId.slice(-8).toUpperCase()} updated to ${newStatus}`);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      toast.success('Employee referral link copied to clipboard!');
    }
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payout amount.');
      return;
    }
    requestPayout(currentMember.id, amountNum, payoutBank, payoutAccount, currentUser.name);
    setIsPayoutModalOpen(false);
    toast.success(`Payout request of ${formatPrice(amountNum, currency)} submitted for owner approval.`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111]">
      {/* Top Staff Navbar */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={85}
                height={35}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <span className="text-[10px] bg-[#EBF3EA] text-[#2D5A27] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#2D5A27]/20 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Staff Workspace
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-[#E5E5E5]">
              <div className="w-7 h-7 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name[0]}
              </div>
              <div>
                <p className="font-bold text-[#111111] leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-[#2D5A27] font-mono mt-0.5">ID: {employeeCode}</p>
              </div>
            </div>

            {/* Quick role switcher for demo convenience */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  loginAsDemo('admin');
                  toast.success('Switched to Administrator role (Johnathan Bee)');
                }}
                className="text-[10px] uppercase font-bold text-[#555] hover:text-[#111111] px-2 py-1 border border-[#E5E5E5] rounded-xs hover:bg-[#F5F4F0]"
                title="Switch to Admin"
              >
                Switch to Admin
              </button>
              <button
                onClick={() => {
                  loginAsDemo('customer');
                  toast.success('Switched to Customer role (Elena Rostova)');
                }}
                className="text-[10px] uppercase font-bold text-[#555] hover:text-[#111111] px-2 py-1 border border-[#E5E5E5] rounded-xs hover:bg-[#F5F4F0]"
                title="Switch to Customer"
              >
                Switch to Customer
              </button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Signed out.');
                }}
                className="p-1.5 text-[#B74747] hover:bg-[#FBEAEA] rounded-xs transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Employee Profile & KPI Dashboard Banner */}
        <div className="bg-[#FAF9F5] border border-[#E5E5E5] rounded-xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EAE8E1]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#111111] text-white px-2 py-0.5 rounded-xs font-bold">
                  {currentMember.rank} Associate
                </span>
                <span className="text-[10px] font-bold text-[#2D5A27] bg-[#EBF3EA] px-2.5 py-0.5 rounded-full border border-[#2D5A27]/20">
                  10% Direct Commission Eligible
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#111111]">
                Welcome back, {currentUser.name}
              </h1>
              <p className="text-xs text-[#666666]">
                Enagic Certified Water Consultant &bull; Consultant Referral Code:{' '}
                <strong className="text-[#111111] font-mono">{employeeCode}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#333333] transition-colors shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy My Referral Link</span>
              </button>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#2D5A27] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#23471f] transition-colors shadow-2xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Request Commission Payout</span>
              </button>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 border border-[#111111] px-3.5 py-2 text-xs uppercase tracking-wider font-medium text-[#111111] hover:bg-[#F5F4F0] rounded-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </Link>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="bg-white p-4 rounded-lg border border-[#EBEBEB]">
              <span className="text-[11px] uppercase tracking-wider text-[#777777] font-medium block">
                Personal Sales Volume
              </span>
              <p className="text-xl font-bold text-[#111111] mt-1">
                {formatPrice(currentMember.personalSalesVolume, currency)}
              </p>
              <p className="text-[10px] text-[#2D5A27] font-semibold mt-0.5">
                {currentMember.validOrdersCount} Machine Sales Logged
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#EBEBEB]">
              <span className="text-[11px] uppercase tracking-wider text-[#777777] font-medium block">
                Total 10% Commission Earned
              </span>
              <p className="text-xl font-bold text-[#2D5A27] mt-1">
                {formatPrice(currentMember.totalCommissionEarned, currency)}
              </p>
              <p className="text-[10px] text-[#777777] mt-0.5">Lifetime Accumulated</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#EBEBEB]">
              <span className="text-[11px] uppercase tracking-wider text-[#777777] font-medium block">
                Available Payout Balance
              </span>
              <p className="text-xl font-bold text-[#8C5E1E] mt-1">
                {formatPrice(currentMember.availableBalance, currency)}
              </p>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="text-[10px] font-semibold text-[#8C5E1E] underline hover:text-[#111111] mt-0.5 block"
              >
                Withdraw to Bank &rarr;
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#EBEBEB]">
              <span className="text-[11px] uppercase tracking-wider text-[#777777] font-medium block">
                {currentUser.role === 'admin' ? 'All Store Orders' : 'My Referral Orders'}
              </span>
              <p className="text-xl font-bold text-[#111111] mt-1">{myOrders.length} Total</p>
              <p className="text-[10px] text-[#477A5A] font-semibold mt-0.5">
                {myOrders.filter((o) => o.status === 'Pending').length} Pending Technician Dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E5E5] gap-8 text-xs uppercase tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Order Fulfillment & Status ({myOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <Users className="w-4 h-4" /> Consultation Queue & Leads ({leads.length + assignedClients.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <Boxes className="w-4 h-4" /> Warehouse Stock Lookup ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'referral'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <Share2 className="w-4 h-4" /> My Referral Link & QR Tool
          </button>
        </div>

        {/* TAB 1: ORDER FULFILLMENT & STATUS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Admin leaderboard */}
            {currentUser.role === 'admin' && (
              <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                <h2 className="text-xs uppercase tracking-wider font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#2D5A27]" />
                  Employee Revenue Leaderboard
                </h2>
                <div className="space-y-2">
                  {hellobeeMembers.map((m, i) => {
                    const memberOrders = orders.filter(
                      (o) => o.referralCode?.toUpperCase() === m.referralCode?.toUpperCase()
                    );
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 bg-[#FAF9F5] rounded-lg border border-[#EAE8E1]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-[#777777] w-5">#{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-[#111111]">{m.name}</p>
                            <p className="text-[10px] font-mono text-[#777777]">{m.referralCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#2D5A27]">
                            {memberOrders.length} order{memberOrders.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-[#777777]">
                            {formatPrice(m.totalCommissionEarned, currency)} commission
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#E5E5E5]">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-[#777777] font-semibold uppercase pr-2">Filter:</span>
                {(['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1 rounded-xs font-semibold uppercase text-[10px] tracking-wider transition-colors ${
                        orderFilter === st
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F5F4F0] text-[#555] hover:bg-[#EBEBEB]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search customer, phone, order #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs p-2 pl-8 border border-[#E5E5E5] rounded-xs outline-none focus:border-[#111111] bg-white"
                />
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#777777]">
                  <tr>
                    <th className="p-3.5 font-bold">Order ID</th>
                    <th className="p-3.5 font-bold">Customer & Contact</th>
                    <th className="p-3.5 font-bold">Destination</th>
                    <th className="p-3.5 font-bold">Equipment / Items</th>
                    <th className="p-3.5 font-bold">Total / Payment</th>
                    <th className="p-3.5 font-bold">Fulfillment Status</th>
                    <th className="p-3.5 font-bold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-[#777777]">
                        No orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#111111]">
                          #{order.id.slice(-8).toUpperCase()}
                          <span className="block text-[10px] text-[#777777] font-normal font-sans">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-[#111111]">{order.customerName}</p>
                          <p className="text-[11px] text-[#777777] font-mono">{order.customerPhone}</p>
                        </td>
                        <td className="p-3.5 text-[#555555]">
                          <p className="line-clamp-1">{order.shippingAddress.street}</p>
                          <p className="text-[11px] text-[#777777]">{order.shippingAddress.city}</p>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            {order.items.slice(0, 2).map((it, idx) => (
                              <p key={idx} className="line-clamp-1 font-medium text-[#111111]">
                                {it.productName} ({it.size}) &times; {it.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-[10px] text-[#888888]">
                                +{order.items.length - 2} more items
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#111111]">{formatPrice(order.total)}</span>
                          <span
                            className={`block text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'Paid' ? 'text-[#2D5A27]' : 'text-[#8C5E1E]'
                            }`}
                          >
                            {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Delivered'
                                ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                : order.status === 'Shipped'
                                ? 'bg-[#E0F2FE] text-[#0369A1]'
                                : order.status === 'Processing'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : order.status === 'Cancelled'
                                ? 'bg-[#FBEAEA] text-[#B74747]'
                                : 'bg-[#F5F4F0] text-[#555555]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="text-[11px] font-semibold bg-white border border-[#D5D5D5] rounded-xs px-2 py-1 outline-none focus:border-[#111111]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTATION QUEUE & LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111]">
                  Incoming Customer Consultations & Demo Requests
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Direct water quality testing, showroom visits, and residential installation assessments.
                </p>
              </div>
              <button
                onClick={() => toast.success('Lead records refreshed from CRM webhook.')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#111111] text-xs font-semibold uppercase rounded-xs hover:bg-[#F5F4F0]"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Leads
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {assignedClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-lg border-2 border-[#2D5A27]/30 p-5 space-y-3 shadow-xs hover:border-[#2D5A27] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#111111]">{client.name}</h3>
                        <span className="text-[10px] text-[#888888] font-mono">
                          {client.createdAt?.slice(0, 10)}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-[#EBF3EA] text-[#2D5A27] px-2 py-0.5 rounded-full">
                        Registered Client
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#555]">
                      <p className="font-semibold text-[#111111]">
                        Total Spent: {formatPrice(client.totalSpent)} ({client.totalOrders} Orders)
                      </p>
                      <p className="flex items-center gap-1 text-[#477A5A]">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </p>
                      <p className="flex items-center gap-1 text-[#666]">
                        <Mail className="w-3 h-3" /> {client.email}
                      </p>
                    </div>

                    <p className="text-[11px] text-[#2D5A27] bg-[#FAF9F5] p-2.5 rounded border border-[#E5E5E5]">
                      Linked to your code <strong>{employeeCode}</strong>. 10% direct commission auto-awarded on all purchases.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0F0F0] flex gap-2">
                    <a
                      href={`tel:${client.phone}`}
                      className="flex-1 bg-[#2D5A27] text-white py-1.5 rounded-xs text-[10px] uppercase font-semibold text-center hover:bg-[#1f401b] transition-colors"
                    >
                      Call Client
                    </a>
                    <a
                      href={`mailto:${client.email}`}
                      className="flex-1 border border-[#D5D5D5] py-1.5 rounded-xs text-[10px] uppercase font-semibold text-[#555] text-center hover:bg-[#F5F4F0]"
                    >
                      Email Client
                    </a>
                  </div>
                </div>
              ))}

              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-lg border border-[#E5E5E5] p-5 space-y-3 shadow-xs hover:border-[#111111] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#111111]">{lead.name}</h3>
                        <span className="text-[10px] text-[#888888] font-mono">{lead.date}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-[#EBF3EA] text-[#2D5A27] px-2 py-0.5 rounded-full">
                        {lead.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#555]">
                      <p className="font-semibold text-[#111111]">Model: {lead.interestedIn}</p>
                      <p className="flex items-center gap-1 text-[#477A5A]">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </p>
                      <p className="flex items-center gap-1 text-[#666]">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </p>
                    </div>

                    <p className="text-[11px] text-[#666666] bg-[#FAF9F5] p-2.5 rounded border border-[#EAE8E1]">
                      {lead.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0F0F0] flex gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 bg-[#111111] text-white py-1.5 rounded-xs text-[10px] uppercase font-semibold text-center hover:bg-[#333333] transition-colors"
                    >
                      Call Lead
                    </a>
                    <button
                      onClick={() => toast.success(`Logged demo appointment for ${lead.name}`)}
                      className="flex-1 border border-[#D5D5D5] py-1.5 rounded-xs text-[10px] uppercase font-semibold text-[#555] hover:bg-[#F5F4F0]"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY LOOKUP */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111]">
                  Live Warehouse Stock & Machine Specifications
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Verify available units for immediate customer dispatch and certified technician pairing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => {
                const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg border border-[#E5E5E5] p-4 flex gap-4 shadow-xs"
                  >
                    <div className="relative w-20 h-20 bg-white border border-[#EAEAEA] rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <Image src={p.images[0]} alt={p.name} fill className="object-contain p-1" sizes="80px" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-semibold text-[#111111] line-clamp-1">{p.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              totalStock > 5
                                ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                : totalStock > 0
                                ? 'bg-[#FFF7ED] text-[#C2410C]'
                                : 'bg-[#FBEAEA] text-[#B74747]'
                            }`}
                          >
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#777777] font-mono">SKU: {p.sku}</p>
                        <p className="font-bold text-[#111111] mt-1">{formatPrice(p.price)}</p>
                      </div>

                      <div className="pt-2 text-[10px] text-[#666666] border-t border-[#F0F0F0]">
                        {p.specifications?.electrodes && (
                          <span>Plates: {p.specifications.electrodes} Titanium &bull; </span>
                        )}
                        <span>Warranty: 3-5 Years</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MY REFERRAL TOOLS & QR TOOL */}
        {activeTab === 'referral' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-6 sm:p-7 space-y-6">
              <div className="space-y-1 pb-4 border-b border-[#F0F0F0]">
                <span className="text-[10px] uppercase font-bold text-[#2D5A27] bg-[#EBF3EA] px-2.5 py-0.5 rounded-full border border-[#2D5A27]/20">
                  Enagic Associate Code &bull; 10% Direct Commission
                </span>
                <h2 className="text-base font-bold text-[#111111] pt-1">
                  Your Personal Referral Link & Promotion Tool
                </h2>
                <p className="text-xs text-[#777777]">
                  Share this unique link with prospective clients. When they checkout using this link,
                  your code ({employeeCode}) is automatically applied and 10% commission is recorded.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#555555] block">
                  Unique Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-[#FAF9F5] border border-[#D5D5D5] px-3.5 py-2.5 rounded-xs text-xs font-mono text-[#111111] outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-[#111111] text-white px-5 py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#333333] transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Commission Table Guide */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                  Direct Commission Payout Matrix (Per Device)
                </h3>
                <div className="border border-[#E5E5E5] rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF9F5] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#777777]">
                      <tr>
                        <th className="p-3 font-bold">Equipment Model</th>
                        <th className="p-3 font-bold">Retail Price</th>
                        <th className="p-3 font-bold">Your Commission (10%)</th>
                        <th className="p-3 font-bold">Estimated Turnaround</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F0]">
                      <tr>
                        <td className="p-3 font-semibold text-[#111111]">Kangen K8 (8-Plate Titanium)</td>
                        <td className="p-3">{formatPrice(4980)}</td>
                        <td className="p-3 font-bold text-[#2D5A27]">{formatPrice(498)}</td>
                        <td className="p-3 text-[#777777]">Upon customer installation</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#111111]">Leveluk SD501 Platinum</td>
                        <td className="p-3">{formatPrice(3980)}</td>
                        <td className="p-3 font-bold text-[#2D5A27]">{formatPrice(398)}</td>
                        <td className="p-3 text-[#777777]">Upon customer installation</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#111111]">Super 501 (Heavy Commercial)</td>
                        <td className="p-3">{formatPrice(5980)}</td>
                        <td className="p-3 font-bold text-[#2D5A27]">{formatPrice(598)}</td>
                        <td className="p-3 text-[#777777]">Upon customer installation</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#111111]">Anespa DX Home Mineral Spa</td>
                        <td className="p-3">{formatPrice(3100)}</td>
                        <td className="p-3 font-bold text-[#2D5A27]">{formatPrice(310)}</td>
                        <td className="p-3 text-[#777777]">Upon customer installation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Side Card: QR Code & Bank Information */}
            <div className="space-y-6">
              <div className="bg-[#FAF9F5] p-6 rounded-lg border border-[#E5E5E5] text-center space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111]">
                  Instant QR Code Scanner
                </h3>
                <div className="w-40 h-40 bg-white border border-[#E5E5E5] p-3 mx-auto flex items-center justify-center shadow-xs rounded-lg">
                  {/* Styled simulated QR code visual */}
                  <div className="w-full h-full bg-[#111111] p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-white border-2 border-black" />
                      <div className="w-8 h-8 bg-white border-2 border-black" />
                    </div>
                    <div className="text-white text-center font-mono font-bold text-[9px] tracking-widest">
                      {employeeCode}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-white border-2 border-black" />
                      <div className="w-8 h-8 bg-white/40" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#777777] max-w-xs mx-auto">
                  Show this QR code to customers at showroom demos or home water analysis sessions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] space-y-3 text-xs">
                <h3 className="uppercase tracking-wider font-bold text-[#111111]">
                  Commission Payout Channel
                </h3>
                <p className="text-[#666666]">
                  Your direct bank deposit is configured with automated monthly settlements on the 15th.
                </p>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="w-full bg-[#2D5A27] text-white py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#23471f] transition-colors"
                >
                  Request Fast Payout ({formatPrice(currentMember.availableBalance, currency)})
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Commission Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#111111] mb-1">Request Commission Withdrawal</h3>
            <p className="text-xs text-[#777777] mb-4">
              Available Balance: <strong className="text-[#2D5A27]">{formatPrice(currentMember.availableBalance, currency)}</strong>
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="50"
                  max={currentMember.availableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full border border-[#D5D5D5] p-2.5 rounded-xs outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                  className="w-full border border-[#D5D5D5] p-2.5 rounded-xs outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full border border-[#D5D5D5] p-2.5 rounded-xs outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0F0F0]">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase rounded-xs text-[#555] hover:bg-[#F5F4F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D5A27] text-white text-xs uppercase font-semibold rounded-xs hover:bg-[#23471f]"
                >
                  Submit Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
