import { Decimal, toDecimal, maxDecimal, minDecimal } from '../../../core/money';
import { ValidationError } from '../../../core/errors';

export interface SelfEmploymentTaxInput {
  grossBusinessIncome: Decimal | number | string;
  businessExpenses: Decimal | number | string;
  otherW2Income?: Decimal | number | string;
  socialSecurityWageBase: Decimal | number | string;
}

export interface SelfEmploymentTaxResult {
  netProfit: Decimal;
  seEarnings: Decimal;
  applicableSSWages: Decimal;
  socialSecurityTax: Decimal;
  medicareTax: Decimal;
  totalSETaxBeforeAdditionalMedicare: Decimal;
  deductibleHalfSETax: Decimal;
}

export function calculateSelfEmploymentTax(input: SelfEmploymentTaxInput): SelfEmploymentTaxResult {
  const gross = toDecimal(input.grossBusinessIncome);
  const expenses = toDecimal(input.businessExpenses);
  const otherW2 = toDecimal(input.otherW2Income || 0);
  const wageBase = toDecimal(input.socialSecurityWageBase);

  if (gross.isNegative() || expenses.isNegative()) {
    throw new ValidationError('Gross business income and expenses cannot be negative.');
  }

  // Step 1: Net Business Profit
  const netProfit = gross.minus(expenses);
  if (netProfit.lessThanOrEqualTo(0)) {
    return {
      netProfit,
      seEarnings: new Decimal(0),
      applicableSSWages: new Decimal(0),
      socialSecurityTax: new Decimal(0),
      medicareTax: new Decimal(0),
      totalSETaxBeforeAdditionalMedicare: new Decimal(0),
      deductibleHalfSETax: new Decimal(0),
    };
  }

  // Step 2: SE Earnings = Net Profit * 92.35% (IRS Schedule SE Factor)
  const SE_FACTOR = new Decimal('0.9235');
  const seEarnings = netProfit.times(SE_FACTOR);

  // Step 3: Social Security Tax (12.4%)
  // W-2 wages already used against Social Security wage base limit
  const remainingSSWageBase = maxDecimal(new Decimal(0), wageBase.minus(otherW2));
  const applicableSSWages = minDecimal(seEarnings, remainingSSWageBase);
  const SS_RATE = new Decimal('0.124');
  const socialSecurityTax = applicableSSWages.times(SS_RATE);

  // Step 4: Medicare Tax (2.9%)
  const MEDICARE_RATE = new Decimal('0.029');
  const medicareTax = seEarnings.times(MEDICARE_RATE);

  // Total standard SE tax (before additional Medicare tax)
  const totalSETaxBeforeAdditionalMedicare = socialSecurityTax.plus(medicareTax);

  // Step 7: Deductible half of SE tax (50% of regular SS + Medicare, IRS Section 164(f))
  const deductibleHalfSETax = totalSETaxBeforeAdditionalMedicare.times(new Decimal('0.5'));

  return {
    netProfit,
    seEarnings,
    applicableSSWages,
    socialSecurityTax,
    medicareTax,
    totalSETaxBeforeAdditionalMedicare,
    deductibleHalfSETax,
  };
}

