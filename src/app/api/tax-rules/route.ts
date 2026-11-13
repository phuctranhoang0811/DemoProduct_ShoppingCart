import { NextRequest, NextResponse } from 'next/server';
import { TaxRuleRepository } from '@/modules/tax-engine/rules/tax-rule.repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const taxYearStr = searchParams.get('taxYear');
    const incomeType = searchParams.get('incomeType');

    let rules = TaxRuleRepository.getAll();

    if (country) {
      rules = rules.filter((r) => r.country.toUpperCase() === country.toUpperCase());
    }
    if (taxYearStr) {
      const year = parseInt(taxYearStr, 10);
      rules = rules.filter((r) => r.taxYear === year);
    }
    if (incomeType) {
      rules = rules.filter(
        (r) =>
          r.incomeType === incomeType ||
          (r.country === 'US' && r.incomeType === 'FEDERAL_FIT')
      );
    }

    return NextResponse.json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching tax rules',
      },
      { status: 500 }
    );
  }
}

