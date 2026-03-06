import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { sendSms } from '@/lib/services/twilio-service';
import { saveSmsMessage } from '@/lib/services/sms-message-service';
import { findOrCreateThread, updateThreadOnInbound } from '@/lib/services/sms-thread-service';

const authToken = process.env.TWILIO_AUTH_TOKEN;
const forwardToNumber = process.env.GREGG_SMS_FORWARD_NUMBER || process.env.ADMIN_FORWARD_SMS_TO;

/**
 * Twilio webhook: when someone texts the business number, we store the message
 * and forward it to Gregg's personal number.
 * Configure in Twilio: Messaging webhook URL = https://<your-domain>/api/twilio/incoming-sms
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-twilio-signature') || '';
  const url = request.url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/api/twilio/incoming-sms`;

  if (!authToken) {
    console.error('[Twilio webhook] TWILIO_AUTH_TOKEN not set');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  const params: Record<string, string> = {};
  new URLSearchParams(rawBody).forEach((value, key) => {
    params[key] = value;
  });

  const isValid = twilio.validateRequest(authToken, signature, url, params);
  if (!isValid) {
    console.warn('[Twilio webhook] Invalid signature');
    return new NextResponse('Forbidden', { status: 403 });
  }

  const from = params.From || '';
  const to = params.To || '';
  const body = params.Body || '';
  const messageSid = params.MessageSid || '';
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    new URL(request.url).origin;

  let threadId: string | null = null;

  try {
    if (from) {
      const thread = await findOrCreateThread(from);
      threadId = thread.threadId;
      await updateThreadOnInbound(threadId, body);
    }

    await saveSmsMessage({
      from,
      to,
      body,
      direction: 'inbound',
      twilioMessageSid: messageSid,
      threadId,
      senderType: 'customer',
    });
  } catch (error) {
    console.error('[Twilio webhook] Failed to persist inbound thread/message:', error);
  }

  if (forwardToNumber && body.trim()) {
    try {
      const forwardBody = `New message from ${from}: "${body.trim().slice(0, 80)}" Reply: ${
        threadId ? `${baseUrl}/admin/messages/${threadId}` : `${baseUrl}/admin/messages`
      }`;
      await sendSms({ to: forwardToNumber, body: forwardBody, logMessage: false });
    } catch (err) {
      console.error('[Twilio webhook] Failed to forward to Gregg:', err);
    }
  }

  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
