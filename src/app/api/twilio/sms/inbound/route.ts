/**
 * Twilio Inbound SMS Webhook
 *
 * Receives SMS messages sent to the business Twilio number.
 * Forwards them to Gregg with a reply link.
 *
 * Flow:
 * 1. Customer texts business number
 * 2. Twilio sends webhook to this endpoint
 * 3. We store the message in a thread
 * 4. We forward to Gregg via SMS with a reply link
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import {
  getOrCreateThread,
  addMessageToThread,
  normalizePhoneE164,
} from '@/lib/services/sms-thread-service';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const greggPhoneNumber = process.env.GREGG_PHONE_NUMBER;
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;

const twilioClient = twilio(accountSid, authToken);

/**
 * Validate Twilio request signature
 */
function validateTwilioSignature(request: NextRequest, body: string): boolean {
  if (!authToken) {
    console.error('[Twilio Inbound] Missing TWILIO_AUTH_TOKEN');
    return false;
  }

  const signature = request.headers.get('x-twilio-signature');
  if (!signature) {
    console.error('[Twilio Inbound] Missing x-twilio-signature header');
    return false;
  }

  // Get the full URL including query params
  const url = request.url;

  // Parse body as form data params
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(body);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const isValid = twilio.validateRequest(authToken, signature, url, params);

  if (!isValid) {
    console.error('[Twilio Inbound] Invalid signature');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  try {
    // Read body as text for signature validation
    const body = await request.text();

    // Validate Twilio signature (skip in development for testing)
    if (process.env.NODE_ENV === 'production') {
      if (!validateTwilioSignature(request, body)) {
        return NextResponse.json(
          { error: 'Invalid request signature' },
          { status: 403 }
        );
      }
    }

    // Parse form data
    const formData = new URLSearchParams(body);
    const from = formData.get('From'); // Customer phone
    const to = formData.get('To'); // Business Twilio number
    const messageBody = formData.get('Body');
    const messageSid = formData.get('MessageSid');

    if (!from || !messageBody) {
      console.error('[Twilio Inbound] Missing required fields:', { from, messageBody });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[Twilio Inbound] Received SMS from ${from}: ${messageBody.substring(0, 50)}...`);

    // Check configuration
    if (!greggPhoneNumber) {
      console.error('[Twilio Inbound] GREGG_PHONE_NUMBER not configured');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    if (!messagingServiceSid && !twilioPhoneNumber) {
      console.error('[Twilio Inbound] Neither TWILIO_MESSAGING_SERVICE_SID nor TWILIO_PHONE_NUMBER configured');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    // Get or create thread for this customer
    const thread = await getOrCreateThread(from);

    // Store the inbound message
    await addMessageToThread(thread.id, {
      direction: 'inbound',
      body: messageBody,
      twilioSid: messageSid || undefined,
    });

    // Build reply link
    const replyUrl = `${appBaseUrl}/reply/${thread.id}`;

    // Format message for Gregg
    const forwardedMessage = `📱 New SMS from ${from}:\n\n${messageBody}\n\n👉 Reply: ${replyUrl}`;

    // Forward to Gregg
    const sendOptions: any = {
      to: normalizePhoneE164(greggPhoneNumber),
      body: forwardedMessage,
    };

    // Use messaging service if available, otherwise use phone number
    if (messagingServiceSid) {
      sendOptions.messagingServiceSid = messagingServiceSid;
    } else {
      sendOptions.from = twilioPhoneNumber;
    }

    const forwardedMsg = await twilioClient.messages.create(sendOptions);

    console.log(`[Twilio Inbound] Forwarded to Gregg: ${forwardedMsg.sid}`);

    // Return empty TwiML response (we handle the reply ourselves)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('[Twilio Inbound] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET for Twilio webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'twilio-sms-inbound' });
}
