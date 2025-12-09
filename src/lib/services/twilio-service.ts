import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || 'MGd18969191e05806b623ffd2ae4b95850';

const client = twilio(accountSid, authToken);

interface SmsPayload {
  to: string;
  body: string;
}

export const sendSms = async ({ to, body }: SmsPayload) => {
  if (!accountSid || !authToken) {
    console.error('Twilio credentials are not configured in .env.local');
    throw new Error('Twilio service is not configured.');
  }

  try {
    const message = await client.messages.create({
      body,
      messagingServiceSid: messagingServiceSid,
      to,
    });
    return message;
  } catch (error: any) {
    console.error(`❌ [TWILIO] Failed to send SMS to ${to}:`, error);
    
    // Check for A2P 10DLC registration error
    if (error?.code === 30034 || error?.message?.includes('A2P 10DLC') || error?.message?.includes('Unregistered Number')) {
      console.error('❌ [TWILIO] A2P 10DLC Registration Error (30034)');
      console.error('❌ [TWILIO] Your Twilio phone number needs to be registered for US A2P messaging.');
      console.error('❌ [TWILIO] Register at: https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc');
      console.error('❌ [TWILIO] This is required for sending SMS to US numbers.');
    }
    
    throw error;
  }
};
