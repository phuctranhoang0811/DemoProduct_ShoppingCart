export type HellobeeRole = 'ADMIN' | 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';
export type RankLevel = '1A' | '2A' | '3A' | '4A' | '5A';

export interface HellobeeMember {
  id: string;
  name: string;
  email: string;
  role: HellobeeRole;
  phone?: string;
  referralCode: string;
  referredById?: string | null;
  sponsorCode?: string | null;
  ownerId?: string | null; // Top-level owner for employees
  rank: RankLevel;
  validOrdersCount: number;
  personalSalesVolume: number;
  networkSalesVolume: number;
  directInviteCount: number;
  totalCommissionEarned: number;
  availableBalance: number;
  hasPurchasedFiltrationDevice: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export type CommissionType = 'DIRECT_10_PERCENT' | 'OWNER_OVERRIDE_1_PERCENT';
export type CommissionStatus = 'APPROVED' | 'PAID' | 'REVOKED';

export interface CommissionTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  orderAmount: number;
  buyerName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryRole: HellobeeRole;
  commissionType: CommissionType;
  rate: number; // 0.10 or 0.01
  amount: number;
  status: CommissionStatus;
  notes: string;
  createdAt: string;
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PayoutRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: HellobeeRole;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface RankProgressionRule {
  currentRank: RankLevel;
  requiredOrders: number;
  nextRank: RankLevel;
}

export const RANK_PROGRESSION_RULES: RankProgressionRule[] = [
  { currentRank: '1A', requiredOrders: 5, nextRank: '2A' },
  { currentRank: '2A', requiredOrders: 25, nextRank: '3A' },
  { currentRank: '3A', requiredOrders: 125, nextRank: '4A' },
  { currentRank: '4A', requiredOrders: 625, nextRank: '5A' },
];

export function getNextRankProgress(currentRank: RankLevel, ordersCount: number): {
  nextRank: RankLevel | 'MAX';
  required: number;
  current: number;
  percent: number;
} {
  const rule = RANK_PROGRESSION_RULES.find((r) => r.currentRank === currentRank);
  if (!rule) {
    return { nextRank: 'MAX', required: ordersCount, current: ordersCount, percent: 100 };
  }

  const percent = Math.min(100, Math.round((ordersCount / rule.requiredOrders) * 100));
  return {
    nextRank: rule.nextRank,
    required: rule.requiredOrders,
    current: ordersCount,
    percent,
  };
}

