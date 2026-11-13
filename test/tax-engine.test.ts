import { Decimal, toDecimal } from '../src/modules/tax-engine/core/money';
import { calculateProgressiveTax } from '../src/modules/tax-engine/core/progressive-tax';
import { calculateSelfEmploymentTax } from '../src/modules/tax-engine/countries/us/federal/self-employment-tax';
import { calculateAdditionalMedicareTax, getAdditionalMedicareThreshold } from '../src/modules/tax-engine/countries/us/federal/additional-medicare';
import { Us1099Calculator } from '../src/modules/tax-engine/countries/us/1099/us-1099-calculator';
import { UsW2Calculator, getPeriodsPerYear } from '../src/modules/tax-engine/countries/us/payroll/w2-calculator';
import { calculateVietnamInsurance } from '../src/modules/tax-engine/countries/vn/insurance/insurance-calculator';
import { calculateVietnamPit } from '../src/modules/tax-engine/countries/vn/pit/pit-calculator';
import { VietnamSalaryCalculator } from '../src/modules/tax-engine/countries/vn/salary/gross-to-net';
import { StateTaxService } from '../src/modules/tax-engine/countries/us/state/state-tax.service';
import { TaxRuleRepository } from '../src/modules/tax-engine/rules/tax-rule.repository';
import { validateTaxRuleSet } from '../src/modules/tax-engine/rules/tax-rule.validator';
import { TaxEngineService } from '../src/modules/tax-engine/core/tax-engine.service';
import { CalculationHistoryStore } from '../src/modules/tax-engine/core/history-store';

describe('1. Financial Math & Progressive Tax Brackets', () => {
  it('correctly calculates progressive brackets without applying marginal rate to full income', () => {
    const brackets = [
      { min: 0, max: 10000, rate: 0.1 },
      { min: 10000, max: 30000, rate: 0.2 },
      { min: 30000, max: null, rate: 0.3 },
    ];
    const result = calculateProgressiveTax(25000, brackets);
    expect(result.totalTax.toNumber()).toBe(4000);
    expect(result.bracketsBreakdown.length).toBe(3);
    expect(result.bracketsBreakdown[0].taxInBracket).toBe('1000');
    expect(result.bracketsBreakdown[1].taxInBracket).toBe('3000');
    expect(result.bracketsBreakdown[2].taxInBracket).toBe('0');
  });

  it('returns 0 tax for zero or negative income', () => {
    const brackets = [{ min: 0, max: 10000, rate: 0.1 }];
    const resZero = calculateProgressiveTax(0, brackets);
    expect(resZero.totalTax.toNumber()).toBe(0);

    const resNeg = calculateProgressiveTax(-5000, brackets);
    expect(resNeg.totalTax.toNumber()).toBe(0);
  });
});

