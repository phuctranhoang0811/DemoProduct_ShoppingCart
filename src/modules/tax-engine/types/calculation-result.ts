export interface TaxCalculationResult {
  country: string;
  taxYear: number;
  incomeType: string;
  currency: string;

  grossIncome: string;
  businessExpenses: string;
  netProfit: string;

  taxableIncome: string;

  federalTax: string | null;
  stateTax: string | null;
  localTax: string | null;

  socialSecurityTax: string | null;
  medicareTax: string | null;
  selfEmploymentTax: string | null;

  insuranceContributions: string | null;
  personalIncomeTax: string | null;

  totalTax: string;
  totalDeductions: string;
  estimatedTakeHome: string;

  effectiveTaxRate: string;
  ruleVersion: string;
  calculationStatus: 'COMPLETED' | 'ESTIMATE' | 'UNSUPPORTED_CALCULATION';
  isEstimate: boolean;

  breakdown: Record<string, unknown>;
  disclaimer: string;
}

export const OFFICIAL_TAX_DISCLAIMER =
  'This calculator provides an estimate for informational purposes only. It is not tax, legal, or accounting advice. Actual tax liability may vary depending on individual circumstances and applicable laws.';

