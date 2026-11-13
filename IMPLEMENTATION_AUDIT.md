# IMPLEMENTATION AUDIT: MULTI-COUNTRY SALARY & TAX CALCULATOR

**Date:** November 2026  
**Project:** Multi-Country Salary & Tax Calculator Engine  
**Target Environment:** Next.js 14 (App Router) + TypeScript + PostgreSQL / Prisma  

---

## 1. Executive Summary

This audit assesses the existing codebase and outlines the complete integration strategy for the Multi-Country Salary & Tax Calculation Engine (US 1099, US W-2, Vietnam Gross-to-Net) into the current Next.js project.

In accordance with user instructions:
1. All website UI text and currency have been defaulted and aligned to English and USD ($), with the Vietnamese UI selector temporarily hidden.
2. The tax engine, database schema, official rules repository, REST APIs, and UI calculators are implemented following the architectural specifications in the project mandate.

---

## 2. Codebase & Architectural Analysis

### 2.1 Existing Architecture
- **Framework:** Next.js 14.2.15 (App Router).
- **Styling:** Tailwind CSS with a minimalist monochrome palette.
- **State Management:** Zustand with local persistence for client-side storage.
- **UI Components:** Lucide React icons, Recharts for analytics, Sonner for notifications.
- **Language & Formatting:** Multi-language i18n structure with English and Vietnamese dictionaries; unified price formatting utility supporting USD and VND.

### 2.2 Missing Tax Engine Components
- No backend tax engine or decimal arithmetic modules previously existed.
- No tax bracket management, database models for rule versioning, or calculation history existed.
- No endpoints existed for `/api/calculate`, `/api/tax-rules`, or `/api/calculations`.

---

## 3. Implementation Plan & Scope Mapping

### Module Structure (`modules/tax-engine`)
```text
modules/
  tax-engine/
    core/
      calculator.interface.ts   # Base interface for country calculators
      money.ts                  # Decimal.js financial math wrapper
      rounding.ts               # Jurisdiction-specific rounding (USD 2 dec, VND 0 dec)
      progressive-tax.ts        # Pure progressive bracket tax calculation
      errors.ts                 # Standard tax engine domain errors
      tax-engine.service.ts     # Central engine dispatcher
    countries/
      us/
        federal/
          federal-tax.ts        # Progressive brackets, standard/itemized deductions
          self-employment-tax.ts# SS, Medicare, 92.35% SE factor, SE tax deduction
          additional-medicare.ts# 0.9% surtax calculation
        payroll/
          w2-calculator.ts      # W-2 withholding, pre/post-tax deductions, employer share
        state/
          state-tax.service.ts  # Verified state tax calculators (CA, NY, TX, FL, WA, etc.)
        1099/
          us-1099-calculator.ts # Complete Schedule C + SE + FIT + State workflow
      vn/
        insurance/
          insurance-calculator.ts # BHXH (8%), BHYT (1.5%), BHTN (1%) + Base salary caps
        pit/
          pit-calculator.ts       # 2026 5-bracket schedule & 2024/2025 7-bracket schedule
        salary/
          gross-to-net.ts         # Gross-to-Net employee & Vietnam freelancer handler
    rules/
      tax-rule.repository.ts    # Versioned repository for US & VN official rules
      tax-rule.validator.ts     # Range, rate, and non-overlapping bracket validation
      tax-rule.version.ts       # Version tagging & verification tracking
    types/
      calculation-input.ts      # Zod schemas & TypeScript types for all forms
      calculation-result.ts     # Standardized JSON response models
```

---

## 4. Key Calculation Parameters & Official Sources

| Country | Module | Key Rules & Constants (2026) | Official Source |
|---|---|---|---|
| **US** | 1099 Freelance | • SE factor: 92.35%<br>• SS Wage Base: $184,500 (12.4%)<br>• Medicare: 2.9%<br>• Additional Medicare: 0.9% ($200k S / $250k MFJ)<br>• Deductible SE Tax: 50%<br>• Standard deductions & QBI eligibility | IRS Pub 15-A, Pub 334, SSA.gov |
| **US** | W-2 Salary | • SS: 6.2% (capped at $184,500)<br>• Medicare: 1.45%<br>• Additional Medicare: 0.9%<br>• Pre-tax deductions reduce taxable wages | IRS Rev. Proc. 2025-XX / Pub 15-T |
| **Vietnam** | Gross-to-Net | • BHXH: 8% (cap 20× base salary: 46.8M VND)<br>• BHYT: 1.5% (cap 20× base salary: 46.8M VND)<br>• BHTN: 1% (cap 20× regional min: 99.2M VND)<br>• Personal deduction: 15.5M VND/mo<br>• Dependent deduction: 6.2M VND/mo/person<br>• 2026 Progressive PIT: 5 brackets (5%, 10%, 20%, 30%, 35%) | General Dept of Taxation (GDT), Law on PIT |

---

## 5. UI Integration Strategy

- Provide a dedicated, responsive `/calculator` portal that respects the existing typography, colors, and layout guidelines.
- Features multi-tab navigation between:
  1. **US 1099 Freelancer Calculator**
  2. **US W-2 Salary Calculator**
  3. **Vietnam Gross-to-Net Calculator**
  4. **Tax Rules & History Explorer**
- Display interactive breakdown charts, rule version badges, and the mandatory legal disclaimer.

