export type RuleStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'ARCHIVED';

export interface TaxBracketRule {
  min: number;
  max: number | null;
  rate: number; // e.g. 0.10 for 10%
}

export interface TaxRuleSetDefinition {
  id: string;
  country: string;
  jurisdiction: string; // e.g. 'FEDERAL', 'CA', 'NY', 'NATIONAL'
  taxYear: number;
  incomeType: string; // '1099', 'W2', 'SALARY'
  filingStatus?: string;
  version: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: RuleStatus;
  sourceReference: string;
  verificationDate: string;

  // Brackets
  brackets: TaxBracketRule[];

  // Deductions & Allowances
  standardDeduction?: number;
  personalExemption?: number;
  dependentExemption?: number;

  // Wage Bases & Rates
  socialSecurityWageBase?: number;
  socialSecurityRate?: number;
  medicareRate?: number;
  additionalMedicareThreshold?: number;
  additionalMedicareRate?: number;

  // Vietnam specific
  baseSalary?: number; // mức lương cơ sở (2,340,000)
  regionalMinSalary?: number; // mức lương tối thiểu vùng (4,960,000 for Region 1)
  bhxhEmployeeRate?: number; // 0.08
  bhytEmployeeRate?: number; // 0.015
  bhtnEmployeeRate?: number; // 0.01
  bhxhEmployerRate?: number; // 0.175
  bhytEmployerRate?: number; // 0.03
  bhtnEmployerRate?: number; // 0.01
}

