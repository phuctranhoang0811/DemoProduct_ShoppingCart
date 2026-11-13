import { TaxCalculator } from '../../../core/calculator.interface';
import { TaxCalculationInput, UsW2Input, PayFrequency } from '../../../types/calculation-input';
import { TaxCalculationResult, OFFICIAL_TAX_DISCLAIMER } from '../../../types/calculation-result';
import { Decimal, toDecimal, maxDecimal, minDecimal } from '../../../core/money';
import { formatJurisdiction } from '../../../core/rounding';
import { TaxRuleRepository } from '../../../rules/tax-rule.repository';
import { assertUsableRule } from '../../../rules/tax-rule.validator';
import { calculateProgressiveTax } from '../../../core/progressive-tax';
import { getAdditionalMedicareThreshold } from '../federal/additional-medicare';
import { StateTaxService } from '../state/state-tax.service';

export function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case 'HOURLY':
      return 2080; // 40 hrs * 52 weeks
    case 'WEEKLY':
      return 52;
    case 'BIWEEKLY':
      return 26;
    case 'SEMIMONTHLY':
      return 24;
    case 'MONTHLY':
      return 12;
    case 'ANNUALLY':
    default:
      return 1;
  }
}

export class UsW2Calculator implements TaxCalculator {
  public supports(input: TaxCalculationInput): boolean {
    return input.country === 'US' && input.incomeType === 'W2';
  }

  public async calculate(inputRaw: TaxCalculationInput): Promise<TaxCalculationResult> {
    const input = inputRaw as UsW2Input;
    const rule = TaxRuleRepository.findRule('US', input.taxYear, 'W2', input.filingStatus);
    assertUsableRule(rule);

    const grossSalary = toDecimal(input.annualGrossSalary);
    const preTax = toDecimal(input.preTaxDeductions || 0);
    const postTax = toDecimal(input.postTaxDeductions || 0);
    const otherIncome = toDecimal(input.otherIncome || 0);

    // 1. Social Security (FICA) - Employee 6.2%, Employer 6.2%
    const ssWageBase = toDecimal(rule.socialSecurityWageBase || 184500);
    const ssApplicableSalary = minDecimal(grossSalary, ssWageBase);
    const SS_RATE = new Decimal('0.062');
    const employeeSocialSecurity = ssApplicableSalary.times(SS_RATE);
    const employerSocialSecurity = ssApplicableSalary.times(SS_RATE);

    // 2. Medicare - Employee 1.45%, Employer 1.45%
    const MEDICARE_RATE = new Decimal('0.0145');
    const employeeMedicare = grossSalary.times(MEDICARE_RATE);
    const employerMedicare = grossSalary.times(MEDICARE_RATE);

    // 3. Additional Medicare Tax (0.9% for high earners over filing status threshold)
    const addlThreshold = getAdditionalMedicareThreshold(input.filingStatus);
    const excessMedicareIncome = maxDecimal(new Decimal(0), grossSalary.minus(addlThreshold));
    const ADDITIONAL_MEDICARE_RATE = new Decimal('0.009');
    const additionalMedicare = excessMedicareIncome.times(ADDITIONAL_MEDICARE_RATE);

    // Total employee FICA
    const totalFica = employeeSocialSecurity.plus(employeeMedicare).plus(additionalMedicare);

    // 4. Federal Income Tax
    // Taxable wages = Gross Salary + Other Income - PreTax Deductions - Standard Deduction
    const stdDeduction = toDecimal(rule.standardDeduction || 15000);
    const taxableWages = maxDecimal(
      new Decimal(0),
      grossSalary.plus(otherIncome).minus(preTax).minus(stdDeduction)
    );
    const fedProgResult = calculateProgressiveTax(taxableWages, rule.brackets);
    const federalIncomeTax = fedProgResult.totalTax;

    // 5. State Tax
    const stateResult = StateTaxService.calculateStateTax({
      state: input.state,
      taxableIncome: taxableWages,
      filingStatus: input.filingStatus,
    });

    // 6. Net Take-Home Pay
    const totalTax = federalIncomeTax
      .plus(totalFica)
      .plus(stateResult.stateTaxAmount);

    const netSalary = maxDecimal(
      new Decimal(0),
      grossSalary.minus(totalTax).minus(postTax)
    );

    const periods = getPeriodsPerYear(input.payFrequency || 'ANNUALLY');
    const perPeriodNet = netSalary.dividedBy(periods);
    const perPeriodGross = grossSalary.dividedBy(periods);

    const effectiveTaxRate = grossSalary.greaterThan(0)
      ? totalTax.dividedBy(grossSalary).times(100)
      : new Decimal(0);

    const calculationStatus = stateResult.isSupported ? 'COMPLETED' : 'ESTIMATE';

    return {
      country: 'US',
      taxYear: input.taxYear,
      incomeType: 'W2',
      currency: 'USD',

      grossIncome: formatJurisdiction(grossSalary, 'USD'),
      businessExpenses: '0.00',
      netProfit: formatJurisdiction(grossSalary, 'USD'),

      taxableIncome: formatJurisdiction(taxableWages, 'USD'),

      federalTax: formatJurisdiction(federalIncomeTax, 'USD'),
      stateTax: formatJurisdiction(stateResult.stateTaxAmount, 'USD'),
      localTax: '0.00',

      socialSecurityTax: formatJurisdiction(employeeSocialSecurity, 'USD'),
      medicareTax: formatJurisdiction(employeeMedicare.plus(additionalMedicare), 'USD'),
      selfEmploymentTax: null,

      insuranceContributions: null,
      personalIncomeTax: null,

      totalTax: formatJurisdiction(totalTax, 'USD'),
      totalDeductions: formatJurisdiction(preTax.plus(postTax).plus(stdDeduction), 'USD'),
      estimatedTakeHome: formatJurisdiction(netSalary, 'USD'),

      effectiveTaxRate: `${effectiveTaxRate.toFixed(2, Decimal.ROUND_HALF_UP)}%`,
      ruleVersion: rule.version,
      calculationStatus,
      isEstimate: !stateResult.isSupported,

      breakdown: {
        payFrequency: input.payFrequency,
        perPeriodGross: formatJurisdiction(perPeriodGross, 'USD'),
        perPeriodNet: formatJurisdiction(perPeriodNet, 'USD'),
        preTaxDeductions: formatJurisdiction(preTax, 'USD'),
        postTaxDeductions: formatJurisdiction(postTax, 'USD'),
        standardDeduction: formatJurisdiction(stdDeduction, 'USD'),
        additionalMedicareTax: formatJurisdiction(additionalMedicare, 'USD'),
        employerSocialSecurity: formatJurisdiction(employerSocialSecurity, 'USD'),
        employerMedicare: formatJurisdiction(employerMedicare, 'USD'),
        totalEmployerContributions: formatJurisdiction(
          employerSocialSecurity.plus(employerMedicare),
          'USD'
        ),
        stateNotes: stateResult.notes,
        federalBracketsBreakdown: fedProgResult.bracketsBreakdown,
      },
      disclaimer: OFFICIAL_TAX_DISCLAIMER,
    };
  }
}

