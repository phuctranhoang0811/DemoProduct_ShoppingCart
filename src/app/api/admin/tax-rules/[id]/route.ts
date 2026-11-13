import { NextRequest, NextResponse } from 'next/server';
import { TaxRuleRepository } from '@/modules/tax-engine/rules/tax-rule.repository';
import { validateTaxRuleSet } from '@/modules/tax-engine/rules/tax-rule.validator';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';

export async function PATCH(
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

    if (existing.status === 'PUBLISHED') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cannot directly modify a PUBLISHED tax rule set. Published rules are immutable to preserve historical calculations. Clone or create a new version.',
        },
        { status: 403 }
      );
    }

    const updates = await req.json();
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateTaxRuleSet(updated);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    TaxRuleRepository.addRule(updated);
    CalculationHistoryStore.logAudit('admin_user', 'UPDATE_RULE', 'TaxRuleSet', updated.id, updates);

    return NextResponse.json({
      success: true,
      message: 'Draft tax rule updated successfully.',
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

