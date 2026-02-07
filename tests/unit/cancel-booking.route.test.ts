import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { getBooking, cancelBooking, updateBooking } from '@/lib/services/booking-service';
import { refundPayment } from '@/lib/services/square-service';
import { sendSms } from '@/lib/services/twilio-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';

vi.mock('@/lib/services/booking-service', () => ({
  getBooking: vi.fn(),
  cancelBooking: vi.fn(),
  updateBooking: vi.fn(),
}));

vi.mock('@/lib/services/square-service', () => ({
  refundPayment: vi.fn(),
}));

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn(),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: vi.fn(),
}));

vi.mock('@/lib/services/booking-notification-service', () => ({
  bookingNotificationService: {
    sendBookingCancelled: vi.fn(),
  },
}));

vi.mock('@/lib/services/admin-notification-service', () => ({
  sendAdminSms: vi.fn(),
}));

vi.mock('@/utils/bookingAdapter', () => ({
  adaptOldBookingToNew: vi.fn((booking) => booking),
}));

const mockGetBooking = getBooking as unknown as ReturnType<typeof vi.fn>;
const mockCancelBooking = cancelBooking as unknown as ReturnType<typeof vi.fn>;
const mockUpdateBooking = updateBooking as unknown as ReturnType<typeof vi.fn>;
const mockRefundPayment = refundPayment as unknown as ReturnType<typeof vi.fn>;
const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;
const mockSendConfirmationEmail = sendConfirmationEmail as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/booking/cancel-booking/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/booking/cancel-booking/route'));
});

const buildRequest = (body: Record<string, unknown>) => {
  return {
    json: () => Promise.resolve(body),
  } as any;
};

const createMockBooking = (hoursUntilPickup: number, depositAmount: number = 75) => {
  const pickupTime = new Date(Date.now() + hoursUntilPickup * 60 * 60 * 1000);
  return {
    id: 'booking-123',
    status: 'confirmed',
    trip: {
      pickupDateTime: pickupTime.toISOString(),
      pickup: { address: '123 Main St' },
      dropoff: { address: 'JFK Airport' },
    },
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+15555550123',
    },
    payment: {
      depositAmount,
      squarePaymentId: 'pay-123',
      squareOrderId: 'order-123',
    },
  };
};

describe('POST /api/booking/cancel-booking', () => {
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

  it('returns 400 when bookingId is missing', async () => {
    const response = await POST(buildRequest({}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Booking ID is required');
  });

  it('returns 404 when booking not found', async () => {
    mockGetBooking.mockResolvedValueOnce(null);

    const response = await POST(buildRequest({ bookingId: 'nonexistent' }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe('Booking not found');
  });

  it('returns 400 when booking is already cancelled', async () => {
    mockGetBooking.mockResolvedValueOnce({ ...createMockBooking(48), status: 'cancelled' });

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Booking is already cancelled');
  });

  it('processes 100% refund when cancellation is >24 hours before pickup', async () => {
    const booking = createMockBooking(48, 75); // 48 hours out, $75 deposit
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-123' });
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123', reason: 'Changed plans' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.refundAmount).toBe(75); // 100% refund
    expect(payload.cancellationFee).toBe(0);

    // Verify refund was called with correct payment ID and amount
    expect(mockRefundPayment).toHaveBeenCalledWith('pay-123', 7500, 'USD', 'Changed plans');
  });

  it('processes 50% refund when cancellation is 3-24 hours before pickup', async () => {
    const booking = createMockBooking(12, 100); // 12 hours out, $100 deposit
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-456' });
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.refundAmount).toBe(50); // 50% refund
    expect(payload.cancellationFee).toBe(50);

    expect(mockRefundPayment).toHaveBeenCalledWith('pay-123', 5000, 'USD', undefined);
  });

  it('processes 0% refund when cancellation is <3 hours before pickup', async () => {
    const booking = createMockBooking(1, 100); // 1 hour out, $100 deposit
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.refundAmount).toBe(0); // No refund
    expect(payload.cancellationFee).toBe(100);

    // Should NOT call refundPayment when refund is $0
    expect(mockRefundPayment).not.toHaveBeenCalled();
  });

  it('continues cancellation even if refund fails', async () => {
    const booking = createMockBooking(48, 75);
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockRefundPayment.mockRejectedValueOnce(new Error('Square API error'));
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    // Should still return success - cancellation happened
    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking cancelled');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Refund failed for booking'),
      expect.any(Error)
    );
  });

  it('warns when no payment ID is available for refund', async () => {
    const booking = createMockBooking(48, 75);
    (booking.payment as Record<string, unknown>).squarePaymentId = undefined; // No payment ID
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockRefundPayment).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot process refund - no payment ID')
    );
  });

  it('sends notifications to customer and admin', async () => {
    const booking = createMockBooking(48, 75);
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    mockRefundPayment.mockResolvedValueOnce({ success: true });
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.channels).toContain('sms');
    expect(payload.channels).toContain('email');

    // Customer SMS sent
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+15555550123',
      body: expect.stringContaining('cancelled'),
    });

    // Customer email sent
    expect(mockSendConfirmationEmail).toHaveBeenCalled();
  });
});
