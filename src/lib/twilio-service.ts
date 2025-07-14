import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

interface SmsPayload {
  to: string;
  body: string;
}

export const sendSms = async ({ to, body }: SmsPayload) => {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials are not configured in .env.local');
    throw new Error('Twilio service is not configured.');
  }

  try {
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    throw error;
  }
};
