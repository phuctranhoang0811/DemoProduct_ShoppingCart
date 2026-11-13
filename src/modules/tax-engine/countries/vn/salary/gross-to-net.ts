import { TaxCalculator } from '../../../core/calculator.interface';
import {
  TaxCalculationInput,
  VnSalaryInput,
  VnFreelancerInput,
} from '../../../types/calculation-input';
import { TaxCalculationResult, OFFICIAL_TAX_DISCLAIMER } from '../../../types/calculation-result';
import { Decimal, toDecimal, maxDecimal } from '../../../core/money';
import { formatJurisdiction } from '../../../core/rounding';
import { TaxRuleRepository } from '../../../rules/tax-rule.repository';
import { assertUsableRule } from '../../../rules/tax-rule.validator';
import { calculateVietnamInsurance } from '../insurance/insurance-calculator';
import { calculateVietnamPit } from '../pit/pit-calculator';

export class VietnamSalaryCalculator implements TaxCalculator {
  public supports(input: TaxCalculationInput): boolean {
    return (
      input.country === 'VN' &&
      (input.incomeType === 'SALARY' ||
        input.incomeType === 'BUSINESS_HOUSEHOLD' ||
        input.incomeType === 'CONTRACT' ||
        input.incomeType === 'INDEPENDENT_PROFESSIONAL')
    );
  }

  public async calculate(inputRaw: TaxCalculationInput): Promise<TaxCalculationResult> {
    // If freelancer category, check if supported
    if (inputRaw.incomeType !== 'SALARY') {
      const flInput = inputRaw as VnFreelancerInput;
      // Per Section 5.7: Return UNSUPPORTED_CALCULATION if category is not yet verified with official authority
      return {
        country: 'VN',
        taxYear: flInput.taxYear,
        incomeType: flInput.incomeType,
        currency: 'VND',
        grossIncome: formatJurisdiction(flInput.revenue, 'VND'),
        businessExpenses: '0',
        netProfit: formatJurisdiction(flInput.revenue, 'VND'),
        taxableIncome: '0',
        federalTax: null,
        stateTax: null,
        localTax: null,
        socialSecurityTax: null,
        medicareTax: null,
        selfEmploymentTax: null,
        insuranceContributions: null,
        personalIncomeTax: null,
        totalTax: '0',
        totalDeductions: '0',
        estimatedTakeHome: formatJurisdiction(flInput.revenue, 'VND'),
        effectiveTaxRate: '0.00%',
        ruleVersion: 'VN-FL-DRAFT',
        calculationStatus: 'UNSUPPORTED_CALCULATION',
        isEstimate: true,
        breakdown: {
          notice:
            'Vietnam independent professional/freelancer calculation rules are currently pending official ministerial decree validation. Calculation halted per tax compliance policy.',
        },
        disclaimer: OFFICIAL_TAX_DISCLAIMER,
      };
    }

    const input = inputRaw as VnSalaryInput;
    const rule = TaxRuleRepository.findRule('VN', input.taxYear, 'SALARY');
    assertUsableRule(rule);

    const monthlyGross = toDecimal(input.monthlyGrossSalary);
    const otherIncome = toDecimal(input.otherTaxableIncome || 0);
    const totalGross = monthlyGross.plus(otherIncome);

    // 1. Insurance contributions
    const insuranceResult = calculateVietnamInsurance({
      monthlySalary: totalGross,
      customInsuranceBase: input.insuranceSalaryBase,
      baseSalary: rule.baseSalary || 2340000,
      regionalMinSalary: rule.regionalMinSalary || 4960000,
      participatesBhxh: input.participatesBhxh,
      participatesBhyt: input.participatesBhyt,
      participatesBhtn: input.participatesBhtn,
    });

    // 2. Personal Income Tax (PIT)
    const pitResult = calculateVietnamPit({
      monthlyGrossSalary: totalGross,
      insuranceDeduction: insuranceResult.employee.total,
      personalExemption: rule.personalExemption || 15500000,
      dependentExemption: rule.dependentExemption || 6200000,
      numberOfDependents: input.numberOfDependents || 0,
      otherDeductions: input.otherEligibleDeductions,
      taxResidencyStatus: input.taxResidencyStatus || 'RESIDENT',
      brackets: rule.brackets,
    });

    // 3. Vietnam Net Salary
    // Net Salary = Gross Salary - BHXH - BHYT - BHTN - PIT - Other Deductions
    const totalEmployeeTaxAndInsurance = pitResult.personalIncomeTax.plus(
      insuranceResult.employee.total
    );

    const netSalary = maxDecimal(
      new Decimal(0),
      totalGross.minus(totalEmployeeTaxAndInsurance)
    );

    const effectiveTaxRate = totalGross.greaterThan(0)
      ? totalEmployeeTaxAndInsurance.dividedBy(totalGross).times(100)
      : new Decimal(0);

    return {
      country: 'VN',
      taxYear: input.taxYear,
      incomeType: 'SALARY',
      currency: 'VND',

      grossIncome: formatJurisdiction(totalGross, 'VND'),
      businessExpenses: '0',
      netProfit: formatJurisdiction(totalGross, 'VND'),

      taxableIncome: formatJurisdiction(pitResult.taxableIncome, 'VND'),

      federalTax: null,
      stateTax: null,
      localTax: null,

      socialSecurityTax: null,
      medicareTax: null,
      selfEmploymentTax: null,

      insuranceContributions: formatJurisdiction(insuranceResult.employee.total, 'VND'),
      personalIncomeTax: formatJurisdiction(pitResult.personalIncomeTax, 'VND'),

      totalTax: formatJurisdiction(pitResult.personalIncomeTax, 'VND'),
      totalDeductions: formatJurisdiction(pitResult.totalEligibleDeductions, 'VND'),
      estimatedTakeHome: formatJurisdiction(netSalary, 'VND'),

      effectiveTaxRate: `${effectiveTaxRate.toFixed(2, Decimal.ROUND_HALF_UP)}%`,
      ruleVersion: rule.version,
      calculationStatus: 'COMPLETED',
      isEstimate: false,

      breakdown: {
        residencyStatus: input.taxResidencyStatus,
        numberOfDependents: input.numberOfDependents,
        personalExemption: formatJurisdiction(rule.personalExemption || 15500000, 'VND'),
        dependentExemptionUnit: formatJurisdiction(rule.dependentExemption || 6200000, 'VND'),
        dependentExemptionTotal: formatJurisdiction(pitResult.dependentDeductionTotal, 'VND'),

        employeeInsurance: {
          bhxh: formatJurisdiction(insuranceResult.employee.bhxh.amount, 'VND'),
          bhyt: formatJurisdiction(insuranceResult.employee.bhyt.amount, 'VND'),
          bhtn: formatJurisdiction(insuranceResult.employee.bhtn.amount, 'VND'),
          total: formatJurisdiction(insuranceResult.employee.total, 'VND'),
        },

        employerInsurance: {
          bhxh: formatJurisdiction(insuranceResult.employer.bhxh.amount, 'VND'),
          bhyt: formatJurisdiction(insuranceResult.employer.bhyt.amount, 'VND'),
          bhtn: formatJurisdiction(insuranceResult.employer.bhtn.amount, 'VND'),
          total: formatJurisdiction(insuranceResult.employer.total, 'VND'),
        },

        totalEmployerCost: formatJurisdiction(
          totalGross.plus(insuranceResult.employer.total),
          'VND'
        ),

        pitBracketsBreakdown: pitResult.bracketsBreakdown,
      },
      disclaimer: OFFICIAL_TAX_DISCLAIMER,
    };
  }
}