describe('2. US 1099 Self-Employment Tax Engine', () => {
  it('calculates net business profit, 92.35% SE earnings, and SE tax below wage base', () => {
    const se = calculateSelfEmploymentTax({
      grossBusinessIncome: 100000,
      businessExpenses: 20000,
      socialSecurityWageBase: 184500,
    });

    expect(se.netProfit.toNumber()).toBe(80000);
    expect(se.seEarnings.toNumber()).toBeCloseTo(73880, 2);
    expect(se.socialSecurityTax.toNumber()).toBeCloseTo(9161.12, 2);
    expect(se.medicareTax.toNumber()).toBeCloseTo(2142.52, 2);
    expect(se.deductibleHalfSETax.toNumber()).toBeCloseTo(5651.82, 2);
  });

  it('caps Social Security tax at wage base ($184,500) and accounts for existing W-2 income', () => {
    const se = calculateSelfEmploymentTax({
      grossBusinessIncome: 120000,
      businessExpenses: 11629.67,
      otherW2Income: 150000,
      socialSecurityWageBase: 184500,
    });

    expect(se.applicableSSWages.toNumber()).toBe(34500);
    expect(se.socialSecurityTax.toNumber()).toBe(4278);
  });

  it('calculates Additional Medicare Tax for income exceeding thresholds across filing statuses', () => {
    expect(getAdditionalMedicareThreshold('SINGLE').toNumber()).toBe(200000);
    expect(getAdditionalMedicareThreshold('MARRIED_FILING_JOINTLY').toNumber()).toBe(250000);
    expect(getAdditionalMedicareThreshold('MARRIED_FILING_SEPARATELY').toNumber()).toBe(125000);

    const addlSingle = calculateAdditionalMedicareTax({
      seEarnings: 250000,
      filingStatus: 'SINGLE',
    });
    expect(addlSingle.excessIncome.toNumber()).toBe(50000);
    expect(addlSingle.additionalMedicareTax.toNumber()).toBe(450);

    const addlMfj = calculateAdditionalMedicareTax({
      seEarnings: 300000,
      filingStatus: 'MARRIED_FILING_JOINTLY',
    });
    expect(addlMfj.excessIncome.toNumber()).toBe(50000);
    expect(addlMfj.additionalMedicareTax.toNumber()).toBe(450);
  });

  it('executes full US 1099 calculation with Texas (0% state tax) and verifies take-home', async () => {
    const calc = new Us1099Calculator();
    const result = await calc.calculate({
      country: 'US',
      incomeType: '1099',
      taxYear: 2026,
      grossBusinessIncome: '120000',
      businessExpenses: '20000',
      filingStatus: 'SINGLE',
      state: 'TX',
      estimatedTaxPayments: '5000',
    });

    expect(result.country).toBe('US');
    expect(result.grossIncome).toBe('120000.00');
    expect(result.netProfit).toBe('100000.00');
    expect(result.stateTax).toBe('0.00');
    expect(Number(result.totalTax)).toBeGreaterThan(0);
    expect(Number(result.estimatedTakeHome)).toBeGreaterThan(0);
    expect(result.calculationStatus).toBe('COMPLETED');
    expect((result.breakdown as any).estimatedTaxPayments).toBe('5000.00');
  });

  it('supports itemized deduction when exceeding standard deduction', async () => {
    const calc = new Us1099Calculator();
    const result = await calc.calculate({
      country: 'US',
      incomeType: '1099',
      taxYear: 2026,
      grossBusinessIncome: '150000',
      businessExpenses: '10000',
      filingStatus: 'SINGLE',
      state: 'TX',
      hasItemizedDeductions: true,
      itemizedDeductionAmount: '25000',
    });

    const breakdown = result.breakdown as any;
    expect(breakdown.isItemized).toBe(true);
    expect(breakdown.standardDeduction).toBe('25000.00');
  });
});

