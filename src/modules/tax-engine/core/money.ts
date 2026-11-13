import Decimal from 'decimal.js';

// Configure standard precision for tax calculations
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function toDecimal(value: string | number | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  try {
    return new Decimal(value);
  } catch {
    return new Decimal(0);
  }
}

export function formatMoney(value: Decimal | string | number, decimals: number = 2): string {
  const dec = toDecimal(value);
  return dec.toFixed(decimals, Decimal.ROUND_HALF_UP);
}

export function isPositive(value: Decimal | string | number): boolean {
  return toDecimal(value).isPositive() && !toDecimal(value).isZero();
}

export function isNonNegative(value: Decimal | string | number): boolean {
  return toDecimal(value).greaterThanOrEqualTo(0);
}

export function maxDecimal(a: Decimal, b: Decimal): Decimal {
  return a.greaterThan(b) ? a : b;
}

export function minDecimal(a: Decimal, b: Decimal): Decimal {
  return a.lessThan(b) ? a : b;
}

