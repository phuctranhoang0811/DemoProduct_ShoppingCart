import { NextRequest, NextResponse } from 'next/server';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const records = CalculationHistoryStore.listCalculations(limit);

    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching calculation history',
      },
      { status: 500 }
    );
  }
}