describe('3. US W-2 Salary Calculator Engine', () => {
  it('correctly maps pay frequencies to pay periods', () => {
    expect(getPeriodsPerYear('HOURLY')).toBe(2080);
    expect(getPeriodsPerYear('WEEKLY')).toBe(52);
    expect(getPeriodsPerYear('BIWEEKLY')).toBe(26);
    expect(getPeriodsPerYear('SEMIMONTHLY')).toBe(24);
    expect(getPeriodsPerYear('MONTHLY')).toBe(12);
    expect(getPeriodsPerYear('ANNUALLY')).toBe(1);
  });

  it('calculates employee FICA, federal withholding, and reports employer contributions separately', async () => {
    const calc = new UsW2Calculator();
    const result = await calc.calculate({
      country: 'US',
      incomeType: 'W2',
      taxYear: 2026,
      annualGrossSalary: '100000',
      payFrequency: 'MONTHLY',
      filingStatus: 'SINGLE',
      state: 'TX',
      preTaxDeductions: '5000',
    });

    expect(result.grossIncome).toBe('100000.00');
    expect(result.socialSecurityTax).toBe('6200.00');
    expect(result.medicareTax).toBe('1450.00');
    expect(Number(result.estimatedTakeHome)).toBeLessThan(100000);

    const breakdown = result.breakdown as any;
    expect(breakdown.employerSocialSecurity).toBe('6200.00');
    expect(breakdown.employerMedicare).toBe('1450.00');
    expect(breakdown.perPeriodGross).toBe('8333.33');
  });

  it('verifies state tax services for zero tax (FL, TX) and progressive (CA, NY) and flat (IL, PA)', () => {
    const tx = StateTaxService.calculateStateTax({ state: 'TX', taxableIncome: new Decimal(100000), filingStatus: 'SINGLE' });
    expect(tx.stateTaxAmount.toNumber()).toBe(0);

    const fl = StateTaxService.calculateStateTax({ state: 'FL', taxableIncome: new Decimal(100000), filingStatus: 'SINGLE' });
    expect(fl.stateTaxAmount.toNumber()).toBe(0);

    const il = StateTaxService.calculateStateTax({ state: 'IL', taxableIncome: new Decimal(100000), filingStatus: 'SINGLE' });
    expect(il.stateTaxAmount.toNumber()).toBe(4950);

    const pa = StateTaxService.calculateStateTax({ state: 'PA', taxableIncome: new Decimal(100000), filingStatus: 'SINGLE' });
    expect(pa.stateTaxAmount.toNumber()).toBe(3070);

    const unverified = StateTaxService.calculateStateTax({ state: 'ZZ', taxableIncome: new Decimal(100000), filingStatus: 'SINGLE' });
    expect(unverified.isSupported).toBe(false);
  });
});

describe('4. Vietnam Gross-to-Net Salary Calculator Engine', () => {
  it('calculates employee insurance contributions subject to base salary and regional caps', () => {
    const ins = calculateVietnamInsurance({
      monthlySalary: 100000000,
      baseSalary: 2340000,
      regionalMinSalary: 4960000,
    });

    expect(ins.employee.bhxh.amount.toNumber()).toBe(3744000);
    expect(ins.employee.bhyt.amount.toNumber()).toBe(702000);
    expect(ins.employee.bhtn.amount.toNumber()).toBe(992000);
    expect(ins.employee.total.toNumber()).toBe(5438000);

    // Employer insurance calculation
    expect(ins.employer.bhxh.amount.toNumber()).toBe(8190000);
    expect(ins.employer.bhyt.amount.toNumber()).toBe(1404000);
    expect(ins.employer.bhtn.amount.toNumber()).toBe(992000);
  });

  it('calculates 2026 5-bracket progressive PIT with 15.5M personal deduction', () => {
    const brackets = [
      { min: 0, max: 10000000, rate: 0.05 },
      { min: 10000000, max: 30000000, rate: 0.1 },
      { min: 30000000, max: 60000000, rate: 0.2 },
      { min: 60000000, max: 100000000, rate: 0.3 },
      { min: 100000000, max: null, rate: 0.35 },
    ];

    const pit = calculateVietnamPit({
      monthlyGrossSalary: 50000000,
      insuranceDeduction: 5250000,
      personalExemption: 15500000,
      dependentExemption: 6200000,
      numberOfDependents: 1,
      taxResidencyStatus: 'RESIDENT',
      brackets,
    });

    expect(pit.taxableIncome.toNumber()).toBe(23050000);
    expect(pit.personalIncomeTax.toNumber()).toBe(1805000);
  });

  it('applies flat 20% PIT without deductions for non-resident status', () => {
    const brackets = [{ min: 0, max: 10000000, rate: 0.05 }];
    const pit = calculateVietnamPit({
      monthlyGrossSalary: 30000000,
      insuranceDeduction: 0,
      personalExemption: 15500000,
      dependentExemption: 6200000,
      numberOfDependents: 0,
      taxResidencyStatus: 'NON_RESIDENT',
      brackets,
    });

    expect(pit.personalIncomeTax.toNumber()).toBe(6000000);
  });

  it('returns UNSUPPORTED_CALCULATION status for unverified Vietnam freelancer category', async () => {
    const calc = new VietnamSalaryCalculator();
    const result = await calc.calculate({
      country: 'VN',
      incomeType: 'BUSINESS_HOUSEHOLD',
      taxYear: 2026,
      revenue: 50000000,
    });

    expect(result.calculationStatus).toBe('UNSUPPORTED_CALCULATION');
  });

  it('executes full Vietnam gross-to-net calculation and returns 0-decimal formatted VND', async () => {
    const calc = new VietnamSalaryCalculator();
    const result = await calc.calculate({
      country: 'VN',
      incomeType: 'SALARY',
      taxYear: 2026,
      monthlyGrossSalary: '40000000',
      taxResidencyStatus: 'RESIDENT',
      numberOfDependents: 0,
    });

    expect(result.currency).toBe('VND');
    expect(result.grossIncome).toBe('40000000');
    expect(Number(result.insuranceContributions)).toBeGreaterThan(0);
    expect(Number(result.personalIncomeTax)).toBeGreaterThan(0);
    expect(Number(result.estimatedTakeHome)).toBeLessThan(40000000);
    expect(result.calculationStatus).toBe('COMPLETED');
  });
});

