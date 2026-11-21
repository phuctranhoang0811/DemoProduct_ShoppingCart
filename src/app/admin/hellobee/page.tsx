'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Building2,
  UserCheck,
  Eye,
  X,
  Network,
  ArrowDownRight,
  Cpu,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  ShoppingBag,
} from 'lucide-react';
import { decidePayout } from '@/lib/hellobee-client';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { NetworkTree } from '@/components/hellobee/NetworkTree';
import {
  HellobeeMember,
  LvRankLevel,
  LV_RANKS,
  PayoutStatus,
  commissionLabel,
  getTeamStats,
  getMemberLvLevel,
  LADDER_RANKS,
  LADDER_NAMES,
} from '@/types/hellobee';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

function getDownlineList(
  rootId: string,
  members: HellobeeMember[]
): { member: HellobeeMember; generation: number; sponsorName: string }[] {
  const result: { member: HellobeeMember; generation: number; sponsorName: string }[] = [];
  const byId = new Map(members.map((m) => [m.id, m]));
  let frontier = [rootId];
  const seen = new Set([rootId]);
  let gen = 1;

  while (frontier.length && gen <= 10) {
    const next = members.filter(
      (m) => m.referredById && frontier.includes(m.referredById) && !seen.has(m.id)
    );
    if (!next.length) break;
    next.forEach((m) => {
      seen.add(m.id);
      const sponsor = m.referredById ? byId.get(m.referredById) : undefined;
      result.push({
        member: m,
        generation: gen,
        sponsorName: sponsor ? `${sponsor.name} (${sponsor.referralCode})` : '—',
      });
    });
    frontier = next.map((m) => m.id);
    gen++;
  }
  return result;
}

