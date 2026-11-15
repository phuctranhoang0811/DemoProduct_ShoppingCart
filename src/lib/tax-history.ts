import 'server-only';

import {
  AuditLogRecord,
  CalculationHistoryStore,
  CalculationRecord,
} from '@/modules/tax-engine/core/history-store';
import type { TaxCalculationInput } from '@/modules/tax-engine/types/calculation-input';
import type { TaxCalculationResult } from '@/modules/tax-engine/types/calculation-result';
import { authBackendEnabled, backend, getSessionToken } from '@/lib/session';

// Calculator history and the audit trail. With a backend they live in the database: history is
// saved per signed-in user (anonymous runs are not stored at all), and the audit trail is shared
// with the rest of the back office. Without one, the original in-memory store is used.

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRecord(c: any): CalculationRecord {
  return {
    id: c.id,
    country: c.country,
    taxYear: c.tax_year,
    incomeType: c.income_type,
    currency: c.currency,
    grossIncome: c.gross_income,
    totalTax: c.total_tax,
    netIncome: c.net_income,
    effectiveTaxRate: c.effective_tax_rate,
    ruleVersion: c.rule_version,
    status: c.status,
    inputSnapshot: c.input_snapshot,
    resultSnapshot: c.result_snapshot,
    createdAt: c.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Returns the saved record's id, or null when nothing was stored (anonymous visitor).
export async function saveCalculation(
  input: TaxCalculationInput,
  result: TaxCalculationResult,
): Promise<string | null> {
  if (!authBackendEnabled) return CalculationHistoryStore.saveCalculation(input, result).id;

  const token = getSessionToken();
  if (!token) return null;

  const saved = await backend<{ data?: { id: string } }>('/tax/calculations', {
    method: 'POST',
    token,
    body: {
      country: result.country,
      tax_year: result.taxYear,
      income_type: result.incomeType,
      currency: result.currency,
      gross_income: String(result.grossIncome),
      total_tax: String(result.totalTax),
      net_income: String(result.estimatedTakeHome),
      effective_tax_rate: String(result.effectiveTaxRate),
      rule_version: result.ruleVersion,
      status: result.calculationStatus,
      input_snapshot: input,
      result_snapshot: result,
    },
  }).catch(() => null);

  return saved?.ok ? saved.data.data?.id ?? null : null;
}

export async function listCalculations(limit: number): Promise<CalculationRecord[]> {
  if (!authBackendEnabled) return CalculationHistoryStore.listCalculations(limit);

  const token = getSessionToken();
  if (!token) return [];

  const res = await backend<{ data?: unknown[] }>(`/tax/calculations?limit=${limit}`, { token });
  return res.ok ? (res.data.data ?? []).map(toRecord) : [];
}

export async function getCalculation(id: string): Promise<CalculationRecord | undefined> {
  if (!authBackendEnabled) return CalculationHistoryStore.getCalculation(id);

  const token = getSessionToken();
  if (!token) return undefined;

  const res = await backend<{ data?: unknown }>(`/tax/calculations/${encodeURIComponent(id)}`, { token });
  return res.ok && res.data.data ? toRecord(res.data.data) : undefined;
}

export async function deleteCalculation(id: string): Promise<boolean> {
  if (!authBackendEnabled) return CalculationHistoryStore.deleteCalculation(id);

  const token = getSessionToken();
  if (!token) return false;

  return (await backend(`/tax/calculations/${encodeURIComponent(id)}`, { method: 'DELETE', token })).ok;
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>,
): Promise<void> {
  if (!authBackendEnabled) {
    CalculationHistoryStore.logAudit('admin_user', action, entityType, entityId, details);
    return;
  }

  // The backend records who did it from the session; a failed write must not fail the action.
  await backend('/admin/audit-logs', {
    method: 'POST',
    token: getSessionToken(),
    body: { action, entity_type: entityType, entity_id: entityId, details: details ?? null },
  }).catch(() => null);
}

export async function listAuditLogs(limit: number): Promise<AuditLogRecord[]> {
  if (!authBackendEnabled) return CalculationHistoryStore.listAuditLogs(limit);

  const res = await backend<{ data?: any[] }>(`/admin/audit-logs?limit=${limit}`, { token: getSessionToken() });
  if (!res.ok) return [];

  return (res.data.data ?? []).map((log) => ({
    id: String(log.id),
    userId: log.user?.email ?? undefined,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id ?? '',
    details: log.details ?? undefined,
    timestamp: log.timestamp,
  }));
}
