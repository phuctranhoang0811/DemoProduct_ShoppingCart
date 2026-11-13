import { NextRequest, NextResponse } from 'next/server';
import { TaxRuleRepository } from '@/modules/tax-engine/rules/tax-rule.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = TaxRuleRepository.getById(params.id);
    if (!rule) {
      return NextResponse.json(
        { success: false, error: `Tax rule set with ID '${params.id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error retrieving tax rule',
      },
      { status: 500 }
    );
  }
}

