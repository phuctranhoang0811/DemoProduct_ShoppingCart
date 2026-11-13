import { NextRequest, NextResponse } from 'next/server';
import { TaxRuleRepository } from '@/modules/tax-engine/rules/tax-rule.repository';
import { validateTaxRuleSet } from '@/modules/tax-engine/rules/tax-rule.validator';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = TaxRuleRepository.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Rule '${params.id}' not found.` },
        { status: 404 }
      );
    }

    const validation = validateTaxRuleSet(existing);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot publish tax rule: validation errors present.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const published = {
      ...existing,
      status: 'PUBLISHED' as const,
      verificationDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    TaxRuleRepository.addRule(published);
    CalculationHistoryStore.logAudit('admin_user', 'PUBLISH_RULE', 'TaxRuleSet', published.id, {
      version: published.version,
    });

    return NextResponse.json({
      success: true,
      message: `Tax rule set '${published.id}' has been validated and published.`,
      data: published,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

