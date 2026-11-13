import { TaxRuleSetDefinition } from './tax-rule.version';
import { ValidationError } from '../core/errors';

export function validateTaxRuleSet(rule: TaxRuleSetDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!rule.country || !rule.taxYear || !rule.incomeType) {
    errors.push('Missing essential rule identifiers (country, taxYear, incomeType)');
  }

  if (!rule.sourceReference) {
    errors.push('Missing official tax source reference');
  }

  // Validate brackets if present
  if (rule.brackets && rule.brackets.length > 0) {
    let lastMax = -1;

    for (let i = 0; i < rule.brackets.length; i++) {
      const b = rule.brackets[i];

      if (b.rate < 0 || b.rate > 1) {
        errors.push(`Bracket ${i + 1} rate must be between 0 and 1, got ${b.rate}`);
      }

      if (b.min < 0) {
        errors.push(`Bracket ${i + 1} min must be non-negative, got ${b.min}`);
      }

      if (b.max !== null && b.max <= b.min) {
        errors.push(`Bracket ${i + 1} max (${b.max}) must be strictly greater than min (${b.min})`);
      }

      if (i > 0 && b.min < lastMax) {
        errors.push(`Bracket ${i + 1} overlaps with preceding bracket (min ${b.min} < lastMax ${lastMax})`);
      }

      lastMax = b.max !== null ? b.max : Infinity;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertUsableRule(rule: TaxRuleSetDefinition): void {
  if (rule.status !== 'PUBLISHED' && rule.status !== 'VALIDATED') {
    throw new ValidationError(
      `Cannot execute calculation with non-published tax rule version ${rule.version} (status: ${rule.status})`
    );
  }
}

