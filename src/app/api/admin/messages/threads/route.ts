import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getThreads } from '@/lib/services/sms-thread-service';

export async function GET(request: NextRequest) {
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
