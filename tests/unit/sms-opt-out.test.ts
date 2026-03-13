import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('twilio', () => ({
  default: {
    validateRequest: vi.fn(() => true),
  },
}));

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/sms-message-service', () => ({
  saveSmsMessage: vi.fn().mockResolvedValue('msg_1'),
}));

vi.mock('@/lib/services/sms-thread-service', () => ({
  findOrCreateThread: vi.fn().mockResolvedValue({ threadId: 'thread_abc', created: false }),
  updateThreadOnInbound: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/services/database-service', () => ({
  updateSmsOptInByPhone: vi.fn().mockResolvedValue(3),
}));

import { sendSms } from '@/lib/services/twilio-service';
import { updateSmsOptInByPhone } from '@/lib/services/database-service';

const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;
const mockUpdateSmsOptIn = updateSmsOptInByPhone as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/twilio/incoming-sms/route').POST;

beforeAll(async () => {
  process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.fairfieldairportcar.com';
  process.env.GREGG_SMS_FORWARD_NUMBER = '+16462216370';
  ({ POST } = await import('@/app/api/twilio/incoming-sms/route'));
});

function makeRequest(body: string, from = '+12035550123') {
  return new Request('https://www.fairfieldairportcar.com/api/twilio/incoming-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-twilio-signature': 'valid-signature',
    },
    body: new URLSearchParams({
      From: from,
      To: '+16462216370',
      Body: body,
      MessageSid: 'SM123',
    }).toString(),
  }) as any;
}

describe('SMS opt-out/opt-in handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['STOP', 'stop', 'Stop', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'])(
    'sets smsOptIn to false when customer texts "%s"',
    async (keyword) => {
      const response = await POST(makeRequest(keyword));
      expect(response.status).toBe(200);
      expect(mockUpdateSmsOptIn).toHaveBeenCalledWith('+12035550123', false);
    }
  );

  it.each(['START', 'start', 'UNSTOP', 'unstop'])(
    'sets smsOptIn to true when customer texts "%s"',
    async (keyword) => {
      const response = await POST(makeRequest(keyword));
      expect(response.status).toBe(200);
      expect(mockUpdateSmsOptIn).toHaveBeenCalledWith('+12035550123', true);
    }
  );

  it('does not update smsOptIn for regular messages', async () => {
    await POST(makeRequest('Can you pick me up at 6?'));
    expect(mockUpdateSmsOptIn).not.toHaveBeenCalled();
  });

  it('does not forward STOP messages to Gregg', async () => {
    await POST(makeRequest('STOP'));
    expect(mockSendSms).not.toHaveBeenCalled();
  });

  it('does not forward START messages to Gregg', async () => {
    await POST(makeRequest('START'));
    expect(mockSendSms).not.toHaveBeenCalled();
  });

  it('still forwards regular messages to Gregg', async () => {
    await POST(makeRequest('Can you pick me up at 6?'));
    expect(mockSendSms).toHaveBeenCalled();
  });

  it('handles "stop" with extra whitespace', async () => {
    await POST(makeRequest('  STOP  '));
    expect(mockUpdateSmsOptIn).toHaveBeenCalledWith('+12035550123', false);
  });

  it('does not treat "stop by at 5" as an opt-out', async () => {
    await POST(makeRequest('stop by at 5'));
    expect(mockUpdateSmsOptIn).not.toHaveBeenCalled();
  });
});
