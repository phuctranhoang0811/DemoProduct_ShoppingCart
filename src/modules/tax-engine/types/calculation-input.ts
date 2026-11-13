import { z } from 'zod';

export const FilingStatusEnum = z.enum([
  'SINGLE',
  'MARRIED_FILING_JOINTLY',
  'MARRIED_FILING_SEPARATELY',
  'HEAD_OF_HOUSEHOLD',
  'QUALIFYING_SURVIVING_SPOUSE',
]);
export type FilingStatus = z.infer<typeof FilingStatusEnum>;

export const PayFrequencyEnum = z.enum([
  'HOURLY',
  'WEEKLY',
  'BIWEEKLY',
  'SEMIMONTHLY',
  'MONTHLY',
  'ANNUALLY',
]);
export type PayFrequency = z.infer<typeof PayFrequencyEnum>;

export const ResidencyStatusEnum = z.enum(['RESIDENT', 'NON_RESIDENT']);
export type ResidencyStatus = z.infer<typeof ResidencyStatusEnum>;

// US 1099 Input Schema
export const Us1099InputSchema = z.object({
  country: z.literal('US'),
  incomeType: z.literal('1099'),
  taxYear: z.number().int().min(2020).max(2030),
  grossBusinessIncome: z.string().or(z.number()).refine((val) => Number(val) >= 0, {
    message: 'Gross Business Income must be non-negative',
  }),
  businessExpenses: z.string().or(z.number()).refine((val) => Number(val) >= 0, {
    message: 'Business Expenses must be non-negative',
  }),
  filingStatus: FilingStatusEnum,
  state: z.string().min(2).max(50),
  otherW2Income: z.string().or(z.number()).optional(),
  otherIncome: z.string().or(z.number()).optional(),
  estimatedTaxPayments: z.string().or(z.number()).optional(),
  otherAdjustments: z.string().or(z.number()).optional(),
  qualifiedBusinessIncome: z.string().or(z.number()).optional(),
  hasItemizedDeductions: z.boolean().optional(),
  itemizedDeductionAmount: z.string().or(z.number()).optional(),
});
export type Us1099Input = z.infer<typeof Us1099InputSchema>;

// US W-2 Input Schema
export const UsW2InputSchema = z.object({
  country: z.literal('US'),
  incomeType: z.literal('W2'),
  taxYear: z.number().int().min(2020).max(2030),
  annualGrossSalary: z.string().or(z.number()).refine((val) => Number(val) >= 0, {
    message: 'Annual Gross Salary must be non-negative',
  }),
  payFrequency: PayFrequencyEnum.default('ANNUALLY'),
  filingStatus: FilingStatusEnum,
  state: z.string().min(2).max(50),
  localTaxJurisdiction: z.string().optional(),
  preTaxDeductions: z.string().or(z.number()).optional(),
  postTaxDeductions: z.string().or(z.number()).optional(),
  otherIncome: z.string().or(z.number()).optional(),
});
export type UsW2Input = z.infer<typeof UsW2InputSchema>;

// Vietnam Gross-to-Net Input Schema
export const VnSalaryInputSchema = z.object({
  country: z.literal('VN'),
  incomeType: z.literal('SALARY'),
  taxYear: z.number().int().min(2020).max(2030),
  monthlyGrossSalary: z.string().or(z.number()).refine((val) => Number(val) >= 0, {
    message: 'Monthly Gross Salary must be non-negative',
  }),
  taxResidencyStatus: ResidencyStatusEnum.default('RESIDENT'),
  numberOfDependents: z.number().int().min(0).default(0),
  insuranceSalaryBase: z.string().or(z.number()).optional(),
  participatesBhxh: z.boolean().default(true),
  participatesBhyt: z.boolean().default(true),
  participatesBhtn: z.boolean().default(true),
  otherTaxableIncome: z.string().or(z.number()).optional(),
  otherEligibleDeductions: z.string().or(z.number()).optional(),
});
export type VnSalaryInput = z.infer<typeof VnSalaryInputSchema>;

// Vietnam Freelancer Input Schema
export const VnFreelancerInputSchema = z.object({
  country: z.literal('VN'),
  incomeType: z.enum(['BUSINESS_HOUSEHOLD', 'CONTRACT', 'INDEPENDENT_PROFESSIONAL']),
  taxYear: z.number().int().min(2020).max(2030),
  revenue: z.string().or(z.number()),
  taxResidencyStatus: ResidencyStatusEnum.default('RESIDENT'),
  industrySector: z.string().optional(),
});
export type VnFreelancerInput = z.infer<typeof VnFreelancerInputSchema>;

// Generic Input Union
export const TaxCalculationInputSchema = z.union([
  Us1099InputSchema,
  UsW2InputSchema,
  VnSalaryInputSchema,
  VnFreelancerInputSchema,
]);

export type TaxCalculationInput =
  | Us1099Input
  | UsW2Input
  | VnSalaryInput
  | VnFreelancerInput;
