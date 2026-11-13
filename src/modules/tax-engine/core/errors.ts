export class TaxEngineError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code: string = 'TAX_ENGINE_ERROR', details?: unknown) {
    super(message);
    this.name = 'TaxEngineError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends TaxEngineError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RuleNotFoundError extends TaxEngineError {
  constructor(country: string, taxYear: number, incomeType: string) {
    super(
      `Tax rules not found for country: ${country}, taxYear: ${taxYear}, incomeType: ${incomeType}`,
      'RULE_NOT_FOUND',
      { country, taxYear, incomeType }
    );
    this.name = 'RuleNotFoundError';
  }
}

export class UnsupportedCalculationError extends TaxEngineError {
  constructor(reason: string, details?: unknown) {
    super(reason, 'UNSUPPORTED_CALCULATION', details);
    this.name = 'UnsupportedCalculationError';
  }
}

