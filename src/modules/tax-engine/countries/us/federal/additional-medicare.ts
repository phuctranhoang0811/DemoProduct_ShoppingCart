import { Decimal, toDecimal, maxDecimal } from '../../../core/money';
import { FilingStatus } from '../../../types/calculation-input';

export interface AdditionalMedicareInput {
  seEarnings: Decimal | number | string;
  w2Wages?: Decimal | number | string;
  filingStatus: FilingStatus;
}

export function getAdditionalMedicareThreshold(filingStatus: FilingStatus): Decimal {
  switch (filingStatus) {
    case 'MARRIED_FILING_JOINTLY':
      return new Decimal(250000);
    case 'MARRIED_FILING_SEPARATELY':
      return new Decimal(125000);
    case 'SINGLE':
    case 'HEAD_OF_HOUSEHOLD':
    case 'QUALIFYING_SURVIVING_SPOUSE':
    default:
      return new Decimal(200000);
  }
}

export function calculateAdditionalMedicareTax(input: AdditionalMedicareInput): {
  threshold: Decimal;
  combinedMedicareIncome: Decimal;
  excessIncome: Decimal;
  additionalMedicareTax: Decimal;
} {
  const se = toDecimal(input.seEarnings);
  const w2 = toDecimal(input.w2Wages || 0);
  const threshold = getAdditionalMedicareThreshold(input.filingStatus);

  const combinedMedicareIncome = se.plus(w2);
  const excessIncome = maxDecimal(new Decimal(0), combinedMedicareIncome.minus(threshold));
  const ADDITIONAL_MEDICARE_RATE = new Decimal('0.009'); // 0.9%

  const additionalMedicareTax = excessIncome.times(ADDITIONAL_MEDICARE_RATE);

  return {
    threshold,
    combinedMedicareIncome,
    excessIncome,
    additionalMedicareTax,
  };
}

