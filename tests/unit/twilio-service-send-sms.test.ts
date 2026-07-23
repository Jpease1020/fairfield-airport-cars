/**
 * Tests that customer-facing SMS sent via sendSms match our registered Twilio A2P 10DLC
 * campaign's sample messages, which all include an opt-out notice. Internal sends (OTP,
 * admin notifications, Gregg's own forward) should NOT get this appended.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockMessagesCreate = vi.fn();
const mockSaveSmsMessage = vi.fn().mockResolvedValue(undefined);

vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockMessagesCreate,
    },
  })),
}));

vi.mock('@/lib/services/sms-message-service', () => ({
  saveSmsMessage: mockSaveSmsMessage,
}));

describe('sendSms opt-out notice', () => {
  beforeEach(() => {
    vi.resetModules();
    mockMessagesCreate.mockReset();
    mockSaveSmsMessage.mockClear();

    process.env.TWILIO_ACCOUNT_SID = 'AC1234567890abcdef1234567890abcd';
    process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
    process.env.TWILIO_MESSAGING_SERVICE_SID = 'test-messaging-service-sid';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('appends "Reply STOP to opt out" when customerFacing is true', async () => {
    mockMessagesCreate.mockResolvedValue({ sid: 'SM123' });
    const { sendSms } = await import('@/lib/services/twilio-service');

    await sendSms({
      to: '+12035551234',
      body: 'Your ride to JFK is confirmed for 8:00 AM.',
      customerFacing: true,
    });

    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Your ride to JFK is confirmed for 8:00 AM. Reply STOP to opt out.',
      })
    );
  });

  it('does not append the notice when customerFacing is omitted (default false)', async () => {
    mockMessagesCreate.mockResolvedValue({ sid: 'SM124' });
    const { sendSms } = await import('@/lib/services/twilio-service');

    await sendSms({
      to: '+12035551234',
      body: 'Your Fairfield Airport Cars code is 123456. It expires in 10 minutes.',
    });

    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Your Fairfield Airport Cars code is 123456. It expires in 10 minutes.',
      })
    );
  });

  it('does not double-append when the body already mentions opting out', async () => {
    mockMessagesCreate.mockResolvedValue({ sid: 'SM125' });
    const { sendSms } = await import('@/lib/services/twilio-service');

    await sendSms({
      to: '+12035551234',
      body: 'Reminder about your ride. Reply STOP to opt out.',
      customerFacing: true,
    });

    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Reminder about your ride. Reply STOP to opt out.',
      })
    );
  });

  it('logs the actual sent body (with the notice appended), not the original', async () => {
    mockMessagesCreate.mockResolvedValue({ sid: 'SM126' });
    const { sendSms } = await import('@/lib/services/twilio-service');

    await sendSms({
      to: '+12035551234',
      body: 'Your ride is confirmed.',
      customerFacing: true,
    });

    expect(mockSaveSmsMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Your ride is confirmed. Reply STOP to opt out.',
      })
    );
  });
});
