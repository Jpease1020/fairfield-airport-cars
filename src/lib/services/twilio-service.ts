import twilio from 'twilio';
import { saveSmsMessage } from './sms-message-service';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const getTwilioClient = () => twilio(accountSid, authToken);

interface SmsPayload {
  to: string;
  body: string;
}

export const sendSms = async ({ to, body }: SmsPayload) => {
  if (!accountSid || !authToken || !messagingServiceSid) {
    console.error('Twilio credentials are not configured. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID');
    throw new Error('Twilio service is not configured.');
  }

  try {
    const client = getTwilioClient();
    const message = await client.messages.create({
      body,
      messagingServiceSid: messagingServiceSid,
      to,
    });
    try {
      await saveSmsMessage({
        from: twilioPhoneNumber || 'system',
        to,
        body,
        direction: 'outbound',
        twilioMessageSid: message.sid,
      });
    } catch (logErr) {
      console.warn('Failed to log outbound SMS:', logErr);
    }
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    throw error;
  }
};

// ===== BULK SMS FOR MARKETING =====

export interface BulkSmsRecipient {
  phone: string;
  name: string;
}

export interface BulkSmsResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    phone: string;
    name: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export interface BulkSmsOptions {
  includeOptOutNotice?: boolean;
}

const DEFAULT_BULK_SMS_DELAY_MS = Number(process.env.BULK_SMS_DELAY_MS || 150);
const DEFAULT_BULK_SMS_MAX_RECIPIENTS = Number(process.env.BULK_SMS_MAX_RECIPIENTS || 500);
const MAX_SMS_BODY_LENGTH = 320;

export const normalizePhoneToE164 = (rawPhone: string): string => {
  let normalizedPhone = rawPhone.replace(/[^\d+]/g, '');
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = normalizedPhone.startsWith('1')
      ? `+${normalizedPhone}`
      : `+1${normalizedPhone}`;
  }
  if (!/^\+[1-9]\d{9,14}$/.test(normalizedPhone)) {
    throw new Error('Invalid phone number');
  }
  return normalizedPhone;
};

const appendOptOutNotice = (body: string): string => {
  const hasOptOut = /\b(stop|opt\s*out|unsubscribe)\b/i.test(body);
  if (hasOptOut) return body;
  return `${body} Reply STOP to opt out.`;
};

/**
 * Send SMS to multiple recipients with personalization.
 * Replaces {{name}} placeholder with recipient's name.
 * Includes rate limiting to avoid Twilio throttling.
 */
export const sendBulkSms = async (
  recipients: BulkSmsRecipient[],
  messageTemplate: string,
  options: BulkSmsOptions = {}
): Promise<BulkSmsResult> => {
  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error('Twilio service is not configured.');
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('At least one SMS recipient is required.');
  }
  if (recipients.length > DEFAULT_BULK_SMS_MAX_RECIPIENTS) {
    throw new Error(`Campaign exceeds max recipients (${DEFAULT_BULK_SMS_MAX_RECIPIENTS}).`);
  }
  if (typeof messageTemplate !== 'string' || !messageTemplate.trim()) {
    throw new Error('Message template is required.');
  }

  const results: BulkSmsResult['results'] = [];
  let successful = 0;
  let failed = 0;
  const shouldAppendOptOut = options.includeOptOutNotice !== false;
  const client = getTwilioClient();

  for (let i = 0; i < recipients.length; i += 1) {
    const recipient = recipients[i];
    // Personalize message by replacing {{name}} placeholder
    let personalizedMessage = messageTemplate.replace(
      /\{\{name\}\}/gi,
      recipient.name.split(' ')[0] || 'there' // Use first name, fallback to "there"
    );
    if (shouldAppendOptOut) {
      personalizedMessage = appendOptOutNotice(personalizedMessage);
    }
    if (personalizedMessage.length > MAX_SMS_BODY_LENGTH) {
      const errorMessage = `Message exceeds ${MAX_SMS_BODY_LENGTH} character SMS limit`;
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        success: false,
        error: errorMessage,
      });
      failed++;
      continue;
    }

    let normalizedPhone = recipient.phone;
    try {
      // Normalize phone number to E.164 format
      normalizedPhone = normalizePhoneToE164(recipient.phone);
      const message = await client.messages.create({
        body: personalizedMessage,
        messagingServiceSid: messagingServiceSid,
        to: normalizedPhone,
      });

      results.push({
        phone: recipient.phone,
        name: recipient.name,
        success: true,
        messageId: message.sid,
      });
      successful++;

      console.log(`[SMS Marketing] Sent to ${recipient.name} (${normalizedPhone}): ${message.sid}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        success: false,
        error: errorMessage,
      });
      failed++;

      console.error(`[SMS Marketing] Failed to send to ${recipient.name} (${normalizedPhone}):`, errorMessage);
    }

    // Rate limit between sends to avoid Twilio throttling.
    if (i < recipients.length - 1 && DEFAULT_BULK_SMS_DELAY_MS > 0) {
      await new Promise(resolve => setTimeout(resolve, DEFAULT_BULK_SMS_DELAY_MS));
    }
  }

  console.log(`[SMS Marketing] Campaign complete: ${successful} sent, ${failed} failed out of ${recipients.length}`);

  return {
    total: recipients.length,
    successful,
    failed,
    results,
  };
};
