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

vi.mock('@/lib/config/business-config', () => ({
  getBusinessConfig: vi.fn(),
}));

import { sendSms } from '@/lib/services/twilio-service';
import { getBusinessConfig } from '@/lib/config/business-config';

const mockSendSms = sendSms as ReturnType<typeof vi.fn>;
const mockGetBusinessConfig = getBusinessConfig as ReturnType<typeof vi.fn>;

describe('Admin Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send SMS when admin phone is configured', async () => {
    mockGetBusinessConfig.mockReturnValueOnce({
      name: 'Fairfield Airport Cars',
      phone: '(646) 221-6370',
      email: 'rides@fairfieldairportcar.com',
      adminPhone: '+12035551234',
    });
    mockSendSms.mockResolvedValueOnce({ sid: 'test-sms-123' });

    await sendAdminSms('Test message');

    expect(mockGetBusinessConfig).toHaveBeenCalled();
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+12035551234',
      body: 'Test message',
    });
  });

  it('should handle missing admin phone gracefully without throwing', async () => {
    mockGetBusinessConfig.mockReturnValueOnce({
      name: 'Fairfield Airport Cars',
      phone: '(646) 221-6370',
      email: 'rides@fairfieldairportcar.com',
      adminPhone: undefined,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Should not throw
    await expect(sendAdminSms('Test message')).resolves.not.toThrow();

    expect(mockGetBusinessConfig).toHaveBeenCalled();
    expect(mockSendSms).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Admin phone number not configured')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should handle SMS sending errors gracefully without throwing', async () => {
    mockGetBusinessConfig.mockReturnValueOnce({
      name: 'Fairfield Airport Cars',
      phone: '(646) 221-6370',
      email: 'rides@fairfieldairportcar.com',
      adminPhone: '+12035551234',
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
    mockGetBusinessConfig.mockReturnValueOnce({
      name: 'Fairfield Airport Cars',
      phone: '(646) 221-6370',
      email: 'rides@fairfieldairportcar.com',
      adminPhone: undefined,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(sendAdminSms('Test message')).resolves.not.toThrow();

    expect(mockSendSms).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
