import { Decimal, toDecimal, minDecimal } from '../../../core/money';

export interface VietnamInsuranceInput {
  monthlySalary: Decimal | number | string;
  customInsuranceBase?: Decimal | number | string;
  baseSalary: Decimal | number | string; // 2,340,000 VND
  regionalMinSalary: Decimal | number | string; // 4,960,000 VND
  participatesBhxh?: boolean;
  participatesBhyt?: boolean;
  participatesBhtn?: boolean;
}

export interface InsuranceItem {
  rate: Decimal;
  amount: Decimal;
  cappedBase: Decimal;
}

export interface VietnamInsuranceResult {
  employee: {
    bhxh: InsuranceItem;
    bhyt: InsuranceItem;
    bhtn: InsuranceItem;
    total: Decimal;
  };
  employer: {
    bhxh: InsuranceItem;
    bhyt: InsuranceItem;
    bhtn: InsuranceItem;
    total: Decimal;
  };
}

export function calculateVietnamInsurance(input: VietnamInsuranceInput): VietnamInsuranceResult {
  const salary = toDecimal(input.monthlySalary);
  const baseSalary = toDecimal(input.baseSalary);
  const regionalMin = toDecimal(input.regionalMinSalary);

  const appliedBase = input.customInsuranceBase ? toDecimal(input.customInsuranceBase) : salary;

  // Legal caps:
  // BHXH & BHYT capped at 20 times statutory base salary
  const capBhxhBhyt = baseSalary.times(20);
  const bhxhBhytSalaryBase = minDecimal(appliedBase, capBhxhBhyt);

  // BHTN capped at 20 times regional minimum wage
  const capBhtn = regionalMin.times(20);
  const bhtnSalaryBase = minDecimal(appliedBase, capBhtn);

  // Employee Rates: BHXH 8%, BHYT 1.5%, BHTN 1%
  const empBhxhRate = input.participatesBhxh !== false ? new Decimal('0.08') : new Decimal(0);
  const empBhytRate = input.participatesBhyt !== false ? new Decimal('0.015') : new Decimal(0);
  const empBhtnRate = input.participatesBhtn !== false ? new Decimal('0.01') : new Decimal(0);

  const empBhxh = bhxhBhytSalaryBase.times(empBhxhRate);
  const empBhyt = bhxhBhytSalaryBase.times(empBhytRate);
  const empBhtn = bhtnSalaryBase.times(empBhtnRate);
  const empTotal = empBhxh.plus(empBhyt).plus(empBhtn);

  // Employer Rates: BHXH 17.5%, BHYT 3%, BHTN 1%
  const erBhxhRate = input.participatesBhxh !== false ? new Decimal('0.175') : new Decimal(0);
  const erBhytRate = input.participatesBhyt !== false ? new Decimal('0.03') : new Decimal(0);
  const erBhtnRate = input.participatesBhtn !== false ? new Decimal('0.01') : new Decimal(0);

  const erBhxh = bhxhBhytSalaryBase.times(erBhxhRate);
  const erBhyt = bhxhBhytSalaryBase.times(erBhytRate);
  const erBhtn = bhtnSalaryBase.times(erBhtnRate);
  const erTotal = erBhxh.plus(erBhyt).plus(erBhtn);

  return {
    employee: {
      bhxh: { rate: empBhxhRate, amount: empBhxh, cappedBase: bhxhBhytSalaryBase },
      bhyt: { rate: empBhytRate, amount: empBhyt, cappedBase: bhxhBhytSalaryBase },
      bhtn: { rate: empBhtnRate, amount: empBhtn, cappedBase: bhtnSalaryBase },
      total: empTotal,
    },
    employer: {
      bhxh: { rate: erBhxhRate, amount: erBhxh, cappedBase: bhxhBhytSalaryBase },
      bhyt: { rate: erBhytRate, amount: erBhyt, cappedBase: bhxhBhytSalaryBase },
      bhtn: { rate: erBhtnRate, amount: erBhtn, cappedBase: bhtnSalaryBase },
      total: erTotal,
    },
  };
}

