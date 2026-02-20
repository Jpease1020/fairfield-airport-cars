/**
 * Cancellation & Refund Flow Integration Test
 *
 * Tests the complete cancellation journey with correct refund calculations.
 * This protects both the business (no over-refunds) and customers (correct refunds).
 *
 * Refund Policy (fee-based):
 * - 24h+ before pickup: 0% fee, 100% refund
 * - 12-24h: 25% fee, 75% refund
 * - 6-12h: 50% fee, 50% refund
 * - <6h: 75% fee, 25% refund
 *
 * NOTE: Core unit tests are in tests/unit/cancel-booking.route.test.ts
 * This file tests higher-level integration scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

// Mock external services
vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue({ sid: 'mock-sms-sid' }),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/square-service', () => ({
  refundPayment: vi.fn().mockResolvedValue({
    success: true,
    refundId: 'mock-refund-id',
    status: 'COMPLETED',
  }),
}));

vi.mock('@/lib/services/admin-notification-service', () => ({
  sendAdminSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/booking-notification-service', () => ({
  bookingNotificationService: {
    notifyBookingCancelled: vi.fn().mockResolvedValue(undefined),
    sendBookingCancelled: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/lib/services/booking-service', () => ({
  getBooking: vi.fn(),
  updateBooking: vi.fn().mockResolvedValue(undefined),
  cancelBooking: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/bookingAdapter', () => ({
  adaptOldBookingToNew: vi.fn((booking) => booking),
}));

vi.mock('@/lib/business/business-rules', () => ({
  getBusinessRules: vi.fn().mockResolvedValue({
    cancellationFeeTiers: {
      over24hFeePercent: 0,
      under24hFeePercent: 25,
      under12hFeePercent: 50,
      under6hFeePercent: 75,
    },
  }),
  getCancellationFeePercent: vi.fn((hours: number, tiers: { over24hFeePercent: number; under24hFeePercent: number; under12hFeePercent: number; under6hFeePercent: number }) => {
    if (hours >= 24) return tiers.over24hFeePercent;
    if (hours >= 12) return tiers.under24hFeePercent;
    if (hours >= 6) return tiers.under12hFeePercent;
    return tiers.under6hFeePercent;
  }),
}));

import { sendSms } from '@/lib/services/twilio-service';
import { refundPayment } from '@/lib/services/square-service';
import { getBooking, cancelBooking, updateBooking } from '@/lib/services/booking-service';

const mockSendSms = sendSms as ReturnType<typeof vi.fn>;
const mockRefundPayment = refundPayment as ReturnType<typeof vi.fn>;
const mockGetBooking = getBooking as ReturnType<typeof vi.fn>;
const mockCancelBooking = cancelBooking as ReturnType<typeof vi.fn>;
const mockUpdateBooking = updateBooking as ReturnType<typeof vi.fn>;

// Load POST handler once
let POST: typeof import('@/app/api/booking/cancel-booking/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/booking/cancel-booking/route'));
});

// Helper to create a mock booking with pickup time X hours from now
const createMockBooking = (hoursUntilPickup: number, depositAmount: number = 25.50) => {
  const pickupTime = new Date(Date.now() + hoursUntilPickup * 60 * 60 * 1000);
  return {
    id: 'test-booking-123',
    status: 'confirmed',
    customer: {
      firstName: 'Test',
      lastName: 'Customer',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+12035551234',
    },
    trip: {
      pickup: { address: '123 Main St, Fairfield, CT' },
      dropoff: { address: 'Bradley International Airport' },
      pickupDateTime: pickupTime.toISOString(),
      fare: 85.00,
    },
    payment: {
      depositAmount,
      depositPaid: true,
      squarePaymentId: 'sq-payment-123',
    },
    fare: 85.00,
  };
};

// Helper to create a request object with json() method
const createRequest = (body: Record<string, unknown>) => {
  return {
    json: () => Promise.resolve(body),
  } as any;
};

describe('Cancellation & Refund Flow', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Refund Calculation by Timing', () => {
    it('gives 100% refund when cancelled >24 hours before pickup', async () => {
      const booking = createMockBooking(48); // 48 hours from now
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-123' });
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      const response = await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      expect(response.status).toBe(200);
      // Route passes options to cancelBooking; service will call refundPayment. Assert options.
      expect(mockCancelBooking).toHaveBeenCalledWith(
        'test-booking-123',
        'Test',
        expect.objectContaining({
          refundAmount: 25.5,
          squarePaymentId: 'sq-payment-123',
          cancellationFee: 0,
        })
      );
    });

    it('gives 75% refund when cancelled 12-24 hours before pickup (25% fee)', async () => {
      const booking = createMockBooking(12); // 12 hours from now
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-456' });
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      const response = await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      expect(response.status).toBe(200);
      // 25% fee → 75% refund: $25.50 * 0.75 = $19.125
      expect(mockCancelBooking).toHaveBeenCalledWith(
        'test-booking-123',
        'Test',
        expect.objectContaining({
          refundAmount: 19.125,
          squarePaymentId: 'sq-payment-123',
          cancellationFee: 6.375,
        })
      );
    });

    it('gives 25% refund when cancelled <6 hours before pickup (75% fee)', async () => {
      const booking = createMockBooking(1); // 1 hour from now
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-789' });
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      const response = await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      expect(response.status).toBe(200);
      // 75% fee → 25% refund: $25.50 * 0.25 = $6.375
      expect(mockCancelBooking).toHaveBeenCalledWith(
        'test-booking-123',
        'Test',
        expect.objectContaining({
          refundAmount: 6.375,
          squarePaymentId: 'sq-payment-123',
          cancellationFee: 19.125,
        })
      );
    });
  });

  describe('Cancellation Process', () => {
    it('marks booking as cancelled', async () => {
      const booking = createMockBooking(48);
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockResolvedValueOnce({ success: true });
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Customer request' }));

      expect(mockCancelBooking).toHaveBeenCalledWith(
        'test-booking-123',
        'Customer request',
        expect.objectContaining({
          refundAmount: expect.any(Number),
          squarePaymentId: expect.any(String),
          cancellationFee: expect.any(Number),
        })
      );
    });

    it('sends cancellation SMS to customer', async () => {
      const booking = createMockBooking(48);
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockResolvedValueOnce({ success: true });
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      expect(mockSendSms).toHaveBeenCalled();
      const smsCall = mockSendSms.mock.calls[0][0];
      expect(smsCall.to).toBe('+12035551234');
      expect(smsCall.body).toContain('cancelled');
    });
  });

  describe('Error Handling', () => {
    it('returns 404 for non-existent booking', async () => {
      mockGetBooking.mockResolvedValueOnce(null);

      const response = await POST(createRequest({ bookingId: 'non-existent', reason: 'Test' }));

      expect(response.status).toBe(404);
    });

    it('returns 400 for already cancelled booking', async () => {
      const booking = createMockBooking(48);
      booking.status = 'cancelled';
      mockGetBooking.mockResolvedValueOnce(booking);

      const response = await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      expect(response.status).toBe(400);
    });

    it('continues cancellation even if refund fails', async () => {
      const booking = createMockBooking(48);
      mockGetBooking.mockResolvedValueOnce(booking);
      mockCancelBooking.mockResolvedValueOnce(undefined);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockRefundPayment.mockRejectedValueOnce(new Error('Square API error'));
      mockSendSms.mockResolvedValueOnce({ sid: 'sms-123' });

      const response = await POST(createRequest({ bookingId: 'test-booking-123', reason: 'Test' }));

      // Cancellation should still succeed
      expect(response.status).toBe(200);
      expect(mockCancelBooking).toHaveBeenCalled();
    });
  });
});
