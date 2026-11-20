import { Customer } from '@/types';

// Only the demo account behind the "User" quick login. Everything else is created by real use.
export const initialCustomers: Customer[] = [
  {
    id: 'cust-demo',
    name: 'Elena Rostova',
    email: 'customer@example.com',
    phone: '+1 (555) 201-2345',
    status: 'active',
    referralCode: 'HBEE03',
    sponsorName: 'David Nguyen',
    createdAt: '2026-06-12T10:00:00Z',
    totalOrders: 0,
    totalSpent: 0,
    addresses: [],
  },
];
