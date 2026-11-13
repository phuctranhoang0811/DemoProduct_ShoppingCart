import { NextRequest, NextResponse } from 'next/server';
import { TaxEngineService } from '@/modules/tax-engine/core/tax-engine.service';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';
import { TaxEngineError } from '@/modules/tax-engine/core/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await TaxEngineService.calculate(body);

    // Save calculation to history
    const record = CalculationHistoryStore.saveCalculation(body, result);

    return NextResponse.json({
      success: true,
      calculationId: record.id,
      data: result,
    });
  } catch (error) {
    if (error instanceof TaxEngineError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal calculation error occurred.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

