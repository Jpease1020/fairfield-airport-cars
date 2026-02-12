/**
 * SMS Thread API
 *
 * Returns thread data and messages for the reply UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThreadWithMessages } from '@/lib/services/sms-thread-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    const thread = await getThreadWithMessages(threadId);

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Convert dates to ISO strings for JSON serialization
    return NextResponse.json({
      id: thread.id,
      customerPhone: thread.customerPhone,
      customerName: thread.customerName,
      messages: thread.messages.map(msg => ({
        id: msg.id,
        direction: msg.direction,
        body: msg.body,
        timestamp: msg.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[SMS Thread API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
