/**
 * Twilio Outbound SMS Endpoint
 *
 * Sends SMS replies from Gregg to customers.
 * The message is sent from the business Twilio number.
 *
 * Flow:
 * 1. Gregg opens reply link in browser
 * 2. Gregg types message and submits
 * 3. This endpoint sends the SMS via Twilio
 * 4. Customer receives message from business number
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import {
  getThread,
  addMessageToThread,
} from '@/lib/services/sms-thread-service';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Simple auth secret for the reply UI
const replyUiSecret = process.env.SMS_REPLY_SECRET;

const twilioClient = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId, message, secret } = body;

    // Validate required fields
    if (!threadId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId and message' },
        { status: 400 }
      );
    }

    // Validate auth secret (simple protection against abuse)
    if (replyUiSecret && secret !== replyUiSecret) {
      console.error('[Twilio Send] Invalid secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Twilio configuration
    if (!accountSid || !authToken) {
      console.error('[Twilio Send] Missing Twilio credentials');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    if (!messagingServiceSid && !twilioPhoneNumber) {
      console.error('[Twilio Send] Neither TWILIO_MESSAGING_SERVICE_SID nor TWILIO_PHONE_NUMBER configured');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    // Get the thread
    const thread = await getThread(threadId);
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    console.log(`[Twilio Send] Sending reply to ${thread.customerPhone}: ${message.substring(0, 50)}...`);

    // Send SMS to customer
    const sendOptions: any = {
      to: thread.customerPhone,
      body: message,
    };

    // Use messaging service if available, otherwise use phone number
    if (messagingServiceSid) {
      sendOptions.messagingServiceSid = messagingServiceSid;
    } else {
      sendOptions.from = twilioPhoneNumber;
    }

    const sentMessage = await twilioClient.messages.create(sendOptions);

    console.log(`[Twilio Send] Message sent: ${sentMessage.sid}`);

    // Store the outbound message in the thread
    await addMessageToThread(threadId, {
      direction: 'outbound',
      body: message,
      twilioSid: sentMessage.sid,
    });

    return NextResponse.json({
      success: true,
      messageSid: sentMessage.sid,
    });
  } catch (error) {
    console.error('[Twilio Send] Error:', error);

    // Handle Twilio-specific errors
    if (error instanceof Error && 'code' in error) {
      const twilioError = error as any;
      return NextResponse.json(
        {
          error: 'Failed to send message',
          details: twilioError.message,
          code: twilioError.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
