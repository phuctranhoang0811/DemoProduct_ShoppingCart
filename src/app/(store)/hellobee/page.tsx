'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle,
  ShieldCheck,
  UserPlus,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Building,
  UserCheck,
  ShoppingCart,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { HellobeeRole, RankLevel, getNextRankProgress } from '@/types/hellobee';
import { formatPrice } from '@/lib/utils';

function HellobeePortalContent() {
  const searchParams = useSearchParams();

  const members = useCommerceStore((state) => state.hellobeeMembers);
  const commissions = useCommerceStore((state) => state.commissions);
  const payouts = useCommerceStore((state) => state.payouts);
  const activeMemberId = useCommerceStore((state) => state.activeMemberId);
  const setActiveMemberId = useCommerceStore((state) => state.setActiveMemberId);
  const registerHellobeeMember = useCommerceStore((state) => state.registerHellobeeMember);
  const recordReferralOrder = useCommerceStore((state) => state.recordReferralOrder);
  const requestPayout = useCommerceStore((state) => state.requestPayout);
  const currency = useCommerceStore((state) => state.currency);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'commissions' | 'payouts' | 'register'>('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<HellobeeRole>('EMPLOYEE');
  const [regSponsorCode, setRegSponsorCode] = useState(searchParams?.get('ref') || '');

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankName, setBankName] = useState('Chase Bank');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');

  // Find currently active member
  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];
  const isOwner = currentMember?.role === 'OWNER';

  // Subordinate employees if Owner
  const teamEmployees = members.filter((m) => m.ownerId === currentMember?.id);

  // Relevant commissions
  const memberCommissions = commissions.filter((c) => c.beneficiaryId === currentMember?.id);
  const memberPayouts = payouts.filter((p) => p.memberId === currentMember?.id);

  // Rank progression details
  const rankProgress = getNextRankProgress(currentMember?.rank || '1A', currentMember?.validOrdersCount || 0);

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      setRegSponsorCode(ref);
      setActiveTab('register');
    }
  }, [searchParams]);

  const handleCopyReferralLink = () => {
    if (typeof window === 'undefined' || !currentMember) return;
    const link = `${window.location.origin}/shop?ref=${currentMember.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    try {
      const created = registerHellobeeMember({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        role: regRole,
        sponsorCode: regSponsorCode.trim() || undefined,
      });

      toast.success(
        `Welcome to Hellobee! Generated Code: ${created.referralCode} (${created.role})`
      );
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setActiveTab('dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration error');
    }
  };

  const handleSimulateSale = () => {
    if (!currentMember) return;

    // Simulate placing a $1,500 order for the Hellobee machine
    const orderId = `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const buyerNames = ['Alex Morgan', 'Brandon Taylor', 'Catherine Wu', 'Daniel Miller', 'Emily Davis'];
    const buyer = buyerNames[Math.floor(Math.random() * buyerNames.length)];

    const result = recordReferralOrder(
      orderId,
      orderId,
      1500,
      buyer,
      currentMember.referralCode
    );

    if (result.success) {
      if (currentMember.role === 'EMPLOYEE') {
        toast.success(
          `🎉 New Sale Simulated! Awarded 10% commission ($150) to ${currentMember.name}. Supervising Owner awarded 1% ($15)!`
        );
      } else {
        toast.success(
          `🎉 Direct Owner Sale Simulated! Awarded 10% commission ($150) to ${currentMember.name}!`
        );
      }

      if (result.upgrades.length > 0) {
        result.upgrades.forEach((u) => {
          toast.success(
            `🚀 RANK ADVANCEMENT! ${u.memberName} has been promoted from ${u.oldRank} to ${u.newRank}!`
          );
        });
      }
    }
  };

  const handleRequestPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }
    if (amount > (currentMember?.availableBalance || 0)) {
      toast.error('Amount exceeds your available balance');
      return;
    }

    try {
      requestPayout(
        currentMember.id,
        amount,
        bankName,
        bankAccount,
        bankHolder || currentMember.name
      );
      toast.success(`Payout request of $${amount} submitted successfully!`);
      setIsPayoutModalOpen(false);
      setPayoutAmount('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payout request failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#111111]">
      {/* Top Banner / Hero */}
      <div className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Hellobee Network Portal • Referral & Commission Engine</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#111111]">
                {isOwner ? 'Owner Leadership Dashboard' : 'Employee Associate Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-[#666666] max-w-2xl">
                {isOwner
                  ? 'Manage your network sales, supervise assigned employees, track 1% override commissions and scale your Hellobee organization.'
                  : 'Track your personal $1,500 ionizer sales, monitor 10% direct commissions ($150/unit), and advance through ranks 1A to 5A.'}
              </p>
            </div>

            {/* Persona Switcher for Live Demo */}
            <div className="bg-[#F5F4F0] p-3 rounded-xs border border-[#E5E5E5] text-xs space-y-2">
              <span className="text-[#777777] font-semibold uppercase tracking-wider block text-[10px]">
                Simulate Demo Account Persona:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMemberId(m.id)}
                    className={`px-3 py-1.5 rounded-xs font-medium text-xs uppercase tracking-wider transition-all ${
                      m.id === currentMember?.id
                        ? 'bg-[#111111] text-white shadow-xs font-semibold'
                        : 'bg-white text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F5] border border-[#E0E0E0]'
                    }`}
                  >
                    <span>{m.name.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-75 ml-1">({m.role === 'OWNER' ? 'Owner' : m.rank})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xs uppercase tracking-wider text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'text-[#666666] hover:bg-[#F5F4F0] hover:text-[#111111]'
              }`}
            >
              Overview Dashboard
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('team')}
                className={`px-4 py-2 rounded-xs uppercase tracking-wider text-xs transition-all ${
                  activeTab === 'team'
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'text-[#666666] hover:bg-[#F5F4F0] hover:text-[#111111]'
                }`}
              >
                Team Employees ({teamEmployees.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-4 py-2 rounded-xs uppercase tracking-wider text-xs transition-all ${
                activeTab === 'commissions'
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'text-[#666666] hover:bg-[#F5F4F0] hover:text-[#111111]'
              }`}
            >
              Commissions Ledger ({memberCommissions.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-xs uppercase tracking-wider text-xs transition-all ${
                activeTab === 'payouts'
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'text-[#666666] hover:bg-[#F5F4F0] hover:text-[#111111]'
              }`}
            >
              Payouts & Withdrawals
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-xs uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'border border-[#E5E5E5] text-[#111111] bg-white hover:bg-[#F5F4F0]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Member Profile & Quick Referral Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E5E5E5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-lg text-amber-800">
                  {currentMember?.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-[#111111]">{currentMember?.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111111] text-white uppercase">
                      {currentMember?.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Rank {currentMember?.rank}
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] mt-0.5">
                    {currentMember?.email} • Member since {new Date(currentMember?.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Referral Code & Share CTA */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="px-3.5 py-2 rounded-xs bg-[#F5F4F0] border border-[#E0E0E0] font-mono text-xs font-bold text-[#111111] flex items-center gap-2">
                  <span className="text-[#777777] font-normal text-[10px]">MY CODE:</span>
                  <span className="tracking-wider">{currentMember?.referralCode}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  className="px-4 py-2 border border-[#111111] bg-white text-[#111111] hover:bg-[#F5F4F0] font-semibold rounded-xs text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copiedCode ? <CheckCircle className="w-3.5 h-3.5 text-[#2D5A27]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Link!' : 'Copy Referral Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateSale}
                  className="px-4 py-2 bg-[#111111] hover:bg-[#262626] text-white font-semibold rounded-xs text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
                  title="Simulate a $1,500 Hellobee machine sale using this member's referral code"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#B9A58B]" />
                  <span>Simulate $1,500 Sale</span>
                </button>
              </div>
            </div>

            {/* Rank Progression Bar (for Employees and Ranks 1A-4A) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Rank Advancement Ladder (1A → 5A)
                  </span>
                  <h3 className="text-base font-semibold text-[#111111]">
                    Current Rank: <span className="text-amber-600 font-bold">{currentMember?.rank}</span>
                    {rankProgress.nextRank !== 'MAX' ? (
                      <span className="text-sm font-normal text-[#666666] ml-2">
                        • Next Target: <span className="font-semibold text-[#111111]">{rankProgress.nextRank}</span> ({rankProgress.current}/{rankProgress.required} orders)
                      </span>
                    ) : (
                      <span className="text-sm font-normal text-emerald-600 ml-2">
                        • Highest Rank Achieved!
                      </span>
                    )}
                  </h3>
                </div>

                <span className="text-sm font-bold text-amber-700 font-mono">
                  {rankProgress.percent}% Completed
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#EEEEEE] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${rankProgress.percent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#888888] pt-1">
                <span>1A (Base)</span>
                <span>2A (5 Orders)</span>
                <span>3A (25 Orders)</span>
                <span>4A (125 Orders)</span>
                <span>5A (625 Orders)</span>
              </div>
            </div>

            {/* Core KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  {isOwner ? 'Network Gross Sales' : 'Personal Sales Volume'}
                </span>
                <p className="text-2xl font-light text-[#111111] mt-1.5 font-mono">
                  ${(isOwner ? currentMember?.networkSalesVolume : currentMember?.personalSalesVolume || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#888888] mt-1">
                  {isOwner ? 'Cumulative sales from all team associates' : 'Direct sales credited to your code'}
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  Valid Device Orders
                </span>
                <p className="text-2xl font-light text-[#111111] mt-1.5 font-mono">
                  {currentMember?.validOrdersCount} Orders
                </p>
                <p className="text-[10px] text-[#888888] mt-1">
                  Qualifying $1,500 unit sales counting towards rank
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  Total Commissions Earned
                </span>
                <p className="text-2xl font-light text-emerald-700 mt-1.5 font-mono">
                  ${(currentMember?.totalCommissionEarned || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#888888] mt-1">
                  {isOwner ? 'Combined 10% direct + 1% invoice overrides' : '10% direct commission ($150 per unit)'}
                </p>
              </div>

              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <p className="text-2xl font-semibold text-[#111111] mt-1.5 font-mono">
                    ${(currentMember?.availableBalance || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={(currentMember?.availableBalance || 0) <= 0}
                  className="mt-3 w-full py-2.5 bg-[#111111] hover:bg-[#262626] text-white rounded-xs text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Request Payout
                </button>
              </div>
            </div>

            {/* Recent Commission Transactions Feed */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
                <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                  Recent Commission Earnings
                </h3>
                <span className="text-xs text-[#888888]">
                  Showing last {Math.min(5, memberCommissions.length)} transactions
                </span>
              </div>

              {memberCommissions.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#888888]">
                  No commissions logged yet. Share your referral code or click "Simulate $1,500 Sale" to generate earnings.
                </div>
              ) : (
                <div className="divide-y divide-[#EEEEEE] text-xs">
                  {memberCommissions.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#111111]">{c.orderNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.commissionType === 'DIRECT_10_PERCENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.commissionType === 'DIRECT_10_PERCENT' ? '10% Direct' : '1% Owner Override'}
                          </span>
                        </div>
                        <p className="text-[#777777] mt-0.5">
                          Buyer: {c.buyerName} • Order Total: ${c.orderAmount.toLocaleString()} • {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-emerald-700 font-mono">
                          +${c.amount.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium">Approved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEAM EMPLOYEES TAB (OWNER ONLY) */}
        {activeTab === 'team' && isOwner && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
              <div>
                <h2 className="text-lg font-medium text-[#111111]">Managed Team Employees</h2>
                <p className="text-xs text-[#666666]">
                  Sales associates directly supervised by {currentMember?.name}. Every sale generated by these employees earns you a 1% override on invoice total.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="px-3 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite New Employee</span>
              </button>
            </div>

            {teamEmployees.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#888888]">
                No employees registered under this Owner yet. Use "Invite New Employee" with your referral code {currentMember?.referralCode}.
              </div>
            ) : (
              <div className="border border-[#EEEEEE] rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 gap-2 p-3 bg-[#FAFAFA] font-semibold text-[#555555]">
                  <span className="col-span-3">Employee Name</span>
                  <span className="col-span-2">Referral Code</span>
                  <span className="col-span-1 text-center">Rank</span>
                  <span className="col-span-2 text-right">Valid Orders</span>
                  <span className="col-span-2 text-right">Sales Volume</span>
                  <span className="col-span-2 text-right">Your 1% Override</span>
                </div>

                <div className="divide-y divide-[#EEEEEE]">
                  {teamEmployees.map((emp) => {
                    const overrideEarned = Math.round(emp.personalSalesVolume * 0.01);
                    return (
                      <div key={emp.id} className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-[#FAFAFA]">
                        <div className="col-span-3">
                          <p className="font-semibold text-[#111111]">{emp.name}</p>
                          <p className="text-[10px] text-[#888888]">{emp.email}</p>
                        </div>

                        <div className="col-span-2 font-mono font-bold text-amber-800">
                          {emp.referralCode}
                        </div>

                        <div className="col-span-1 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                            {emp.rank}
                          </span>
                        </div>

                        <div className="col-span-2 text-right font-mono font-medium">
                          {emp.validOrdersCount}
                        </div>

                        <div className="col-span-2 text-right font-mono font-medium">
                          ${emp.personalSalesVolume.toLocaleString()}
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-emerald-700">
                          +${overrideEarned.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FULL COMMISSION LEDGER TAB */}
        {activeTab === 'commissions' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#EEEEEE]">
              <h2 className="text-lg font-medium text-[#111111]">Full Commission Ledger</h2>
              <p className="text-xs text-[#666666]">
                Itemized breakdown of all 10% direct commissions and 1% invoice override commissions.
              </p>
            </div>

            <div className="border border-[#EEEEEE] rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 p-3 bg-[#FAFAFA] font-semibold text-[#555555]">
                <span className="col-span-3">Date / Order #</span>
                <span className="col-span-2">Customer</span>
                <span className="col-span-3">Commission Type</span>
                <span className="col-span-2 text-right">Invoice Total</span>
                <span className="col-span-2 text-right">Commission</span>
              </div>

              <div className="divide-y divide-[#EEEEEE]">
                {memberCommissions.map((c) => (
                  <div key={c.id} className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-[#FAFAFA]">
                    <div className="col-span-3">
                      <p className="font-semibold text-[#111111]">{c.orderNumber}</p>
                      <p className="text-[10px] text-[#888888]">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="col-span-2 text-[#444444] font-medium">{c.buyerName}</div>

                    <div className="col-span-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.commissionType === 'DIRECT_10_PERCENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.commissionType === 'DIRECT_10_PERCENT' ? '10% Direct ($150)' : '1% Owner Override ($15)'}
                      </span>
                    </div>

                    <div className="col-span-2 text-right font-mono font-medium">
                      ${c.orderAmount.toLocaleString()}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-emerald-700">
                      +${c.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === 'payouts' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
              <div>
                <h2 className="text-lg font-medium text-[#111111]">Withdrawal & Payout Ledger</h2>
                <p className="text-xs text-[#666666]">
                  Available Balance: <span className="font-bold text-emerald-700">${(currentMember?.availableBalance || 0).toLocaleString()}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={(currentMember?.availableBalance || 0) <= 0}
                className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Request Payout
              </button>
            </div>

            {memberPayouts.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#888888]">
                No withdrawal requests on record.
              </div>
            ) : (
              <div className="border border-[#EEEEEE] rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 gap-2 p-3 bg-[#FAFAFA] font-semibold text-[#555555]">
                  <span className="col-span-3">Request Date</span>
                  <span className="col-span-3">Bank Details</span>
                  <span className="col-span-2">Account Name</span>
                  <span className="col-span-2 text-right">Amount</span>
                  <span className="col-span-2 text-center">Status</span>
                </div>

                <div className="divide-y divide-[#EEEEEE]">
                  {memberPayouts.map((p) => (
                    <div key={p.id} className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-[#FAFAFA]">
                      <div className="col-span-3">
                        <p className="font-medium text-[#111111]">{new Date(p.requestedAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-[#888888]">ID: {p.id}</p>
                      </div>

                      <div className="col-span-3">
                        <p className="font-medium text-[#111111]">{p.bankName}</p>
                        <p className="text-[10px] font-mono text-[#888888]">{p.bankAccountNumber}</p>
                      </div>

                      <div className="col-span-2 uppercase font-medium">{p.bankAccountName}</div>

                      <div className="col-span-2 text-right font-mono font-bold text-[#111111]">
                        ${p.amount.toLocaleString()}
                      </div>

                      <div className="col-span-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* REGISTER NEW MEMBER TAB (FLOW 1 & 2) */}
        {activeTab === 'register' && (
          <div className="max-w-xl mx-auto bg-white p-7 sm:p-9 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#EEEEEE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Flow 1 & Flow 2 • Network Registration
              </span>
              <h2 className="text-xl font-medium text-[#111111]">Register New Hellobee Member</h2>
              <p className="text-xs text-[#666666] mt-1">
                Register as an Owner or Employee to receive an immutable referral code and start earning commissions.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#444444] mb-1">Select Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      regRole === 'EMPLOYEE'
                        ? 'border-amber-600 bg-amber-50/40 text-amber-900 font-bold'
                        : 'border-[#E0E0E0] bg-white text-[#666666]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={regRole === 'EMPLOYEE'}
                      onChange={() => setRegRole('EMPLOYEE')}
                      className="text-amber-600"
                    />
                    <div>
                      <p className="text-xs font-semibold">Employee Associate</p>
                      <p className="text-[10px] font-normal text-[#777777]">Earn 10% on $1,500 units</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      regRole === 'OWNER'
                        ? 'border-amber-600 bg-amber-50/40 text-amber-900 font-bold'
                        : 'border-[#E0E0E0] bg-white text-[#666666]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={regRole === 'OWNER'}
                      onChange={() => setRegRole('OWNER')}
                      className="text-amber-600"
                    />
                    <div>
                      <p className="text-xs font-semibold">Owner Manager</p>
                      <p className="text-[10px] font-normal text-[#777777]">Earn 1% on network invoice</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#444444] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rachel Green"
                  className="w-full p-2.5 rounded-lg border border-[#D5D5D5] outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#444444] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rachel@example.com"
                  className="w-full p-2.5 rounded-lg border border-[#D5D5D5] outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#444444] mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full p-2.5 rounded-lg border border-[#D5D5D5] outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#444444] mb-1">
                  Sponsor Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={regSponsorCode}
                  onChange={(e) => setRegSponsorCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HB-OWNER-01"
                  className="w-full p-2.5 rounded-lg border border-[#D5D5D5] font-mono uppercase tracking-wider outline-hidden focus:border-[#111111]"
                />
                <p className="text-[10px] text-[#888888] mt-1">
                  Linking an Employee to an Owner automatically entitles that Owner to 1% invoice overrides.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#111111] hover:bg-[#262626] text-white font-semibold rounded-xs uppercase tracking-wider transition-all shadow-xs mt-4 text-xs"
              >
                Create Account & Generate Referral Code
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E5E5E5] text-xs animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#EEEEEE]">
              <h3 className="text-base font-semibold text-[#111111]">Request Commission Payout</h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayoutSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Available Balance</label>
                <p className="text-lg font-bold text-emerald-700 font-mono">
                  ${(currentMember?.availableBalance || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Payout Amount ($ USD) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={currentMember?.availableBalance || 0}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 border rounded-lg outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Chase Bank NA"
                  className="w-full p-2.5 border rounded-lg outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full p-2.5 border rounded-lg font-mono outline-hidden focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Beneficiary Account Name *</label>
                <input
                  type="text"
                  required
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder={currentMember?.name || 'Full Name on Account'}
                  className="w-full p-2.5 border rounded-lg uppercase outline-hidden focus:border-[#111111]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] rounded-xs text-xs uppercase tracking-wider text-[#737373] hover:text-[#111111] hover:bg-[#F5F4F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#111111] text-white rounded-xs text-xs uppercase tracking-wider font-semibold hover:bg-[#262626] transition-colors"
                >
                  Submit Withdrawal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HellobeePortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-xs text-[#737373]">Loading Hellobee Portal...</div>}>
      <HellobeePortalContent />
    </Suspense>
  );
}

