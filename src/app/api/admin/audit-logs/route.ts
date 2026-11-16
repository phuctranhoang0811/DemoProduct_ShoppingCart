import { NextRequest, NextResponse } from 'next/server';
import { listAuditLogs } from '@/lib/tax-history';
import { requireAdminApi } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await listAuditLogs(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 50);

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

