import { describe, expect, it } from 'vitest';
import { computeFinancials } from '@/lib/financials';
import type { Order } from '@/types';
import type { CommissionTransaction } from '@/types/hellobee';

const order = (over: Partial<Order>): Order =>
  ({
    id: 'ORD-1',
    status: 'Pending',
    paymentStatus: 'Paid',
    total: 1500,
    items: [{ price: 1500, quantity: 1 }],
    ...over,
  }) as unknown as Order;

const commission = (over: Partial<CommissionTransaction>): CommissionTransaction =>
  ({ status: 'APPROVED', beneficiaryRole: 'EMPLOYEE', amount: 150, ...over }) as CommissionTransaction;

describe('computeFinancials', () => {
  it('splits revenue between employee and owner shares', () => {
    const f = computeFinancials(
      [order({})],
      [commission({}), commission({ beneficiaryRole: 'OWNER', amount: 15 })]
    );
    expect(f.machineInflow).toBe(1500);
    expect(f.grossRevenue).toBe(1500);
    expect(f.employeeEarnings).toBe(150);
    expect(f.ownerCommissions).toBe(15);
    expect(f.ownerProceeds).toBe(1350);
    expect(f.netRetained).toBe(1335);
    expect(f.employeeEarnings + f.ownerProceeds).toBe(f.grossRevenue);
  });

  it('ignores cancelled and refunded orders and revoked commissions', () => {
    const f = computeFinancials(
      [order({ status: 'Cancelled' }), order({ paymentStatus: 'Refunded' })],
      [commission({ status: 'REVOKED' })]
    );
    expect(f.grossRevenue).toBe(0);
    expect(f.employeeEarnings).toBe(0);
    expect(f.ownerProceeds).toBe(0);
  });

  it('reports unpaid orders as still to collect', () => {
    const f = computeFinancials([order({ paymentStatus: 'Unpaid' })], []);
    expect(f.pendingCollection).toBe(1500);
  });
});
