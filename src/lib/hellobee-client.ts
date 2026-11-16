'use client';

import { useCommerceStore } from '@/stores/useCommerceStore';
import type { CommissionTransaction, HellobeeMember, PayoutRequest, PayoutStatus } from '@/types/hellobee';

// Network data and payouts. With a backend these go through the Next.js routes and the store is
// refreshed from the server afterwards; a 501 means local demo mode and the store acts alone.

const LOCAL_MODE = 501;

const isBackend = () => useCommerceStore.getState().authMode === 'backend';

/* eslint-disable @typescript-eslint/no-explicit-any */
function toMember(m: any): HellobeeMember {
  return {
    id: m.id,
    name: m.name,
    email: m.email ?? '',
    role: m.role,
    phone: m.phone ?? undefined,
    referralCode: m.referral_code,
    referredById: m.referred_by_id,
    ownerId: m.owner_id,
    rank: m.rank,
    validOrdersCount: m.valid_orders_count,
    personalSalesVolume: m.personal_sales_volume,
    networkSalesVolume: m.network_sales_volume,
    directInviteCount: m.direct_invite_count,
    totalCommissionEarned: m.total_commission_earned ?? 0,
    availableBalance: m.available_balance ?? 0,
    hasPurchasedFiltrationDevice: m.has_purchased_filtration_device,
    isActive: m.is_active,
    avatarUrl: m.avatar_url ?? undefined,
    createdAt: m.created_at,
  };
}

function toCommission(c: any): CommissionTransaction {
  return {
    id: c.id,
    orderId: c.order_number,
    orderNumber: c.order_number,
    orderAmount: c.order_amount,
    buyerName: c.buyer_name,
    beneficiaryId: c.beneficiary_id,
    beneficiaryName: c.beneficiary_name,
    beneficiaryRole: c.beneficiary_role,
    commissionType: c.commission_type,
    rate: c.rate,
    amount: c.amount,
    status: c.status,
    notes: c.notes ?? '',
    createdAt: c.created_at,
  };
}

function toPayout(p: any): PayoutRequest {
  return {
    id: p.id,
    memberId: p.member_id,
    memberName: p.member_name,
    memberRole: p.member_role,
    amount: p.amount,
    bankName: p.bank_name,
    bankAccountNumber: p.bank_account_number,
    bankAccountName: p.bank_account_name,
    status: p.status,
    requestedAt: p.requested_at,
    processedAt: p.processed_at ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Replaces the demo network data in the store with what the server lets this user see.
export async function syncNetwork(): Promise<void> {
  try {
    const res = await fetch('/api/hellobee/network', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    const members: HellobeeMember[] = data.members.map(toMember);

    useCommerceStore.setState((state) => ({
      hellobeeMembers: members,
      commissions: data.commissions.map(toCommission),
      payouts: data.payouts.map(toPayout),
      activeMemberId: data.self_id ?? (members.some((m) => m.id === state.activeMemberId) ? state.activeMemberId : members[0]?.id ?? ''),
    }));
  } catch {
    // Keep what is cached when the backend cannot be reached.
  }
}

export interface PayoutInput {
  memberId: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export async function submitPayout(input: PayoutInput): Promise<{ ok: boolean; message?: string }> {
  if (!isBackend()) {
    try {
      useCommerceStore
        .getState()
        .requestPayout(input.memberId, input.amount, input.bankName, input.bankAccountNumber, input.bankAccountName);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Payout request failed.' };
    }
  }

  const res = await fetch('/api/hellobee/payouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: input.amount,
      bank_name: input.bankName,
      bank_account_number: input.bankAccountNumber,
      bank_account_name: input.bankAccountName,
    }),
  }).catch(() => null);

  if (!res?.ok) {
    const data = await res?.json().catch(() => null);
    return { ok: false, message: data?.message || 'Payout request failed.' };
  }

  await syncNetwork();
  return { ok: true };
}

export async function decidePayout(payoutId: string, status: PayoutStatus): Promise<{ ok: boolean; message?: string }> {
  if (!isBackend()) {
    useCommerceStore.getState().updatePayoutStatus(payoutId, status);
    return { ok: true };
  }

  const res = await fetch(`/api/hellobee/payouts/${encodeURIComponent(payoutId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).catch(() => null);

  if (!res?.ok) {
    const data = await res?.json().catch(() => null);
    return { ok: false, message: data?.message || 'Could not update the payout.' };
  }

  await syncNetwork();
  return { ok: true };
}

// undefined = no backend (caller should check its local list); null = not a valid code.
export async function lookupReferralCode(
  code: string,
): Promise<Pick<HellobeeMember, 'name' | 'referralCode' | 'role' | 'rank'> | null | undefined> {
  try {
    const res = await fetch(`/api/referral-codes/${encodeURIComponent(code.trim())}`, { cache: 'no-store' });
    if (res.status === LOCAL_MODE) return undefined;
    if (!res.ok) return null;

    const { data } = await res.json();
    return { name: data.name, referralCode: data.referral_code, role: data.role, rank: data.rank };
  } catch {
    return null;
  }
}
