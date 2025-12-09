/**
 * Admin Notification Service Unit Tests
 * 
 * Tests the critical SMS notification service for Gregg (admin).
 * This is HIGH VALUE because if SMS fails, Gregg won't know about bookings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendAdminSms } from '@/lib/services/admin-notification-service';

// Mock dependencies
vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn(),
}));

vi.mock('@/lib/services/cms-service', () => ({
  cmsFlattenedService: {
    getBusinessSettings: vi.fn(),
  },
}));

import { sendSms } from '@/lib/services/twilio-service';
import { cmsFlattenedService } from '@/lib/services/cms-service';

const mockSendSms = sendSms as ReturnType<typeof vi.fn>;
const mockGetBusinessSettings = cmsFlattenedService.getBusinessSettings as ReturnType<typeof vi.fn>;

describe('Admin Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send SMS when admin phone is configured', async () => {
    mockGetBusinessSettings.mockResolvedValueOnce({
      company: {
        adminPhone: '+12035551234',
      },
    });
    mockSendSms.mockResolvedValueOnce({ sid: 'test-sms-123' });

    await sendAdminSms('Test message');

    expect(mockGetBusinessSettings).toHaveBeenCalled();
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+12035551234',
      body: 'Test message',
    });
  });

  it('should handle missing admin phone gracefully without throwing', async () => {
    mockGetBusinessSettings.mockResolvedValueOnce({
      company: {
        adminPhone: undefined,
      },
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Should not throw
    await expect(sendAdminSms('Test message')).resolves.not.toThrow();

    expect(mockGetBusinessSettings).toHaveBeenCalled();
    expect(mockSendSms).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Admin phone number not configured')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should handle SMS sending errors gracefully without throwing', async () => {
    mockGetBusinessSettings.mockResolvedValueOnce({
      company: {
        adminPhone: '+12035551234',
      },
    });
    mockSendSms.mockRejectedValueOnce(new Error('Twilio error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should not throw - errors should be logged but not propagated
    await expect(sendAdminSms('Test message')).resolves.not.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send admin SMS notification'),
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle null business settings gracefully', async () => {
    mockGetBusinessSettings.mockResolvedValueOnce(null);

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(sendAdminSms('Test message')).resolves.not.toThrow();

    expect(mockSendSms).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

