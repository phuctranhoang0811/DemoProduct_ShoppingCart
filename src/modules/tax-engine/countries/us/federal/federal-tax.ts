import { Decimal, toDecimal, maxDecimal, minDecimal } from '../../../core/money';
import { calculateProgressiveTax, ProgressiveTaxResult, TaxBracket } from '../../../core/progressive-tax';
import { FilingStatus } from '../../../types/calculation-input';

export interface FederalTaxCalculationInput {
  agi: Decimal;
  netBusinessProfit?: Decimal;
  filingStatus: FilingStatus;
  standardDeduction: Decimal;
  itemizedDeduction?: Decimal;
  useItemized?: boolean;
  qualifiedBusinessIncomeEligible?: boolean;
  qbiAmount?: Decimal;
  brackets: TaxBracket[];
}

export interface FederalTaxCalculationResult {
  agi: Decimal;
  applicableDeduction: Decimal;
  isItemized: boolean;
  taxableIncomeBeforeQBI: Decimal;
  qbiDeduction: Decimal;
  federalTaxableIncome: Decimal;
  federalIncomeTax: Decimal;
  bracketsBreakdown: ProgressiveTaxResult['bracketsBreakdown'];
}

export function calculateFederalIncomeTax(
  input: FederalTaxCalculationInput
): FederalTaxCalculationResult {
  const agi = input.agi;
  const stdDed = toDecimal(input.standardDeduction);
  const itemDed = toDecimal(input.itemizedDeduction || 0);

  // Apply greater of itemized or standard if requested
  const isItemized = Boolean(input.useItemized && itemDed.greaterThan(stdDed));
  const applicableDeduction = isItemized ? itemDed : stdDed;

  // Taxable income before QBI deduction
  const taxableIncomeBeforeQBI = maxDecimal(new Decimal(0), agi.minus(applicableDeduction));

  // Step 9: Qualified Business Income (QBI) Deduction (Section 199A)
  let qbiDeduction = new Decimal(0);
  if (input.qualifiedBusinessIncomeEligible && input.netBusinessProfit && input.netBusinessProfit.greaterThan(0)) {
    const qbiComponent = toDecimal(input.qbiAmount || input.netBusinessProfit);
    // 20% of eligible QBI or 20% of taxable income before QBI, whichever is less
    const qbiFromBusiness = qbiComponent.times(new Decimal('0.20'));
    const qbiOverallLimit = taxableIncomeBeforeQBI.times(new Decimal('0.20'));
    qbiDeduction = maxDecimal(new Decimal(0), minDecimal(qbiFromBusiness, qbiOverallLimit));
  }

  // Federal Taxable Income
  const federalTaxableIncome = maxDecimal(new Decimal(0), taxableIncomeBeforeQBI.minus(qbiDeduction));

  // Step 10: Federal Income Tax progressive brackets
  const progressiveResult = calculateProgressiveTax(federalTaxableIncome, input.brackets);

  return {
    agi,
    applicableDeduction,
    isItemized,
    taxableIncomeBeforeQBI,
    qbiDeduction,
    federalTaxableIncome,
    federalIncomeTax: progressiveResult.totalTax,
    bracketsBreakdown: progressiveResult.bracketsBreakdown,
  };
}

