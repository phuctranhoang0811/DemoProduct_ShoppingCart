import { Decimal, toDecimal, maxDecimal } from '../../../core/money';
import { calculateProgressiveTax, TaxBracket, ProgressiveTaxResult } from '../../../core/progressive-tax';
import { ResidencyStatus } from '../../../types/calculation-input';

export interface VietnamPitInput {
  monthlyGrossSalary: Decimal | number | string;
  insuranceDeduction: Decimal | number | string;
  personalExemption: Decimal | number | string;
  dependentExemption: Decimal | number | string;
  numberOfDependents: number;
  otherDeductions?: Decimal | number | string;
  taxResidencyStatus: ResidencyStatus;
  brackets: TaxBracket[];
}

export interface VietnamPitResult {
  taxableIncome: Decimal;
  personalDeductionTotal: Decimal;
  dependentDeductionTotal: Decimal;
  totalEligibleDeductions: Decimal;
  personalIncomeTax: Decimal;
  bracketsBreakdown: ProgressiveTaxResult['bracketsBreakdown'];
}

export function calculateVietnamPit(input: VietnamPitInput): VietnamPitResult {
  const gross = toDecimal(input.monthlyGrossSalary);
  const insurance = toDecimal(input.insuranceDeduction);
  const personalEx = toDecimal(input.personalExemption);
  const dependentEx = toDecimal(input.dependentExemption);
  const countDependents = Math.max(0, input.numberOfDependents || 0);
  const otherDed = toDecimal(input.otherDeductions || 0);

  // If Non-Resident, flat 20% on gross taxable income with no deductions
  if (input.taxResidencyStatus === 'NON_RESIDENT') {
    const NON_RESIDENT_RATE = new Decimal('0.20');
    const pit = gross.times(NON_RESIDENT_RATE);
    return {
      taxableIncome: gross,
      personalDeductionTotal: new Decimal(0),
      dependentDeductionTotal: new Decimal(0),
      totalEligibleDeductions: new Decimal(0),
      personalIncomeTax: pit,
      bracketsBreakdown: [
        {
          bracketIndex: 1,
          min: '0',
          max: null,
          rate: '0.20',
          taxableInBracket: gross.toString(),
          taxInBracket: pit.toString(),
        },
      ],
    };
  }

  // Resident PIT
  const dependentTotal = dependentEx.times(countDependents);
  const totalEligibleDeductions = insurance
    .plus(personalEx)
    .plus(dependentTotal)
    .plus(otherDed);

  // Step 5.4: Taxable Income = Gross Salary - Insurance - Personal - Dependents - Other
  const taxableIncome = maxDecimal(new Decimal(0), gross.minus(totalEligibleDeductions));

  // Step 5.5: Progressive PIT calculation
  const progressiveResult = calculateProgressiveTax(taxableIncome, input.brackets);

  return {
    taxableIncome,
    personalDeductionTotal: personalEx,
    dependentDeductionTotal: dependentTotal,
    totalEligibleDeductions,
    personalIncomeTax: progressiveResult.totalTax,
    bracketsBreakdown: progressiveResult.bracketsBreakdown,
  };
}

