import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { runHealthChecks } from '@/lib/health-checks';

/**
 * Admin-only health. Returns detailed service and config checks.
 * Do not expose this route publicly.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const result = await runHealthChecks();
    const httpStatus = result.status === 'unhealthy' ? 503 : 200;
    return NextResponse.json(result, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {},
        summary: { total: 0, passed: 0, warnings: 0, failed: 1 },
        totalDuration: 0,
      },
      { status: 503 }
    );
  }
}
