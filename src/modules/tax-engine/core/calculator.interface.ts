import { TaxCalculationInput } from '../types/calculation-input';
import { TaxCalculationResult } from '../types/calculation-result';

export interface TaxCalculator {
  supports(input: TaxCalculationInput): boolean;
  calculate(input: TaxCalculationInput): Promise<TaxCalculationResult>;
}

