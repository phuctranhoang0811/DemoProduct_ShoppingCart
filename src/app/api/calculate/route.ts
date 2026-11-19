import { NextRequest, NextResponse } from 'next/server';
import { TaxEngineService } from '@/modules/tax-engine/core/tax-engine.service';
import { saveCalculation } from '@/lib/tax-history';
import { TaxEngineError } from '@/modules/tax-engine/core/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { save, ...input } = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

    const result = await TaxEngineService.calculate(input);

    const shouldSave = save !== false && req.nextUrl.searchParams.get('save') !== 'false';
    const calculationId = shouldSave ? await saveCalculation(input as never, result) : null;

    return NextResponse.json({
      success: true,
      calculationId,
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
        error: 'Internal calculation error occurred.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

