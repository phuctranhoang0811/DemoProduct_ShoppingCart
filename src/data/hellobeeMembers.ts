import { HellobeeMember, CommissionTransaction, PayoutRequest } from '@/types/hellobee';

// Only the two accounts behind the Admin and Staff quick logins, with empty statistics.
// Network members, orders, commissions and payouts all come from real use.
const coreMembers: HellobeeMember[] = [
  {
    id: 'usr_owner_01',
    name: 'Johnathan Bee (Managing Owner)',
    email: 'owner@hellobee.com',
    role: 'OWNER',
    phone: '+1 (555) 019-2831',
    referralCode: 'HBEE01',
    referredById: null,
    sponsorCode: null,
    ownerId: null,
    rank: '1A',
    validOrdersCount: 0,
    personalSalesVolume: 0,
    networkSalesVolume: 0,
    directInviteCount: 0,
    totalCommissionEarned: 0,
    availableBalance: 0,
    hasPurchasedFiltrationDevice: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_emp_01',
    name: 'David Nguyen (Senior Associate)',
    email: 'employee@hellobee.com',
    role: 'EMPLOYEE',
    phone: '+1 (555) 014-4411',
    referralCode: 'HBEE03',
    referredById: 'usr_owner_01',
    sponsorCode: 'HBEE01',
    ownerId: 'usr_owner_01',
    rank: '1A',
    validOrdersCount: 0,
    personalSalesVolume: 0,
    networkSalesVolume: 0,
    directInviteCount: 0,
    totalCommissionEarned: 0,
    availableBalance: 0,
    hasPurchasedFiltrationDevice: true,
    isActive: true,
    createdAt: '2026-02-15T10:00:00Z',
  },
];

export const initialCoreHellobeeMembers: HellobeeMember[] = coreMembers;
export const initialHellobeeMembers: HellobeeMember[] = [...coreMembers];
export const initialCommissionTransactions: CommissionTransaction[] = [];
export const initialPayoutRequests: PayoutRequest[] = [];
