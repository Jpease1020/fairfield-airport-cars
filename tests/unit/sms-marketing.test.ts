/**
 * SMS Marketing Unit Tests
 *
 * Tests the bulk SMS functionality for marketing campaigns.
 * High value: This is Gregg's primary tool for customer outreach.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store the mock function reference
const mockMessagesCreate = vi.fn();

// Mock Twilio before importing the service
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockMessagesCreate,
    },
  })),
}));

describe('SMS Marketing', () => {
  beforeEach(() => {
    vi.resetModules();
    mockMessagesCreate.mockReset();

    // Set up environment variables
    process.env.TWILIO_ACCOUNT_SID = 'AC1234567890abcdef1234567890abcd';
    process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
    process.env.TWILIO_MESSAGING_SERVICE_SID = 'test-messaging-service-sid';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendBulkSms', () => {
    it('should send SMS to multiple recipients', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-message-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [
        { phone: '(203) 555-1234', name: 'John Doe' },
        { phone: '(203) 555-5678', name: 'Jane Smith' },
      ];

      const result = await sendBulkSms(recipients, 'Hello {{name}}!');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockMessagesCreate).toHaveBeenCalledTimes(2);
    });

    it('should personalize messages with {{name}} placeholder', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-message-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'John Doe' }];

      await sendBulkSms(recipients, 'Hi {{name}}, welcome!');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Hi John, welcome!'), // Should use first name only
        })
      );
    });

    it('should use first name only for personalization', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-message-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'John Michael Doe' }];

      await sendBulkSms(recipients, 'Hi {{name}}!');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Hi John!'),
        })
      );
    });

    it('should normalize phone numbers to E.164 format', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-message-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [
        { phone: '(203) 555-1234', name: 'Test User' }, // US format with parens
      ];

      await sendBulkSms(recipients, 'Test message');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+12035551234', // Should be normalized to E.164
        })
      );
    });

    it('should handle partial failures gracefully', async () => {
      mockMessagesCreate
        .mockResolvedValueOnce({ sid: 'success-id' })
        .mockRejectedValueOnce(new Error('Invalid phone number'));

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [
        { phone: '+12035551234', name: 'Success User' },
        { phone: 'invalid', name: 'Fail User' },
      ];

      const result = await sendBulkSms(recipients, 'Test message');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe('Invalid phone number');
    });

    it('should include messageId in successful results', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'MSG123456789' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'Test User' }];

      const result = await sendBulkSms(recipients, 'Test message');

      expect(result.results[0].messageId).toBe('MSG123456789');
    });

    it('should throw error if Twilio is not configured', async () => {
      // Clear environment variables
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_MESSAGING_SERVICE_SID;

      vi.resetModules();

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'Test User' }];

      await expect(sendBulkSms(recipients, 'Test')).rejects.toThrow(
        'Twilio service is not configured'
      );
    });

    it('should use messaging service SID for sending', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'Test User' }];

      await sendBulkSms(recipients, 'Test message');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messagingServiceSid: 'test-messaging-service-sid',
        })
      );
    });
  });

  describe('Message Templates', () => {
    it('should handle case-insensitive {{NAME}} placeholder', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'John Doe' }];

      await sendBulkSms(recipients, 'Hi {{NAME}}, this is {{Name}}!');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Hi John, this is John!'),
        })
      );
    });

    it('should fall back to "there" if name is empty', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: '' }];

      await sendBulkSms(recipients, 'Hi {{name}}!');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Hi there!'),
        })
      );
    });

    it('should append opt-out notice by default', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });
      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      await sendBulkSms([{ phone: '+12035551234', name: 'Test User' }], 'Campaign message');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Reply STOP to opt out.'),
        })
      );
    });

    it('should support disabling opt-out appending explicitly', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });
      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      await sendBulkSms(
        [{ phone: '+12035551234', name: 'Test User' }],
        'Campaign message',
        { includeOptOutNotice: false }
      );

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Campaign message',
        })
      );
    });
  });

  describe('Phone Number Normalization', () => {
    it('should add +1 prefix to numbers without country code', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '2035551234', name: 'Test' }];

      await sendBulkSms(recipients, 'Test');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+12035551234',
        })
      );
    });

    it('should handle numbers starting with 1', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '12035551234', name: 'Test' }];

      await sendBulkSms(recipients, 'Test');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+12035551234',
        })
      );
    });

    it('should preserve existing + prefix', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '+12035551234', name: 'Test' }];

      await sendBulkSms(recipients, 'Test');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+12035551234',
        })
      );
    });

    it('should remove spaces, dashes, and parentheses', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'test-id' });

      const { sendBulkSms } = await import('@/lib/services/twilio-service');

      const recipients = [{ phone: '(203) 555-1234', name: 'Test' }];

      await sendBulkSms(recipients, 'Test');

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+12035551234',
        })
      );
    });
  });
});
