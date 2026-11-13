import { Decimal, toDecimal } from './money';

export function roundJurisdiction(value: Decimal | string | number, currency: string): Decimal {
  const dec = toDecimal(value);
  if (currency.toUpperCase() === 'VND') {
    return dec.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  }
  // USD and most fiat defaults to 2 decimal places
  return dec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function formatJurisdiction(value: Decimal | string | number, currency: string): string {
  const rounded = roundJurisdiction(value, currency);
  if (currency.toUpperCase() === 'VND') {
    return rounded.toFixed(0);
  }
  return rounded.toFixed(2);
}

