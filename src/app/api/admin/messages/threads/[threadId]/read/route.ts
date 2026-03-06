import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { markThreadRead } from '@/lib/services/sms-thread-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { threadId } = await params;
    await markThreadRead(threadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark SMS thread read:', error);
    return NextResponse.json({ error: 'Failed to mark thread read' }, { status: 500 });
  }
}
