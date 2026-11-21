import type { Order } from '@/types';
import type { CommissionTransaction } from '@/types/hellobee';

export interface FinancialSummary {
  machineInflow: number;
  machineUnits: number;
  grossRevenue: number;
  pendingCollection: number;
  employeeEarnings: number;
  ownerCommissions: number;
  netRetained: number;
  ownerProceeds: number;
}

// Cancelled and refunded orders never count; unpaid (COD) orders are revenue but flagged as still to collect.
export function isRevenueOrder(order: Order): boolean {
  return order.status !== 'Cancelled' && order.paymentStatus !== 'Refunded';
}

export function computeFinancials(orders: Order[], commissions: CommissionTransaction[]): FinancialSummary {
  const live = orders.filter(isRevenueOrder);

  let machineInflow = 0;
  let machineUnits = 0;
  for (const o of live) {
    for (const it of o.items) {
      machineInflow += it.price * it.quantity;
      machineUnits += it.quantity;
    }
  }

  const grossRevenue = live.reduce((sum, o) => sum + o.total, 0);
  const pendingCollection = live
    .filter((o) => o.paymentStatus === 'Unpaid')
    .reduce((sum, o) => sum + o.total, 0);

  const active = commissions.filter((c) => c.status !== 'REVOKED');
  const employeeEarnings = active
    .filter((c) => c.beneficiaryRole === 'EMPLOYEE')
    .reduce((sum, c) => sum + c.amount, 0);
  const ownerCommissions = active
    .filter((c) => c.beneficiaryRole === 'OWNER')
    .reduce((sum, c) => sum + c.amount, 0);

  // Owner keeps everything that is not paid out to employees; owner commissions are a subset of that share.
  const ownerProceeds = Math.max(0, grossRevenue - employeeEarnings);
  const netRetained = Math.max(0, ownerProceeds - ownerCommissions);

  return {
    machineInflow,
    machineUnits,
    grossRevenue,
    pendingCollection,
    employeeEarnings,
    ownerCommissions,
    netRetained,
    ownerProceeds,
  };
}
