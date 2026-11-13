import { TaxCalculator } from '../../../core/calculator.interface';
import { TaxCalculationInput, Us1099Input } from '../../../types/calculation-input';
import { TaxCalculationResult, OFFICIAL_TAX_DISCLAIMER } from '../../../types/calculation-result';
import { Decimal, toDecimal, maxDecimal } from '../../../core/money';
import { roundJurisdiction, formatJurisdiction } from '../../../core/rounding';
import { TaxRuleRepository } from '../../../rules/tax-rule.repository';
import { assertUsableRule } from '../../../rules/tax-rule.validator';
import { calculateSelfEmploymentTax } from '../federal/self-employment-tax';
import { calculateAdditionalMedicareTax } from '../federal/additional-medicare';
import { calculateFederalIncomeTax } from '../federal/federal-tax';
import { StateTaxService } from '../state/state-tax.service';

export class Us1099Calculator implements TaxCalculator {
  public supports(input: TaxCalculationInput): boolean {
    return input.country === 'US' && input.incomeType === '1099';
  }

  public async calculate(inputRaw: TaxCalculationInput): Promise<TaxCalculationResult> {
    const input = inputRaw as Us1099Input;
    const rule = TaxRuleRepository.findRule('US', input.taxYear, '1099', input.filingStatus);
    assertUsableRule(rule);

    const grossBusinessIncome = toDecimal(input.grossBusinessIncome);
    const businessExpenses = toDecimal(input.businessExpenses);
    const otherW2 = toDecimal(input.otherW2Income || 0);
    const otherIncome = toDecimal(input.otherIncome || 0);
    const estimatedPayments = toDecimal(input.estimatedTaxPayments || 0);
    const otherAdjustments = toDecimal(input.otherAdjustments || 0);

    // Step 1 - Step 4 & Step 7: Self-employment tax components
    const seResult = calculateSelfEmploymentTax({
      grossBusinessIncome,
      businessExpenses,
      otherW2Income: otherW2,
      socialSecurityWageBase: rule.socialSecurityWageBase || 184500,
    });

    // Step 5: Additional Medicare Tax (0.9%)
    const addlMedicareResult = calculateAdditionalMedicareTax({
      seEarnings: seResult.seEarnings,
      w2Wages: otherW2,
      filingStatus: input.filingStatus,
    });

    // Step 6: Total Self-Employment Tax
    const totalSelfEmploymentTax = seResult.totalSETaxBeforeAdditionalMedicare.plus(
      addlMedicareResult.additionalMedicareTax
    );

    // Step 8: Adjusted Gross Income (AGI)
    // AGI = Total Income - Deductible Half of SE Tax - Other Adjustments
    const totalIncome = seResult.netProfit.plus(otherW2).plus(otherIncome);
    const agi = maxDecimal(
      new Decimal(0),
      totalIncome.minus(seResult.deductibleHalfSETax).minus(otherAdjustments)
    );

    // Step 9 & 10: Federal Income Tax (with Standard/Itemized deduction and QBI)
    const fedResult = calculateFederalIncomeTax({
      agi,
      netBusinessProfit: seResult.netProfit,
      filingStatus: input.filingStatus,
      standardDeduction: toDecimal(rule.standardDeduction || 15000),
      itemizedDeduction: toDecimal(input.itemizedDeductionAmount || 0),
      useItemized: Boolean(input.hasItemizedDeductions),
      qualifiedBusinessIncomeEligible: true,
      qbiAmount: input.qualifiedBusinessIncome ? toDecimal(input.qualifiedBusinessIncome) : undefined,
      brackets: rule.brackets,
    });

    // Step 11: State and Local Tax
    const stateResult = StateTaxService.calculateStateTax({
      state: input.state,
      taxableIncome: fedResult.federalTaxableIncome,
      filingStatus: input.filingStatus,
    });

    // Step 12: Estimated Tax and Take-Home
    const totalTax = fedResult.federalIncomeTax
      .plus(totalSelfEmploymentTax)
      .plus(stateResult.stateTaxAmount);

    const totalDeductions = businessExpenses
      .plus(fedResult.applicableDeduction)
      .plus(fedResult.qbiDeduction)
      .plus(seResult.deductibleHalfSETax);

    const estimatedTakeHome = maxDecimal(new Decimal(0), seResult.netProfit.minus(totalTax));
    const estimatedBalanceDue = totalTax.minus(estimatedPayments);

    const effectiveTaxRate = grossBusinessIncome.greaterThan(0)
      ? totalTax.dividedBy(grossBusinessIncome).times(100)
      : new Decimal(0);

    const calculationStatus = stateResult.isSupported ? 'COMPLETED' : 'ESTIMATE';

    return {
      country: 'US',
      taxYear: input.taxYear,
      incomeType: '1099',
      currency: 'USD',

      grossIncome: formatJurisdiction(grossBusinessIncome, 'USD'),
      businessExpenses: formatJurisdiction(businessExpenses, 'USD'),
      netProfit: formatJurisdiction(seResult.netProfit, 'USD'),

      taxableIncome: formatJurisdiction(fedResult.federalTaxableIncome, 'USD'),

      federalTax: formatJurisdiction(fedResult.federalIncomeTax, 'USD'),
      stateTax: formatJurisdiction(stateResult.stateTaxAmount, 'USD'),
      localTax: '0.00',

      socialSecurityTax: formatJurisdiction(seResult.socialSecurityTax, 'USD'),
      medicareTax: formatJurisdiction(seResult.medicareTax, 'USD'),
      selfEmploymentTax: formatJurisdiction(totalSelfEmploymentTax, 'USD'),

      insuranceContributions: null,
      personalIncomeTax: null,

      totalTax: formatJurisdiction(totalTax, 'USD'),
      totalDeductions: formatJurisdiction(totalDeductions, 'USD'),
      estimatedTakeHome: formatJurisdiction(estimatedTakeHome, 'USD'),

      effectiveTaxRate: `${effectiveTaxRate.toFixed(2, Decimal.ROUND_HALF_UP)}%`,
      ruleVersion: rule.version,
      calculationStatus,
      isEstimate: !stateResult.isSupported,

      breakdown: {
        agi: formatJurisdiction(agi, 'USD'),
        deductibleHalfSETax: formatJurisdiction(seResult.deductibleHalfSETax, 'USD'),
        standardDeduction: formatJurisdiction(fedResult.applicableDeduction, 'USD'),
        isItemized: fedResult.isItemized,
        qbiDeduction: formatJurisdiction(fedResult.qbiDeduction, 'USD'),
        additionalMedicareTax: formatJurisdiction(addlMedicareResult.additionalMedicareTax, 'USD'),
        seEarnings: formatJurisdiction(seResult.seEarnings, 'USD'),
        estimatedTaxPayments: formatJurisdiction(estimatedPayments, 'USD'),
        estimatedBalanceDue: formatJurisdiction(estimatedBalanceDue, 'USD'),
        stateNotes: stateResult.notes,
        federalBracketsBreakdown: fedResult.bracketsBreakdown,
      },
      disclaimer: OFFICIAL_TAX_DISCLAIMER,
    };
  }
}

