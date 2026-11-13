import { TaxCalculationResult } from '../types/calculation-result';
import { TaxCalculationInput } from '../types/calculation-input';

export interface CalculationRecord {
  id: string;
  userId?: string;
  country: string;
  taxYear: number;
  incomeType: string;
  currency: string;
  grossIncome: string;
  totalTax: string;
  netIncome: string;
  effectiveTaxRate: string;
  ruleVersion: string;
  status: string;
  inputSnapshot: TaxCalculationInput;
  resultSnapshot: TaxCalculationResult;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// In-memory persistent history store (with local storage / mock fallback)
class CalculationHistoryStore {
  private static history: CalculationRecord[] = [];
  private static auditLogs: AuditLogRecord[] = [];

  public static saveCalculation(
    input: TaxCalculationInput,
    result: TaxCalculationResult,
    userId?: string
  ): CalculationRecord {
    const record: CalculationRecord = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || 'anonymous',
      country: result.country,
      taxYear: result.taxYear,
      incomeType: result.incomeType,
      currency: result.currency,
      grossIncome: result.grossIncome,
      totalTax: result.totalTax,
      netIncome: result.estimatedTakeHome,
      effectiveTaxRate: result.effectiveTaxRate,
      ruleVersion: result.ruleVersion,
      status: result.calculationStatus,
      inputSnapshot: input,
      resultSnapshot: result,
      createdAt: new Date().toISOString(),
    };

    this.history.unshift(record);

    // Keep up to 200 items in memory
    if (this.history.length > 200) {
      this.history.pop();
    }

    return record;
  }

  public static listCalculations(limit: number = 20): CalculationRecord[] {
    return this.history.slice(0, limit);
  }

  public static getCalculation(id: string): CalculationRecord | undefined {
    return this.history.find((c) => c.id === id);
  }

  public static deleteCalculation(id: string, userId?: string): boolean {
    const idx = this.history.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.history.splice(idx, 1);
      this.logAudit(userId || 'anonymous', 'DELETE_CALCULATION', 'Calculation', id);
      return true;
    }
    return false;
  }

  public static logAudit(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): AuditLogRecord {
    const log: AuditLogRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  public static listAuditLogs(limit: number = 50): AuditLogRecord[] {
    return this.auditLogs.slice(0, limit);
  }
}

export { CalculationHistoryStore };

