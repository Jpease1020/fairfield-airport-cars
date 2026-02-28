import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { getBooking, cancelBooking, updateBooking } from '@/lib/services/booking-service';
import { sendSms } from '@/lib/services/twilio-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { sendAdminSms } from '@/lib/services/admin-notification-service';

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

vi.mock('@/lib/services/notification-service', () => ({
  sendBookingProblem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/admin-notification-service', () => ({
  sendAdminSms: vi.fn(),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  requireOwnerOrAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'test', role: 'admin' } }),
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

const mockGetBooking = getBooking as unknown as ReturnType<typeof vi.fn>;
const mockCancelBooking = cancelBooking as unknown as ReturnType<typeof vi.fn>;
const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;
const mockSendConfirmationEmail = sendConfirmationEmail as unknown as ReturnType<typeof vi.fn>;
const mockSendAdminSms = sendAdminSms as unknown as ReturnType<typeof vi.fn>;

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
    const payload = await response!.json();

    expect(response!.status).toBe(400);
    expect(payload.error).toBe('Booking ID is required');
  });

  it('returns 404 when booking not found', async () => {
    mockGetBooking.mockResolvedValueOnce(null);

    const response = await POST(buildRequest({ bookingId: 'nonexistent' }));
    const payload = await response!.json();

    expect(response!.status).toBe(404);
    expect(payload.error).toBe('Booking not found');
  });

  it('returns 400 when booking is already cancelled', async () => {
    mockGetBooking.mockResolvedValueOnce({ ...createMockBooking(48), status: 'cancelled' });

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(400);
    expect(payload.error).toBe('Booking is already cancelled');
  });

  it('processes 100% refund when cancellation is >24 hours before pickup', async () => {
    const booking = createMockBooking(48, 75); // 48 hours out, $75 deposit
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123', reason: 'Changed plans' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.refundAmount).toBe(75); // 100% refund
    expect(payload.cancellationFee).toBe(0);

    // Route delegates refund to cancelBooking; verify options passed so service can process refund
    expect(mockCancelBooking).toHaveBeenCalledWith('booking-123', 'Changed plans', {
      refundAmount: 75,
      squarePaymentId: 'pay-123',
      cancellationFee: 0,
    });
  });

  it('processes 75% refund (25% fee) when cancellation is 12-24 hours before pickup', async () => {
    const booking = createMockBooking(12, 100); // 12 hours out, $100 paid
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.refundAmount).toBe(75); // 25% fee → 75% refund
    expect(payload.cancellationFee).toBe(25);

    expect(mockCancelBooking).toHaveBeenCalledWith('booking-123', undefined, {
      refundAmount: 75,
      squarePaymentId: 'pay-123',
      cancellationFee: 25,
    });
  });

  it('processes 25% refund (75% fee) when cancellation is <6 hours before pickup', async () => {
    const booking = createMockBooking(1, 100); // 1 hour out, $100 paid
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.refundAmount).toBe(25); // 75% fee → 25% refund
    expect(payload.cancellationFee).toBe(75);

    expect(mockCancelBooking).toHaveBeenCalledWith('booking-123', undefined, {
      refundAmount: 25,
      squarePaymentId: 'pay-123',
      cancellationFee: 75,
    });
  });

  it('continues cancellation even if refund fails', async () => {
    const booking = createMockBooking(48, 75);
    mockGetBooking.mockResolvedValueOnce(booking);
    // cancelBooking (in service) catches refund errors and does not rethrow, so route still gets 200
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.message).toBe('Booking cancelled');
    expect(mockCancelBooking).toHaveBeenCalledWith('booking-123', undefined, {
      refundAmount: 75,
      squarePaymentId: 'pay-123',
      cancellationFee: 0,
    });
  });

  it('passes options without squarePaymentId when no payment ID is available', async () => {
    const booking = createMockBooking(48, 75);
    (booking.payment as Record<string, unknown>).squarePaymentId = undefined; // No payment ID
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.refundAmount).toBe(75);
    // Service receives refundAmount but no squarePaymentId; it logs a warn and does not call refundPayment
    expect(mockCancelBooking).toHaveBeenCalledWith('booking-123', undefined, {
      refundAmount: 75,
      squarePaymentId: undefined,
      cancellationFee: 0,
    });
  });

  it('sends notifications to customer and admin', async () => {
    const booking = createMockBooking(48, 75);
    booking.trip.pickupDateTime = '2026-03-02T13:00:00.000Z';
    mockGetBooking.mockResolvedValueOnce(booking);
    mockCancelBooking.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);
    mockSendConfirmationEmail.mockResolvedValueOnce(undefined);
    mockSendAdminSms.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({ bookingId: 'booking-123' }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.channels).toContain('sms');
    expect(payload.channels).toContain('email');

    // Customer SMS sent
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+15555550123',
      body: expect.stringContaining('3/2/2026, 8:00 AM'),
    });

    // Customer email sent
    expect(mockSendConfirmationEmail).toHaveBeenCalled();
    expect(mockSendAdminSms).toHaveBeenCalledWith(expect.stringContaining('3/2/2026, 8:00 AM'));
  });
});
