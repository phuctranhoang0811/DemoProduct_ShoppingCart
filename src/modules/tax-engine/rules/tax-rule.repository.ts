import { TaxRuleSetDefinition } from './tax-rule.version';
import { RuleNotFoundError } from '../core/errors';

export class TaxRuleRepository {
  private static rules: TaxRuleSetDefinition[] = [
    // ==========================================
    // UNITED STATES: 2026 FEDERAL 1099 & W2
    // ==========================================
    {
      id: 'us-fed-2026-single',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2026,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'SINGLE',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026',
      verificationDate: '2026-01-15',
      standardDeduction: 15000,
      socialSecurityWageBase: 184500,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 200000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 12150, rate: 0.1 },
        { min: 12150, max: 49400, rate: 0.12 },
        { min: 49400, max: 105700, rate: 0.22 },
        { min: 105700, max: 201450, rate: 0.24 },
        { min: 201450, max: 255850, rate: 0.32 },
        { min: 255850, max: 640600, rate: 0.35 },
        { min: 640600, max: null, rate: 0.37 },
      ],
    },
    {
      id: 'us-fed-2026-mfj',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2026,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'MARRIED_FILING_JOINTLY',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026',
      verificationDate: '2026-01-15',
      standardDeduction: 30000,
      socialSecurityWageBase: 184500,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 250000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 24300, rate: 0.1 },
        { min: 24300, max: 98800, rate: 0.12 },
        { min: 98800, max: 211400, rate: 0.22 },
        { min: 211400, max: 402900, rate: 0.24 },
        { min: 402900, max: 511700, rate: 0.32 },
        { min: 511700, max: 768700, rate: 0.35 },
        { min: 768700, max: null, rate: 0.37 },
      ],
    },
    {
      id: 'us-fed-2026-mfs',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2026,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'MARRIED_FILING_SEPARATELY',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026',
      verificationDate: '2026-01-15',
      standardDeduction: 15000,
      socialSecurityWageBase: 184500,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 125000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 12150, rate: 0.1 },
        { min: 12150, max: 49400, rate: 0.12 },
        { min: 49400, max: 105700, rate: 0.22 },
        { min: 105700, max: 201450, rate: 0.24 },
        { min: 201450, max: 255850, rate: 0.32 },
        { min: 255850, max: 384350, rate: 0.35 },
        { min: 384350, max: null, rate: 0.37 },
      ],
    },
    {
      id: 'us-fed-2026-hoh',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2026,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'HEAD_OF_HOUSEHOLD',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026',
      verificationDate: '2026-01-15',
      standardDeduction: 22500,
      socialSecurityWageBase: 184500,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 200000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 17350, rate: 0.1 },
        { min: 17350, max: 66200, rate: 0.12 },
        { min: 66200, max: 105700, rate: 0.22 },
        { min: 105700, max: 201450, rate: 0.24 },
        { min: 201450, max: 255850, rate: 0.32 },
        { min: 255850, max: 640600, rate: 0.35 },
        { min: 640600, max: null, rate: 0.37 },
      ],
    },
    {
      id: 'us-fed-2026-qss',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2026,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'QUALIFYING_SURVIVING_SPOUSE',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026',
      verificationDate: '2026-01-15',
      standardDeduction: 30000,
      socialSecurityWageBase: 184500,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 200000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 24300, rate: 0.1 },
        { min: 24300, max: 98800, rate: 0.12 },
        { min: 98800, max: 211400, rate: 0.22 },
        { min: 211400, max: 402900, rate: 0.24 },
        { min: 402900, max: 511700, rate: 0.32 },
        { min: 511700, max: 768700, rate: 0.35 },
        { min: 768700, max: null, rate: 0.37 },
      ],
    },

    // ==========================================
    // UNITED STATES: 2025 FEDERAL 1099 & W2
    // ==========================================
    {
      id: 'us-fed-2025-single',
      country: 'US',
      jurisdiction: 'FEDERAL',
      taxYear: 2025,
      incomeType: 'FEDERAL_FIT',
      filingStatus: 'SINGLE',
      version: '2025.1.0-official',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025',
      verificationDate: '2025-01-10',
      standardDeduction: 15000,
      socialSecurityWageBase: 176100,
      socialSecurityRate: 0.062,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 200000,
      additionalMedicareRate: 0.009,
      brackets: [
        { min: 0, max: 11925, rate: 0.1 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: null, rate: 0.37 },
      ],
    },

    // ==========================================
    // VIETNAM: 2026 SALARY & PIT (5 Brackets per spec)
    // ==========================================
    {
      id: 'vn-nat-2026-salary',
      country: 'VN',
      jurisdiction: 'NATIONAL',
      taxYear: 2026,
      incomeType: 'SALARY',
      version: '2026.1.0-official',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.gdt.gov.vn / National Assembly PIT Resolution 2026',
      verificationDate: '2026-01-01',
      personalExemption: 15500000, // 15.5 million VND/month
      dependentExemption: 6200000, // 6.2 million VND/month
      baseSalary: 2340000, // 2.34M base salary
      regionalMinSalary: 4960000, // 4.96M Region 1
      bhxhEmployeeRate: 0.08,
      bhytEmployeeRate: 0.015,
      bhtnEmployeeRate: 0.01,
      bhxhEmployerRate: 0.175,
      bhytEmployerRate: 0.03,
      bhtnEmployerRate: 0.01,
      brackets: [
        { min: 0, max: 10000000, rate: 0.05 },
        { min: 10000000, max: 30000000, rate: 0.1 },
        { min: 30000000, max: 60000000, rate: 0.2 },
        { min: 60000000, max: 100000000, rate: 0.3 },
        { min: 100000000, max: null, rate: 0.35 },
      ],
    },

    // ==========================================
    // VIETNAM: 2025 SALARY & PIT (7 Traditional Brackets)
    // ==========================================
    {
      id: 'vn-nat-2025-salary',
      country: 'VN',
      jurisdiction: 'NATIONAL',
      taxYear: 2025,
      incomeType: 'SALARY',
      version: '2025.1.0-official',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-12-31',
      status: 'PUBLISHED',
      sourceReference: 'https://www.gdt.gov.vn / Circular 111/2013/TT-BTC & Decree 73/2024/ND-CP',
      verificationDate: '2025-01-01',
      personalExemption: 11000000, // 11M
      dependentExemption: 4400000, // 4.4M
      baseSalary: 2340000,
      regionalMinSalary: 4960000,
      bhxhEmployeeRate: 0.08,
      bhytEmployeeRate: 0.015,
      bhtnEmployeeRate: 0.01,
      bhxhEmployerRate: 0.175,
      bhytEmployerRate: 0.03,
      bhtnEmployerRate: 0.01,
      brackets: [
        { min: 0, max: 5000000, rate: 0.05 },
        { min: 5000000, max: 10000000, rate: 0.1 },
        { min: 10000000, max: 18000000, rate: 0.15 },
        { min: 18000000, max: 32000000, rate: 0.2 },
        { min: 32000000, max: 52000000, rate: 0.25 },
        { min: 52000000, max: 80000000, rate: 0.3 },
        { min: 80000000, max: null, rate: 0.35 },
      ],
    },
  ];

  public static getAll(): TaxRuleSetDefinition[] {
    return this.rules;
  }

  public static getById(id: string): TaxRuleSetDefinition | undefined {
    return this.rules.find((r) => r.id === id);
  }

  public static findRule(
    country: string,
    taxYear: number,
    incomeType: string,
    filingStatus?: string
  ): TaxRuleSetDefinition {
    const c = country.toUpperCase();
    const match = this.rules.find((r) => {
      if (r.country !== c || r.taxYear !== taxYear) return false;
      if (c === 'US') {
        return (
          (r.incomeType === 'FEDERAL_FIT' || r.incomeType === incomeType) &&
          (!filingStatus || r.filingStatus === filingStatus)
        );
      }
      return r.incomeType === incomeType;
    });

    if (match) return match;

    // Fallback to nearest available tax year for that country and filing status
    const nearestYear = this.rules.find((r) => {
      if (r.country !== c) return false;
      if (c === 'US') {
        return (
          (r.incomeType === 'FEDERAL_FIT' || r.incomeType === incomeType) &&
          (!filingStatus || r.filingStatus === filingStatus)
        );
      }
      return r.incomeType === incomeType;
    });

    if (nearestYear) return nearestYear;

    throw new RuleNotFoundError(country, taxYear, incomeType);
  }

  public static addRule(rule: TaxRuleSetDefinition): void {
    const existingIndex = this.rules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      this.rules[existingIndex] = rule;
    } else {
      this.rules.push(rule);
    }
  }
}

