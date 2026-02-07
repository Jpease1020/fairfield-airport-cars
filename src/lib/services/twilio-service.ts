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
