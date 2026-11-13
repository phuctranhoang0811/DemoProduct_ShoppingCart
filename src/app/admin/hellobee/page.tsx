'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { RankLevel, PayoutStatus } from '@/types/hellobee';
import { toast } from 'sonner';

export default function AdminHellobeePage() {
  const members = useCommerceStore((state) => state.hellobeeMembers);
  const commissions = useCommerceStore((state) => state.commissions);
  const payouts = useCommerceStore((state) => state.payouts);
  const updatePayoutStatus = useCommerceStore((state) => state.updatePayoutStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'EMPLOYEE'>('ALL');
  const [rankFilter, setRankFilter] = useState<'ALL' | RankLevel>('ALL');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<'ALL' | PayoutStatus>('ALL');
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'COMMISSIONS' | 'PAYOUTS'>('MEMBERS');

  // KPI Calculations
  const totalOwners = members.filter((m) => m.role === 'OWNER').length;
  const totalEmployees = members.filter((m) => m.role === 'EMPLOYEE').length;
  const totalNetworkVolume = members.reduce(
    (sum, m) => sum + (m.role === 'OWNER' ? m.networkSalesVolume : m.personalSalesVolume),
    0
  );
  const totalCommissionsPaid = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingPayouts = payouts.filter((p) => p.status === 'PENDING');
  const pendingPayoutTotal = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  // Filtered Members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesRank = rankFilter === 'ALL' || m.rank === rankFilter;
    return matchesSearch && matchesRole && matchesRank;
  });

  // Filtered Payouts
  const filteredPayouts = payouts.filter((p) => {
    return payoutStatusFilter === 'ALL' || p.status === payoutStatusFilter;
  });

  const handleUpdatePayout = (id: string, status: PayoutStatus) => {
    updatePayoutStatus(id, status);
    toast.success(`Payout ${id} updated to ${status}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B9A58B]">
              Hellobee Multi-Tier Affiliate Network
            </span>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-[#111111] text-white">
              1A – 5A Model
            </span>
          </div>
          <h1 className="text-2xl font-serif text-[#111111]">Affiliate & Network Management</h1>
          <p className="text-sm text-[#737373] mt-1">
            Supervise Owner nodes, Employee referrals (10%), Owner overrides (1%), and payout approvals.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Network Members</span>
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">{members.length}</div>
          <div className="text-xs text-[#737373] mt-1.5 flex items-center gap-2">
            <span className="font-medium text-[#111111]">{totalOwners} Owners</span>
            <span>•</span>
            <span className="font-medium text-[#111111]">{totalEmployees} Employees</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Network Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            ${totalNetworkVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#737373] mt-1.5">
            ${(totalNetworkVolume / 1500).toFixed(0)} units @ $1,500/unit
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Commissions Incurred</span>
            <DollarSign className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            ${totalCommissionsPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#737373] mt-1.5">
            10% Direct + 1% Owner Invoices
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Pending Payouts</span>
            <Clock className="w-4 h-4 text-[#B9A58B]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            ${pendingPayoutTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#737373] mt-1.5">
            {pendingPayouts.length} request{pendingPayouts.length === 1 ? '' : 's'} awaiting review
          </div>
        </div>
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
          Members & Hierarchy ({members.length})
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

      {/* TAB 1: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Search name, email, code..."
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

              <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 text-xs">
                <span className="text-[#999999] px-2 text-[11px] uppercase tracking-wider">Rank:</span>
                {(['ALL', '1A', '2A', '3A', '4A', '5A'] as const).map((rk) => (
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
                  <th className="py-3 px-4 font-medium">Member</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Rank</th>
                  <th className="py-3 px-4 font-medium">Referral Code</th>
                  <th className="py-3 px-4 font-medium">Supervisor (Owner)</th>
                  <th className="py-3 px-4 font-medium text-right">Direct Units</th>
                  <th className="py-3 px-4 font-medium text-right">Sales Volume</th>
                  <th className="py-3 px-4 font-medium text-right">Available Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredMembers.map((m) => {
                  const supervisor = m.ownerId ? members.find((o) => o.id === m.ownerId) : null;
                  return (
                    <tr key={m.id} className="hover:bg-[#FBFBFA]/80">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#111111]">{m.name}</div>
                        <div className="text-[11px] text-[#737373]">{m.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-[#FAF8F5] border border-[#E5E5E5] text-[#111111]">
                          {m.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#111111]">
                        {m.referralCode}
                      </td>
                      <td className="py-3.5 px-4 text-[#737373]">
                        {supervisor ? (
                          <div className="font-medium text-[#111111]">{supervisor.name}</div>
                        ) : (
                          <span className="text-[#999999] italic">— Independent Node —</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#111111]">
                        {m.validOrdersCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#111111]">
                        ${(m.role === 'OWNER' ? m.networkSalesVolume : m.personalSalesVolume).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#2D5A27]">
                        ${m.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
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
                    <td colSpan={9} className="py-8 text-center text-[#737373]">
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
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              c.commissionType === 'DIRECT_10_PERCENT'
                                ? 'bg-[#EBF3EA] text-[#2D5A27]'
                                : 'bg-[#F2EFE9] text-[#737373]'
                            }`}
                          >
                            {c.commissionType === 'DIRECT_10_PERCENT'
                              ? '10% Direct Referral'
                              : '1% Owner Invoice Override'}
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
