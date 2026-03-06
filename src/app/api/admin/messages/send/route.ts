import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getThread, updateThreadOnOutbound } from '@/lib/services/sms-thread-service';
import { sendSms } from '@/lib/services/twilio-service';
import { isSmsInboxEnabled } from '@/lib/utils/sms-inbox-feature';

const schema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!isSmsInboxEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'threadId and body are required' }, { status: 400 });
    }

    const { threadId, body } = parsed.data;
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const thread = await getThread(threadId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const result = await sendSms({
      to: thread.customerPhone,
      body: trimmedBody,
      threadId,
      senderType: 'admin',
    });

    await updateThreadOnOutbound(threadId, trimmedBody);

    return NextResponse.json({
      success: true,
      messageSid: result.sid,
    });
  } catch (error) {
    console.error('Failed to send SMS reply:', error);
    return NextResponse.json({ error: 'Failed to send SMS reply' }, { status: 500 });
  }
}
