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

export type CommissionType =
  | 'DIRECT_10_PERCENT'
  // 1% to each member above the seller ...
  | 'UPLINE_OVERRIDE_1_PERCENT'
  // ... and the same 1% when that member is the owner at the top of the tree.
  | 'OWNER_OVERRIDE_1_PERCENT'
  | 'GENERATION_1_PERCENT'
  | 'RANK_UPGRADE_REWARD';

// A sale pays its seller DIRECT_RATE and every level above the seller UPLINE_RATE.
export const DIRECT_RATE = 0.1;
export const UPLINE_RATE = 0.01;

// Invitation codes are numbered in the order members join: HBEE01, HBEE02, ...
export function nextReferralCode(members: Pick<HellobeeMember, 'referralCode'>[]): string {
  const highest = members.reduce((max, member) => {
    const match = /^HBEE(\d+)$/.exec(member.referralCode);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `HBEE${String(highest + 1).padStart(2, '0')}`;
}
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
  generation?: number; // 1 = direct seller, 2-6 = upline sponsors
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

export function commissionLabel(
  input: CommissionType | Pick<CommissionTransaction, 'commissionType' | 'generation'>
): string {
  const type = typeof input === 'string' ? input : input.commissionType;
  const generation = typeof input === 'string' ? undefined : input.generation;
  if (type === 'DIRECT_10_PERCENT') return '10% Direct';
  if (type === 'UPLINE_OVERRIDE_1_PERCENT') return '1% Upline Override';
  if (type === 'RANK_UPGRADE_REWARD') return `LV${generation ?? ''} Upgrade Reward`;
  if (type === 'GENERATION_1_PERCENT') return `1% Generation ${generation ?? ''}`.trim();
  return '1% Owner Override';
}

// Plan A: 10% to the seller, 1% to each of up to five upline sponsors (max 15% per sale).
export const GENERATION_RATES = [0.1, 0.01, 0.01, 0.01, 0.01, 0.01] as const;

// Plan B: team-size ladder. LV1 counts direct members only; LV2+ count the whole downline.
export interface LadderRank {
  level: number;
  teamSize: number;
  directOnly: boolean;
  upgradeReward: number; // LV1 reward is a Kangen Air unit, value not yet confirmed
  monthlySalary: number;
}

export const LADDER_RANKS: LadderRank[] = [
  { level: 1, teamSize: 5, directOnly: true, upgradeReward: 0, monthlySalary: 0 },
  { level: 2, teamSize: 25, directOnly: false, upgradeReward: 100, monthlySalary: 0 },
  { level: 3, teamSize: 125, directOnly: false, upgradeReward: 500, monthlySalary: 50 },
  { level: 4, teamSize: 500, directOnly: false, upgradeReward: 1000, monthlySalary: 100 },
  { level: 5, teamSize: 1000, directOnly: false, upgradeReward: 2000, monthlySalary: 200 },
  { level: 6, teamSize: 2500, directOnly: false, upgradeReward: 5000, monthlySalary: 500 },
  { level: 7, teamSize: 5100, directOnly: false, upgradeReward: 10000, monthlySalary: 1000 },
  { level: 8, teamSize: 10000, directOnly: false, upgradeReward: 20000, monthlySalary: 2000 },
  { level: 9, teamSize: 50000, directOnly: false, upgradeReward: 30000, monthlySalary: 3000 },
  { level: 10, teamSize: 100000, directOnly: false, upgradeReward: 40000, monthlySalary: 4000 },
];

export const LADDER_NAMES = [
  'First Step',
  'Team Builder',
  'Rising Leader',
  'Team Leader',
  'Senior Leader',
  'Elite Leader',
  'Diamond Leader',
  'Executive Leader',
  'Master Leader',
  'Grand Master',
] as const;

export interface TeamStats {
  directCount: number;
  teamSize: number;
  byGeneration: number[]; // index 0 = generation 1
  ladderLevel: number; // 0 = not yet LV1
}

export function getTeamStats(memberId: string, members: HellobeeMember[]): TeamStats {
  const byGeneration: number[] = [];
  let frontier = [memberId];
  const seen = new Set([memberId]);
  while (frontier.length && byGeneration.length < 10) {
    const next = members.filter(
      (m) => m.isActive && m.referredById && frontier.includes(m.referredById) && !seen.has(m.id)
    );
    next.forEach((m) => seen.add(m.id));
    if (!next.length) break;
    byGeneration.push(next.length);
    frontier = next.map((m) => m.id);
  }
  const directCount = byGeneration[0] ?? 0;
  const teamSize = byGeneration.reduce((a, b) => a + b, 0);
  let ladderLevel = 0;
  for (const r of LADDER_RANKS) {
    if ((r.directOnly ? directCount : teamSize) >= r.teamSize) ladderLevel = r.level;
  }
  return { directCount, teamSize, byGeneration, ladderLevel };
}

export const LV_RANKS = ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10'] as const;
export type LvRankLevel = (typeof LV_RANKS)[number];

export function getMemberLvLevel(member: HellobeeMember, members: HellobeeMember[]): number {
  const team = getTeamStats(member.id, members);
  const legacyLevel = parseInt(member.rank, 10) || 1;
  let orderLevel = 1;
  for (const r of LADDER_RANKS) {
    if (member.validOrdersCount >= r.teamSize) orderLevel = r.level;
  }
  return Math.min(10, Math.max(1, team.ladderLevel, legacyLevel, orderLevel));
}

export function getNextLvProgress(member: HellobeeMember, members: HellobeeMember[]): {
  currentLevel: number;
  currentRank: LvRankLevel;
  nextRank: LvRankLevel | 'MAX';
  required: number;
  current: number;
  percent: number;
} {
  const currentLevel = getMemberLvLevel(member, members);
  const currentRank = `LV${currentLevel}` as LvRankLevel;
  const team = getTeamStats(member.id, members);
  const count = Math.max(team.teamSize, member.validOrdersCount);

  if (currentLevel >= 10) {
    return {
      currentLevel: 10,
      currentRank: 'LV10',
      nextRank: 'MAX',
      required: count,
      current: count,
      percent: 100,
    };
  }

  const nextRule = LADDER_RANKS.find((r) => r.level === currentLevel + 1) || LADDER_RANKS[LADDER_RANKS.length - 1];
  const percent = Math.min(100, Math.round((count / nextRule.teamSize) * 100));

  return {
    currentLevel,
    currentRank,
    nextRank: `LV${nextRule.level}` as LvRankLevel,
    required: nextRule.teamSize,
    current: count,
    percent,
  };
}

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

