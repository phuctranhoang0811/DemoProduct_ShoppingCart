import { Decimal, toDecimal, maxDecimal } from '../../../core/money';
import { calculateProgressiveTax, TaxBracket } from '../../../core/progressive-tax';

export interface StateTaxInput {
  state: string;
  taxableIncome: Decimal;
  filingStatus: string;
}

export interface StateTaxResult {
  state: string;
  isSupported: boolean;
  stateTaxAmount: Decimal;
  notes: string;
  effectiveStateRate: Decimal;
}

// Zero-income-tax states
const NO_INCOME_TAX_STATES = ['TX', 'FL', 'WA', 'NV', 'WY', 'SD', 'TN', 'AK'];

// California progressive brackets (Single sample, progressive)
const CA_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, max: 10412, rate: 0.01 },
  { min: 10412, max: 24684, rate: 0.02 },
  { min: 24684, max: 38959, rate: 0.04 },
  { min: 38959, max: 54081, rate: 0.06 },
  { min: 54081, max: 68350, rate: 0.08 },
  { min: 68350, max: 349137, rate: 0.093 },
  { min: 349137, max: 418961, rate: 0.103 },
  { min: 418961, max: 698271, rate: 0.113 },
  { min: 698271, max: null, rate: 0.123 },
];

// New York State progressive brackets (Single sample)
const NY_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.055 },
  { min: 80650, max: 215400, rate: 0.06 },
  { min: 215400, max: 1077550, rate: 0.0685 },
  { min: 1077550, max: null, rate: 0.0965 },
];

export class StateTaxService {
  public static calculateStateTax(input: StateTaxInput): StateTaxResult {
    const stateUpper = input.state.trim().toUpperCase();
    const income = toDecimal(input.taxableIncome);

    if (NO_INCOME_TAX_STATES.includes(stateUpper)) {
      return {
        state: stateUpper,
        isSupported: true,
        stateTaxAmount: new Decimal(0),
        notes: `${stateUpper} imposes no individual state earned income tax.`,
        effectiveStateRate: new Decimal(0),
      };
    }

    if (stateUpper === 'IL') {
      // Illinois flat 4.95%
      const FLAT_RATE = new Decimal('0.0495');
      const tax = maxDecimal(new Decimal(0), income.times(FLAT_RATE));
      return {
        state: 'IL',
        isSupported: true,
        stateTaxAmount: tax,
        notes: 'Illinois flat income tax rate of 4.95%.',
        effectiveStateRate: income.greaterThan(0) ? tax.dividedBy(income) : new Decimal(0),
      };
    }

    if (stateUpper === 'PA') {
      // Pennsylvania flat 3.07%
      const FLAT_RATE = new Decimal('0.0307');
      const tax = maxDecimal(new Decimal(0), income.times(FLAT_RATE));
      return {
        state: 'PA',
        isSupported: true,
        stateTaxAmount: tax,
        notes: 'Pennsylvania flat income tax rate of 3.07%.',
        effectiveStateRate: income.greaterThan(0) ? tax.dividedBy(income) : new Decimal(0),
      };
    }

    if (stateUpper === 'CA') {
      const progressive = calculateProgressiveTax(income, CA_BRACKETS_SINGLE);
      return {
        state: 'CA',
        isSupported: true,
        stateTaxAmount: progressive.totalTax,
        notes: 'California Franchise Tax Board progressive state income tax.',
        effectiveStateRate: income.greaterThan(0) ? progressive.totalTax.dividedBy(income) : new Decimal(0),
      };
    }

    if (stateUpper === 'NY') {
      const progressive = calculateProgressiveTax(income, NY_BRACKETS_SINGLE);
      return {
        state: 'NY',
        isSupported: true,
        stateTaxAmount: progressive.totalTax,
        notes: 'New York Department of Taxation and Finance progressive tax schedule.',
        effectiveStateRate: income.greaterThan(0) ? progressive.totalTax.dividedBy(income) : new Decimal(0),
      };
    }

    // Explicitly return unsupported status per specification Section 3.2 Step 11
    return {
      state: stateUpper,
      isSupported: false,
      stateTaxAmount: new Decimal(0),
      notes: `State tax rules for ${stateUpper} are pending official rule verification. Returned explicit incomplete status.`,
      effectiveStateRate: new Decimal(0),
    };
  }
}

