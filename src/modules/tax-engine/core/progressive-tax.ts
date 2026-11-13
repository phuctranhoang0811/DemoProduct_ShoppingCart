import { Decimal, toDecimal, maxDecimal, minDecimal } from './money';

export interface TaxBracket {
  min: Decimal | number | string;
  max: Decimal | number | string | null;
  rate: Decimal | number | string; // rate expressed as decimal, e.g. 0.10 for 10% or decimal percentage
}

export interface BracketDetail {
  bracketIndex: number;
  min: string;
  max: string | null;
  rate: string;
  taxableInBracket: string;
  taxInBracket: string;
}

export interface ProgressiveTaxResult {
  totalTax: Decimal;
  bracketsBreakdown: BracketDetail[];
}

export function calculateProgressiveTax(
  taxableIncomeInput: Decimal | number | string,
  brackets: TaxBracket[]
): ProgressiveTaxResult {
  const taxableIncome = toDecimal(taxableIncomeInput);
  if (taxableIncome.lessThanOrEqualTo(0) || brackets.length === 0) {
    return {
      totalTax: new Decimal(0),
      bracketsBreakdown: brackets.map((b, idx) => ({
        bracketIndex: idx + 1,
        min: toDecimal(b.min).toString(),
        max: b.max !== null ? toDecimal(b.max).toString() : null,
        rate: toDecimal(b.rate).toString(),
        taxableInBracket: '0',
        taxInBracket: '0',
      })),
    };
  }

  let totalTax = new Decimal(0);
  const bracketsBreakdown: BracketDetail[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const bMin = toDecimal(bracket.min);
    const bMax = bracket.max !== null ? toDecimal(bracket.max) : null;
    const bRate = toDecimal(bracket.rate);

    // If taxable income doesn't reach the bracket minimum, 0 tax in this bracket
    if (taxableIncome.lessThanOrEqualTo(bMin)) {
      bracketsBreakdown.push({
        bracketIndex: i + 1,
        min: bMin.toString(),
        max: bMax ? bMax.toString() : null,
        rate: bRate.toString(),
        taxableInBracket: '0',
        taxInBracket: '0',
      });
      continue;
    }

    // Upper bound of taxable amount in this bracket
    const upperLimit = bMax !== null ? minDecimal(taxableIncome, bMax) : taxableIncome;
    const taxableInBracket = maxDecimal(new Decimal(0), upperLimit.minus(bMin));
    const taxInBracket = taxableInBracket.times(bRate);

    totalTax = totalTax.plus(taxInBracket);

    bracketsBreakdown.push({
      bracketIndex: i + 1,
      min: bMin.toString(),
      max: bMax ? bMax.toString() : null,
      rate: bRate.toString(),
      taxableInBracket: taxableInBracket.toString(),
      taxInBracket: taxInBracket.toString(),
    });
  }

  return {
    totalTax,
    bracketsBreakdown,
  };
}

