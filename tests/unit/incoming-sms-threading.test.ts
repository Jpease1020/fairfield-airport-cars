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
  updateThreadOnInbound: vi.fn().mockResolvedValue(undefined),
}));

import { sendSms } from '@/lib/services/twilio-service';
import { saveSmsMessage } from '@/lib/services/sms-message-service';
import { findOrCreateThread, updateThreadOnInbound } from '@/lib/services/sms-thread-service';

const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;
const mockSaveSmsMessage = saveSmsMessage as unknown as ReturnType<typeof vi.fn>;
const mockFindOrCreateThread = findOrCreateThread as unknown as ReturnType<typeof vi.fn>;
const mockUpdateThreadOnInbound = updateThreadOnInbound as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/twilio/incoming-sms/route').POST;

beforeAll(async () => {
  process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.fairfieldairportcar.com';
  process.env.GREGG_SMS_FORWARD_NUMBER = '+16462216370';
  ({ POST } = await import('@/app/api/twilio/incoming-sms/route'));
});

describe('POST /api/twilio/incoming-sms (threading)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores inbound messages with thread metadata and notifies Gregg with a deep link', async () => {
    const response = await POST(
      new Request('https://www.fairfieldairportcar.com/api/twilio/incoming-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-twilio-signature': 'valid-signature',
        },
        body: new URLSearchParams({
          From: '+12035550123',
          To: '+16462216370',
          Body: 'Can you pick me up at 6?',
          MessageSid: 'SM123',
        }).toString(),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(mockFindOrCreateThread).toHaveBeenCalledWith('+12035550123');
    expect(mockUpdateThreadOnInbound).toHaveBeenCalledWith('thread_abc', 'Can you pick me up at 6?');
    expect(mockSaveSmsMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread_abc',
        senderType: 'customer',
        direction: 'inbound',
      })
    );
    expect(mockSendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        logMessage: false,
        body: expect.stringContaining('/admin/messages/thread_abc'),
      })
    );
  });
});
