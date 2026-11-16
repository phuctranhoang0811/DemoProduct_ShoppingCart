import { NextRequest, NextResponse } from 'next/server';
import { listCalculations } from '@/lib/tax-history';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const records = await listCalculations(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20);

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