describe('5. Rule Repository, Validator & Audit Logging', () => {
  it('validates bracket integrity and rejects inverted thresholds', () => {
    const invalidRule: any = {
      country: 'US',
      taxYear: 2026,
      incomeType: '1099',
      sourceReference: 'https://irs.gov',
      brackets: [
        { min: 50000, max: 10000, rate: 0.1 }, // min > max
      ],
    };
    const check = validateTaxRuleSet(invalidRule);
    expect(check.valid).toBe(false);
    expect(check.errors.length).toBeGreaterThan(0);
  });

  it('persists calculations into history store and records audit log on deletion', () => {
    const input: any = { country: 'US', incomeType: 'W2', taxYear: 2026, annualGrossSalary: '90000', filingStatus: 'SINGLE', state: 'TX' };
    const mockResult: any = { country: 'US', taxYear: 2026, incomeType: 'W2', currency: 'USD', grossIncome: '90000.00', totalTax: '15000.00', estimatedTakeHome: '75000.00', effectiveTaxRate: '16.67%', ruleVersion: 'v1', calculationStatus: 'COMPLETED' };

    const record = CalculationHistoryStore.saveCalculation(input, mockResult, 'usr_test');
    expect(record.id).toBeDefined();

    const retrieved = CalculationHistoryStore.getCalculation(record.id);
    expect(retrieved?.grossIncome).toBe('90000.00');

    const deleted = CalculationHistoryStore.deleteCalculation(record.id, 'usr_test');
    expect(deleted).toBe(true);

    const logs = CalculationHistoryStore.listAuditLogs(10);
    expect(logs.some((l) => l.action === 'DELETE_CALCULATION' && l.entityId === record.id)).toBe(true);
  });
});

describe('6. TaxEngineService Validation & Dispatcher', () => {
  it('throws ValidationError when negative gross salary is provided', async () => {
    await expect(
      TaxEngineService.calculate({
        country: 'US',
        incomeType: 'W2',
        taxYear: 2026,
        annualGrossSalary: -50000,
        filingStatus: 'SINGLE',
        state: 'TX',
      })
    ).rejects.toThrow();
  });

  it('executes end-to-end calculation through TaxEngineService', async () => {
    const result = await TaxEngineService.calculate({
      country: 'VN',
      incomeType: 'SALARY',
      taxYear: 2026,
      monthlyGrossSalary: 25000000,
      taxResidencyStatus: 'RESIDENT',
      numberOfDependents: 0,
    });
    expect(result.country).toBe('VN');
    expect(result.currency).toBe('VND');
    expect(result.calculationStatus).toBe('COMPLETED');
  });
});
