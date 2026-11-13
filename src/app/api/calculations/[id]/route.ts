import { NextRequest, NextResponse } from 'next/server';
import { CalculationHistoryStore } from '@/modules/tax-engine/core/history-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = CalculationHistoryStore.getCalculation(params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: `Calculation with ID '${params.id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error retrieving calculation',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = CalculationHistoryStore.deleteCalculation(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Calculation with ID '${params.id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Calculation '${params.id}' removed successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error deleting calculation',
      },
      { status: 500 }
    );
  }
}

