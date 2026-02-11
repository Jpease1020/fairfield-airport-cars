import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const client = twilio(accountSid, authToken);

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
    const message = await client.messages.create({
      body,
      messagingServiceSid: messagingServiceSid,
      to,
    });
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

/**
 * Send SMS to multiple recipients with personalization.
 * Replaces {{name}} placeholder with recipient's name.
 * Includes rate limiting to avoid Twilio throttling.
 */
export const sendBulkSms = async (
  recipients: BulkSmsRecipient[],
  messageTemplate: string
): Promise<BulkSmsResult> => {
  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error('Twilio service is not configured.');
  }

  const results: BulkSmsResult['results'] = [];
  let successful = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Personalize message by replacing {{name}} placeholder
    const personalizedMessage = messageTemplate.replace(
      /\{\{name\}\}/gi,
      recipient.name.split(' ')[0] || 'there' // Use first name, fallback to "there"
    );

    // Normalize phone number to E.164 format
    let normalizedPhone = recipient.phone.replace(/[\s\-()]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      // Assume US number if no country code
      normalizedPhone = normalizedPhone.startsWith('1')
        ? `+${normalizedPhone}`
        : `+1${normalizedPhone}`;
    }

    try {
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

    // Rate limit: 100ms delay between sends to avoid Twilio throttling
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
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
