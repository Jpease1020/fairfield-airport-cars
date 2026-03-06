import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getThread, getThreadMessages } from '@/lib/services/sms-thread-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { threadId } = await params;
    const [thread, messages] = await Promise.all([
      getThread(threadId),
      getThreadMessages(threadId),
    ]);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({ thread, messages });
  } catch (error) {
    console.error('Failed to load SMS thread detail:', error);
    return NextResponse.json({ error: 'Failed to load SMS thread detail' }, { status: 500 });
  }
}
