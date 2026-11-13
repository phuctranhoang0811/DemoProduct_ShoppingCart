import { TaxCalculator } from './calculator.interface';
import { TaxCalculationInput, TaxCalculationInputSchema } from '../types/calculation-input';
import { TaxCalculationResult } from '../types/calculation-result';
import { UnsupportedCalculationError, ValidationError } from './errors';
import { Us1099Calculator } from '../countries/us/1099/us-1099-calculator';
import { UsW2Calculator } from '../countries/us/payroll/w2-calculator';
import { VietnamSalaryCalculator } from '../countries/vn/salary/gross-to-net';

export class TaxEngineService {
  private static calculators: TaxCalculator[] = [
    new Us1099Calculator(),
    new UsW2Calculator(),
    new VietnamSalaryCalculator(),
  ];

  public static async calculate(input: unknown): Promise<TaxCalculationResult> {
    // Validate input schema with Zod
    const parsed = TaxCalculationInputSchema.safeParse(input);
    if (!parsed.success) {
      const issues = parsed.error.issues || [];
      throw new ValidationError(
        'Invalid tax calculation input: ' +
          issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        issues
      );
    }

    const typedInput = parsed.data as TaxCalculationInput;

    const calculator = this.calculators.find((c) => c.supports(typedInput));
    if (!calculator) {
      throw new UnsupportedCalculationError(
        `No calculator registered for country: ${typedInput.country}, incomeType: ${typedInput.incomeType}`
      );
    }

    return await calculator.calculate(typedInput);
  }

  public static registerCalculator(calculator: TaxCalculator): void {
    this.calculators.unshift(calculator);
  }
}