export default function AdminHellobeePage() {
  const members = useCommerceStore((state) => state.hellobeeMembers);
  const commissions = useCommerceStore((state) => state.commissions);
  const payouts = useCommerceStore((state) => state.payouts);
  const orders = useCommerceStore((state) => state.orders);
  const customers = useCommerceStore((state) => state.customers);

  const [searchQuery, setSearchQuery] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'EMPLOYEE'>('ALL');
  const [rankFilter, setRankFilter] = useState<'ALL' | LvRankLevel>('ALL');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<'ALL' | PayoutStatus>('ALL');
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'TREE' | 'COMMISSIONS' | 'PAYOUTS'>('MEMBERS');

  // Financial & Network KPI Calculations
  const totalOwners = members.filter((m) => m.role === 'OWNER').length;
  const totalEmployees = members.filter((m) => m.role === 'EMPLOYEE').length;

  const financialStats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    let machineInflow = 0;
    let machineUnits = 0;

    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        machineInflow += it.price * it.quantity;
        machineUnits += it.quantity;
      });
    });

    const orderRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const memberVolume = members.reduce((sum, m) => sum + m.personalSalesVolume, 0);
    const totalMachineInflow = machineInflow > 0 ? machineInflow : Math.max(orderRevenue, memberVolume);
    const totalGrossRevenue = Math.max(orderRevenue, totalMachineInflow);

    const employeeTxTotal = commissions
      .filter((c) => c.beneficiaryRole === 'EMPLOYEE' && c.status !== 'REVOKED')
      .reduce((sum, c) => sum + c.amount, 0);
    const employeeMemberTotal = members
      .filter((m) => m.role === 'EMPLOYEE')
      .reduce((sum, m) => sum + m.totalCommissionEarned, 0);
    const totalEmployeeEarnings = Math.max(employeeTxTotal, employeeMemberTotal);

    const ownerTxTotal = commissions
      .filter((c) => c.beneficiaryRole === 'OWNER' && c.status !== 'REVOKED')
      .reduce((sum, c) => sum + c.amount, 0);
    const ownerMemberTotal = members
      .filter((m) => m.role === 'OWNER')
      .reduce((sum, m) => sum + m.totalCommissionEarned, 0);
    const totalOwnerCommissions = Math.max(ownerTxTotal, ownerMemberTotal);

    const netCompanyRetained = Math.max(0, totalGrossRevenue - totalEmployeeEarnings - totalOwnerCommissions);
    const totalOwnerFunds = totalOwnerCommissions + netCompanyRetained;

    return {
      totalMachineInflow,
      machineUnits: machineUnits || members.reduce((sum, m) => sum + m.validOrdersCount, 0),
      totalGrossRevenue,
      totalEmployeeEarnings,
      totalOwnerCommissions,
      netCompanyRetained,
      totalOwnerFunds,
    };
  }, [orders, members, commissions]);

  const pendingPayouts = payouts.filter((p) => p.status === 'PENDING');
  const pendingPayoutTotal = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  // Employee lookup by referral code or explicit selection
  const inspectedMember = useMemo(() => {
    if (selectedMemberId) {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) return found;
    }
    const q = lookupCode.trim().toUpperCase();
    if (!q) return null;
    return (
      members.find((m) => m.referralCode.toUpperCase() === q) ||
      members.find(
        (m) =>
          m.referralCode.toUpperCase().includes(q) ||
          m.email.toUpperCase() === q ||
          m.name.toUpperCase().includes(q)
      ) ||
      null
    );
  }, [members, selectedMemberId, lookupCode]);

  // Downline & subtree for the inspected member
  const inspectedDownline = useMemo(() => {
    if (!inspectedMember) return [];
    return getDownlineList(inspectedMember.id, members);
  }, [inspectedMember, members]);

  const inspectedSubtreeMembers = useMemo(() => {
    if (!inspectedMember) return [];
    const rootAsTop: HellobeeMember = { ...inspectedMember, referredById: null };
    return [rootAsTop, ...inspectedDownline.map((d) => d.member)];
  }, [inspectedMember, inspectedDownline]);

  // Income history (money inflow sources) for the inspected member
  const inspectedCommissions = useMemo(() => {
    if (!inspectedMember) return [];
    return commissions.filter((c) => c.beneficiaryId === inspectedMember.id);
  }, [inspectedMember, commissions]);

  // Referred customers & orders for the inspected member
  const inspectedOrders = useMemo(() => {
    if (!inspectedMember) return [];
    return orders.filter(
      (o) => o.referralCode?.toUpperCase() === inspectedMember.referralCode.toUpperCase()
    );
  }, [inspectedMember, orders]);

  const inspectedClients = useMemo(() => {
    if (!inspectedMember) return [];
    return customers.filter(
      (c) => c.referralCode?.toUpperCase() === inspectedMember.referralCode.toUpperCase()
    );
  }, [inspectedMember, customers]);

  // Filtered Members for table
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const memberLvRank = `LV${getMemberLvLevel(m, members)}` as LvRankLevel;
    const matchesRank = rankFilter === 'ALL' || memberLvRank === rankFilter;
    return matchesSearch && matchesRole && matchesRank;
  });

  // Filtered Payouts
  const filteredPayouts = payouts.filter((p) => {
    return payoutStatusFilter === 'ALL' || p.status === payoutStatusFilter;
  });

  const handleUpdatePayout = async (id: string, status: PayoutStatus) => {
    const result = await decidePayout(id, status);
    if (!result.ok) {
      toast.error(result.message || 'Could not update the payout.');
      return;
    }
    toast.success(`Payout ${id} updated to ${status}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B9A58B]">
              Employees &amp; Multi-Tier Affiliate Network
            </span>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-[#111111] text-white">
              LV1 – LV10 Model
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Employees, Network Tree &amp; Financial Ledger
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Search employees by referral code to inspect their profile, downline network tree, who works under them, and income source history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hellobee"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#111111] text-xs font-medium uppercase tracking-wider text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
          >
            <span>Live Member Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Admin Financial & Revenue Allocation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Machine Sales Inflow</span>
            <Cpu className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111]">
            {formatPrice(financialStats.totalMachineInflow)}
          </div>
          <div className="text-xs text-[#737373] mt-1">
            {financialStats.machineUnits} machine unit{financialStats.machineUnits === 1 ? '' : 's'} sold
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Total Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#111111]">
            {formatPrice(financialStats.totalGrossRevenue)}
          </div>
          <div className="text-xs text-[#737373] mt-1">
            100% gross store &amp; network revenue
          </div>
        </div>

        <div className="bg-[#EBF3EA]/50 border border-[#2D5A27]/30 p-5">
          <div className="flex items-center justify-between text-[#2D5A27] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Employee Earnings</span>
            <UserCheck className="w-4 h-4 text-[#2D5A27]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#2D5A27]">
            {formatPrice(financialStats.totalEmployeeEarnings)}
          </div>
          <div className="text-xs text-[#2D5A27]/90 mt-1">
            10% direct + 1% upline ({totalEmployees} employee{totalEmployees === 1 ? '' : 's'})
          </div>
        </div>

        <div className="bg-[#111111] text-white border border-[#111111] p-5">
          <div className="flex items-center justify-between text-[#B9A58B] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Owner Funds &amp; Share</span>
            <Building2 className="w-4 h-4 text-[#B9A58B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatPrice(financialStats.totalOwnerFunds)}
          </div>
          <div className="text-[11px] text-[#CCCCCC] mt-1">
            Commissions ({formatPrice(financialStats.totalOwnerCommissions)}) + Net ({formatPrice(financialStats.netCompanyRetained)})
          </div>
        </div>
      </div>

      {/* EMPLOYEE LOOKUP BY REFERRAL CODE */}
      <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#2D5A27]">
              Employee &amp; Referral Code Inspector
            </span>
            <h2 className="text-base font-semibold text-[#111111]">
              Search Employee by Referral Code
            </h2>
            <p className="text-xs text-[#737373]">
              Enter a referral code (e.g. <span className="font-mono font-semibold text-[#111111]">HBEE03</span> or{' '}
              <span className="font-mono font-semibold text-[#111111]">HBEE01</span>) to view full profile, network tree, downline staff, and money inflow history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#737373] text-[11px]">Quick Select Code:</span>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setLookupCode(m.referralCode);
                  setSelectedMemberId(m.id);
                }}
                className={`px-2.5 py-1 font-mono text-xs font-semibold border transition-colors ${
                  inspectedMember?.id === m.id
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#FAF9F5] text-[#111111] border-[#E5E5E5] hover:border-[#111111]'
                }`}
              >
                {m.referralCode} ({m.name.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="relative max-w-xl">
          <KeyRound className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={lookupCode}
            onChange={(e) => {
              setLookupCode(e.target.value);
              setSelectedMemberId(null);
            }}
            placeholder="Enter employee referral code (e.g. HBEE03, HBEE01) or name..."
            className="w-full bg-[#F5F4F0] pl-10 pr-9 py-2.5 text-sm font-mono text-[#111111] outline-none border border-transparent focus:border-[#111111] focus:bg-white transition-colors"
          />
          {(lookupCode || selectedMemberId) && (
            <button
              type="button"
              onClick={() => {
                setLookupCode('');
                setSelectedMemberId(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#111111]"
              aria-label="Clear lookup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {lookupCode.trim() && !inspectedMember && (
          <div className="p-4 bg-[#FEF3F2] border border-[#B74747]/30 text-xs text-[#B74747]">
            No employee or owner found matching referral code &ldquo;{lookupCode}&rdquo;.
          </div>
        )}

        {/* INSPECTED EMPLOYEE FULL PROFILE, NETWORK TREE, DOWNLINE & INCOME HISTORY */}
        {inspectedMember && (() => {
          const team = getTeamStats(inspectedMember.id, members);
          const lvLevel = getMemberLvLevel(inspectedMember, members);
          const ladder = LADDER_RANKS.find((r) => r.level === lvLevel);
          const directSponsor = inspectedMember.referredById
            ? members.find((m) => m.id === inspectedMember.referredById)
            : null;
          const topOwner = inspectedMember.ownerId
            ? members.find((m) => m.id === inspectedMember.ownerId)
            : null;

          return (
            <div className="border-2 border-[#111111] bg-[#FBFBFA] p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
              {/* 1. Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#111111] text-white font-mono text-xs font-bold">
                      Code: {inspectedMember.referralCode}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                        inspectedMember.role === 'OWNER'
                          ? 'bg-[#B9A58B] text-[#111111]'
                          : 'bg-[#EBF3EA] text-[#2D5A27]'
                      }`}
                    >
                      {inspectedMember.role}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-[#E5E5E5] font-mono text-xs font-bold text-[#111111]">
                      LV{lvLevel} &bull; {LADDER_NAMES[lvLevel - 1]} (Rank {inspectedMember.rank})
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#111111] pt-1">
                    {inspectedMember.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666]">
                    <span className="inline-flex items-center gap-1 font-medium text-[#111111]">
                      <Mail className="w-3.5 h-3.5" /> {inspectedMember.email}
                    </span>
                    {inspectedMember.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {inspectedMember.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(inspectedMember.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#555555] pt-1">
                    <span>
                      <strong>Direct Upline / Sponsor:</strong>{' '}
                      {directSponsor ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLookupCode(directSponsor.referralCode);
                            setSelectedMemberId(directSponsor.id);
                          }}
                          className="underline font-medium text-[#111111] hover:text-[#2D5A27]"
                        >
                          {directSponsor.name} ({directSponsor.referralCode})
                        </button>
                      ) : (
                        'Top Root Node (Independent)'
                      )}
                    </span>
                    {topOwner && (
                      <span>
                        <strong>Supervising Owner:</strong> {topOwner.name} ({topOwner.referralCode})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLookupCode('');
                    setSelectedMemberId(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] text-xs uppercase font-semibold text-[#555555] hover:border-[#111111] hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" /> Close Profile
                </button>
              </div>

              {/* Profile KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Personal Sales
                  </span>
                  <p className="text-lg font-bold font-mono text-[#111111] mt-1">
                    {formatPrice(inspectedMember.personalSalesVolume)}
                  </p>
                  <span className="text-[10px] text-[#737373]">
                    {inspectedMember.validOrdersCount} direct unit{inspectedMember.validOrdersCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Network Volume
                  </span>
                  <p className="text-lg font-bold font-mono text-[#111111] mt-1">
                    {formatPrice(inspectedMember.networkSalesVolume)}
                  </p>
                  <span className="text-[10px] text-[#737373]">Personal + team volume</span>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Total Earned
                  </span>
                  <p className="text-lg font-bold font-mono text-[#2D5A27] mt-1">
                    {formatPrice(inspectedMember.totalCommissionEarned)}
                  </p>
                  <span className="text-[10px] text-[#737373]">
                    {inspectedCommissions.length} commission record{inspectedCommissions.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Available Wallet
                  </span>
                  <p className="text-lg font-bold font-mono text-[#111111] mt-1">
                    {formatPrice(inspectedMember.availableBalance)}
                  </p>
                  <span className="text-[10px] text-[#737373]">Ready for payout</span>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Downline Staff
                  </span>
                  <p className="text-lg font-bold font-mono text-[#111111] mt-1">
                    {team.directCount} Direct / {team.teamSize} Team
                  </p>
                  <span className="text-[10px] text-[#737373]">
                    +{inspectedClients.length} registered client{inspectedClients.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                    Monthly Salary
                  </span>
                  <p className="text-lg font-bold font-mono text-[#2D5A27] mt-1">
                    {formatPrice(ladder?.monthlySalary ?? 0)}
                  </p>
                  <span className="text-[10px] text-[#737373]">LV{lvLevel} fixed tier</span>
                </div>
              </div>

              {/* 2. Sub-Network Tree for this Member */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#111111] flex items-center gap-1.5">
                      <Network className="w-4 h-4 text-[#2D5A27]" />
                      Network Tree for {inspectedMember.name} ({inspectedMember.referralCode})
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Interactive hierarchy showing {inspectedMember.name} at the root and every member working underneath.
                    </p>
                  </div>
                </div>
                <NetworkTree
                  members={inspectedSubtreeMembers}
                  currentMemberId={inspectedMember.id}
                />
              </div>

              {/* 3. Who Is Working Under This Employee (Subordinates + Registered Clients) */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#111111] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#111111]" />
                    Who Is Working Under {inspectedMember.name} ({inspectedDownline.length} Downline Staff &bull; {inspectedClients.length} Referred Customers)
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    All subordinate employees/associates in their downline organization and customers registered with code {inspectedMember.referralCode}.
                  </p>
                </div>

                {inspectedDownline.length > 0 ? (
                  <div className="overflow-x-auto border border-[#E5E5E5]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Level</th>
                          <th className="py-2.5 px-3">Subordinate Member</th>
                          <th className="py-2.5 px-3">Referral Code</th>
                          <th className="py-2.5 px-3">Introduced By</th>
                          <th className="py-2.5 px-3 text-right">Units Sold</th>
                          <th className="py-2.5 px-3 text-right">Sales Volume</th>
                          <th className="py-2.5 px-3 text-right">Their Earnings</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {inspectedDownline.map(({ member: sub, generation, sponsorName }) => (
                          <tr key={sub.id} className="hover:bg-[#FBFBFA]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#2D5A27]">
                              Gen {generation} ({generation === 1 ? 'Direct' : 'Downline'})
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#111111]">{sub.name}</div>
                              <div className="text-[11px] text-[#737373]">{sub.email}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#111111]">
                              {sub.referralCode}
                            </td>
                            <td className="py-2.5 px-3 text-[#666666]">{sponsorName}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold">
                              {sub.validOrdersCount}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatPrice(sub.personalSalesVolume)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#2D5A27] font-semibold">
                              {formatPrice(sub.totalCommissionEarned)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setLookupCode(sub.referralCode);
                                  setSelectedMemberId(sub.id);
                                }}
                                className="px-2.5 py-1 bg-[#111111] text-white text-[10px] uppercase font-semibold hover:bg-[#333333]"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5] text-xs text-[#737373]">
                    No subordinate employees are currently registered under {inspectedMember.name} ({inspectedMember.referralCode}).
                  </div>
                )}

                {inspectedClients.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
                      Customers Assigned to {inspectedMember.referralCode} ({inspectedClients.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inspectedClients.map((client) => (
                        <div key={client.id} className="p-3 border border-[#E5E5E5] bg-[#FAF9F5] text-xs flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#111111]">{client.name}</p>
                            <p className="text-[11px] text-[#666666]">{client.email}</p>
                            <p className="text-[10px] text-[#777777]">{client.phone}</p>
                          </div>
                          <Link
                            href="/admin/customers"
                            className="text-[10px] font-semibold uppercase underline text-[#111111]"
                          >
                            Customer &rarr;
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Money Inflow & Commission Source Ledger for This Employee */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#111111] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#2D5A27]" />
                      Income &amp; Money Inflow History for {inspectedMember.name} ({inspectedCommissions.length} Transactions)
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Exact origin of every commission dollar: order number, buyer name, sale amount, commission type (10% direct / 1% downline override / rank bonus), and notes.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#737373] block">
                      Total Inflow Credited
                    </span>
                    <span className="text-base font-bold font-mono text-[#2D5A27]">
                      +{formatPrice(inspectedCommissions.reduce((sum, c) => sum + c.amount, 0))}
                    </span>
                  </div>
                </div>

                {inspectedCommissions.length > 0 ? (
                  <div className="overflow-x-auto border border-[#E5E5E5]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Source / Buyer</th>
                          <th className="py-2.5 px-3">Order #</th>
                          <th className="py-2.5 px-3">Inflow Type</th>
                          <th className="py-2.5 px-3">Origin Details</th>
                          <th className="py-2.5 px-3 text-right">Order Value</th>
                          <th className="py-2.5 px-3 text-right">Rate</th>
                          <th className="py-2.5 px-3 text-right">Money Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {inspectedCommissions.map((c) => (
                          <tr key={c.id} className="hover:bg-[#FBFBFA]">
                            <td className="py-2.5 px-3 text-[#737373] whitespace-nowrap">
                              {formatDate(c.createdAt)}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#111111]">
                              {c.buyerName || 'Network Milestone'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#111111]">
                              {c.orderNumber || '—'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  c.commissionType === 'DIRECT_10_PERCENT'
                                    ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                    : 'bg-[#FAF1E4] text-[#8C5E1E]'
                                }`}
                              >
                                {commissionLabel(c)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#555555]">{c.notes}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {c.orderAmount > 0 ? formatPrice(c.orderAmount) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {c.rate > 0 ? `${(c.rate * 100).toFixed(0)}%` : 'Bonus'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2D5A27]">
                              +{formatPrice(c.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5] text-xs text-[#737373]">
                    No commission inflow transactions recorded for {inspectedMember.name} ({inspectedMember.referralCode}) yet. When a customer places an order using code <strong>{inspectedMember.referralCode}</strong> or a downline member makes a sale, the exact source and amount appear here automatically.
                  </div>
                )}

                {inspectedOrders.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#555555] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> Direct Orders Credited to Referral Code {inspectedMember.referralCode} ({inspectedOrders.length})
                    </p>
                    <div className="overflow-x-auto border border-[#E5E5E5]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Order ID</th>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Customer</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3 text-right">Order Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                          {inspectedOrders.map((ord) => (
                            <tr key={ord.id}>
                              <td className="py-2 px-3 font-mono font-semibold">{ord.id}</td>
                              <td className="py-2 px-3 text-[#737373]">{formatDate(ord.createdAt)}</td>
                              <td className="py-2 px-3">{ord.customerName} ({ord.customerEmail})</td>
                              <td className="py-2 px-3">{ord.status}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold">{formatPrice(ord.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E5E5] gap-8">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`pb-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors ${
            activeTab === 'MEMBERS'
              ? 'border-[#111111] text-[#111111] font-semibold'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Employees &amp; Hierarchy ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('TREE')}
          className={`pb-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors ${
            activeTab === 'TREE'
              ? 'border-[#111111] text-[#111111] font-semibold'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Full Network Tree
        </button>
        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`pb-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors ${
            activeTab === 'COMMISSIONS'
              ? 'border-[#111111] text-[#111111] font-semibold'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Commission Ledger ({commissions.length})
        </button>
        <button
          onClick={() => setActiveTab('PAYOUTS')}
          className={`pb-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'PAYOUTS'
              ? 'border-[#111111] text-[#111111] font-semibold'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          <span>Payout Requests</span>
          {pendingPayouts.length > 0 && (
            <span className="bg-[#111111] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {pendingPayouts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB: NETWORK TREE */}
      {activeTab === 'TREE' && <NetworkTree members={members} />}

      {/* TAB 1: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Filter table by referral code, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 text-xs">
                <span className="text-[#999999] px-2 text-[11px] uppercase tracking-wider">Role:</span>
                {(['ALL', 'OWNER', 'EMPLOYEE'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium ${
                      roleFilter === r ? 'bg-[#111111] text-white' : 'text-[#737373] hover:text-[#111111]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 text-xs flex-wrap">
                <span className="text-[#999999] px-2 text-[11px] uppercase tracking-wider">Rank:</span>
                {(['ALL', ...LV_RANKS] as const).map((rk) => (
                  <button
                    key={rk}
                    onClick={() => setRankFilter(rk)}
                    className={`px-2 py-1 text-[11px] font-mono font-medium ${
                      rankFilter === rk ? 'bg-[#111111] text-white' : 'text-[#737373] hover:text-[#111111]'
                    }`}
                  >
                    {rk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 font-medium">Employee / Member</th>
                  <th className="py-3 px-3 font-medium">Role</th>
                  <th className="py-3 px-3 font-medium">Rank</th>
                  <th className="py-3 px-3 font-medium">Referral Code</th>
                  <th className="py-3 px-3 font-medium">Direct Upline</th>
                  <th className="py-3 px-3 font-medium text-right">Downline (Direct / Team)</th>
                  <th className="py-3 px-3 font-medium text-right">Direct Units</th>
                  <th className="py-3 px-3 font-medium text-right">Sales Volume</th>
                  <th className="py-3 px-3 font-medium text-right">Total Earned</th>
                  <th className="py-3 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-[#737373]">
                      No members found matching the selected rank or filter.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const upline = m.referredById ? members.find((o) => o.id === m.referredById) : null;
                    const team = getTeamStats(m.id, members);
                    const lvLevel = getMemberLvLevel(m, members);
                    const isInspected = inspectedMember?.id === m.id;
                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors ${
                          isInspected ? 'bg-[#FAF8F5]' : 'hover:bg-[#FBFBFA]/80'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#111111]">{m.name}</div>
                          <div className="text-[11px] text-[#737373]">{m.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                              m.role === 'OWNER'
                                ? 'bg-[#111111] text-white'
                                : 'bg-[#F2EFE9] text-[#111111]'
                            }`}
                          >
                            {m.role === 'OWNER' ? (
                              <Building2 className="w-3 h-3 text-[#B9A58B]" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block font-mono font-bold text-xs px-2 py-0.5 bg-[#FAF8F5] border border-[#E5E5E5] text-[#111111]">
                            LV{lvLevel}
                          </span>
                          <div className="text-[10px] text-[#737373] mt-0.5 whitespace-nowrap">
                            {LADDER_NAMES[lvLevel - 1]}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                          {m.referralCode}
                        </td>
                        <td className="py-3 px-3 text-[#737373]">
                          {upline ? (
                            <div>
                              <div className="font-medium text-[#111111]">{upline.name}</div>
                              <div className="font-mono text-[10px]">{upline.referralCode}</div>
                            </div>
                          ) : (
                            <span className="text-[#999999] italic">— Root Node —</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {team.directCount} / {team.teamSize}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#111111]">
                          {m.validOrdersCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#111111]">
                          ${(m.role === 'OWNER' ? m.networkSalesVolume : m.personalSalesVolume).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#2D5A27]">
                          ${m.totalCommissionEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setLookupCode(m.referralCode);
                              setSelectedMemberId(m.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#111111] text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-[#333333]"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Profile &amp; Tree</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSIONS */}
      {activeTab === 'COMMISSIONS' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-medium">Tx ID</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Beneficiary</th>
                  <th className="py-3 px-4 font-medium">Source / Buyer</th>
                  <th className="py-3 px-4 font-medium">Commission Type</th>
                  <th className="py-3 px-4 font-medium">Order Number</th>
                  <th className="py-3 px-4 font-medium text-right">Sale Total</th>
                  <th className="py-3 px-4 font-medium text-right">Rate</th>
                  <th className="py-3 px-4 font-medium text-right">Commission</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#737373]">
                      No commission records yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => {
                    return (
                      <tr key={c.id} className="hover:bg-[#FBFBFA]/80">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">{c.id}</td>
                        <td className="py-3 px-4 text-[#737373]">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#111111]">{c.beneficiaryName}</div>
                          <div className="text-[10px] text-[#737373] uppercase tracking-wider">
                            {c.beneficiaryRole}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#111111]">{c.buyerName || '—'}</div>
                          <div className="text-[11px] text-[#737373]">{c.notes}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              c.commissionType === 'DIRECT_10_PERCENT'
                                ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                : 'bg-[#F2EFE9] text-[#737373]'
                            }`}
                          >
                            {commissionLabel(c)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">{c.orderNumber}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#111111]">
                          ${c.orderAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#111111]">
                          {(c.rate * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">
                          ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D5A27] uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUT REQUESTS */}
      {activeTab === 'PAYOUTS' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] p-1 text-xs w-fit">
            <span className="text-[#999999] px-2 text-[11px] uppercase tracking-wider">Status Filter:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setPayoutStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium ${
                  payoutStatusFilter === st ? 'bg-[#111111] text-white' : 'text-[#737373] hover:text-[#111111]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFA] border-b border-[#E5E5E5] text-[#737373] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-medium">Payout ID</th>
                  <th className="py-3 px-4 font-medium">Requested Date</th>
                  <th className="py-3 px-4 font-medium">Beneficiary</th>
                  <th className="py-3 px-4 font-medium">Disbursement Account</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#737373]">
                      No payout requests matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => {
                    return (
                      <tr key={p.id} className="hover:bg-[#FBFBFA]/80">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">{p.id}</td>
                        <td className="py-3 px-4 text-[#737373]">
                          {new Date(p.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#111111]">{p.memberName}</div>
                          <div className="text-[10px] text-[#737373] uppercase tracking-wider">{p.memberRole}</div>
                        </td>
                        <td className="py-3 px-4 text-[#737373] font-mono text-[11px]">
                          <div>{p.bankName}</div>
                          <div className="text-[#111111] font-medium">{p.bankAccountNumber} ({p.bankAccountName})</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">
                          ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              p.status === 'APPROVED'
                                ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                : p.status === 'PENDING'
                                ? 'bg-[#FEF6EE] text-[#B54708]'
                                : 'bg-[#FEF3F2] text-[#B74747]'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {p.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdatePayout(p.id, 'APPROVED')}
                                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#333333] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdatePayout(p.id, 'REJECTED')}
                                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border border-[#B74747] text-[#B74747] hover:bg-[#B74747] hover:text-white transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.status === 'APPROVED' && (
                            <span className="text-[11px] text-[#2D5A27] font-medium">Approved / Disbursed</span>
                          )}
                          {p.status === 'REJECTED' && (
                            <span className="text-[11px] text-[#B74747] font-medium">Declined</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
