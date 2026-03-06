import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getThreads } from '@/lib/services/sms-thread-service';
import { isSmsInboxEnabled } from '@/lib/utils/sms-inbox-feature';

export async function GET(request: NextRequest) {
  if (!isSmsInboxEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const threads = await getThreads(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Failed to load SMS threads:', error);
    return NextResponse.json({ error: 'Failed to load SMS threads' }, { status: 500 });
  }
}
