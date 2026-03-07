import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { backfillSmsThreadIds } from '@/lib/services/sms-thread-backfill-service';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json().catch(() => ({}));
    const apply = body?.apply === true;
    const result = await backfillSmsThreadIds({ apply });
    return NextResponse.json({
      success: true,
      dryRun: !apply,
      ...result,
    });
  } catch (error) {
    console.error('Failed to backfill SMS thread IDs:', error);
    return NextResponse.json({ error: 'Failed to backfill SMS history' }, { status: 500 });
  }
}
