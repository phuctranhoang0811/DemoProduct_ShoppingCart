import { NextRequest, NextResponse } from 'next/server';
import { TaxRuleRepository } from '@/modules/tax-engine/rules/tax-rule.repository';
import { validateTaxRuleSet } from '@/modules/tax-engine/rules/tax-rule.validator';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';

export async function GET(req: NextRequest) {
  try {
    const rules = TaxRuleRepository.getAll();
    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateTaxRuleSet(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for new tax rule set.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const newRule = {
      ...body,
      id: body.id || `rule_${Date.now()}`,
      status: body.status || 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TaxRuleRepository.addRule(newRule);
    CalculationHistoryStore.logAudit('admin_user', 'CREATE_RULE', 'TaxRuleSet', newRule.id, {
      country: newRule.country,
      taxYear: newRule.taxYear,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tax rule set created successfully as DRAFT.',
        data: newRule,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

