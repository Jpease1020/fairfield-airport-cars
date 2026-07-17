import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { processPayment, refundPayment } from '@/lib/services/square-service';
import { createBookingAtomic, getBooking, updateBooking, claimPaymentForBookingCreation, getBookingIdBySquarePaymentId } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { sendSms } from '@/lib/services/twilio-service';

vi.mock('@/lib/services/square-service', () => ({
  processPayment: vi.fn(),
  refundPayment: vi.fn(),
}));

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: vi.fn(),
  getBooking: vi.fn(),
  updateBooking: vi.fn(),
  claimPaymentForBookingCreation: vi.fn(),
  getBookingIdBySquarePaymentId: vi.fn(),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendBookingVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn(),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        update: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  })),
}));

vi.mock('@/lib/utils/firebase-server', () => ({
  db: {},
  auth: null,
}));

vi.mock('@/lib/security/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  getAuthContext: vi.fn().mockResolvedValue(null),
  requireOwnerOrAdmin: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

const mockProcessPayment = processPayment as unknown as ReturnType<typeof vi.fn>;
const mockRefundPayment = refundPayment as unknown as ReturnType<typeof vi.fn>;
const mockCreateBookingAtomic = createBookingAtomic as unknown as ReturnType<typeof vi.fn>;
const mockGetBooking = getBooking as unknown as ReturnType<typeof vi.fn>;
const mockUpdateBooking = updateBooking as unknown as ReturnType<typeof vi.fn>;
const mockClaimPaymentForBookingCreation = claimPaymentForBookingCreation as unknown as ReturnType<typeof vi.fn>;
const mockGetBookingIdBySquarePaymentId = getBookingIdBySquarePaymentId as unknown as ReturnType<typeof vi.fn>;
const mockSendBookingVerificationEmail = sendBookingVerificationEmail as unknown as ReturnType<typeof vi.fn>;
const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/payment/process-payment/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/payment/process-payment/route'));
});

const baseRequestBody = {
  paymentToken: 'tok_test',
  amount: 15000,
  currency: 'USD',
  bookingData: {
    customer: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+15555550123',
      notes: 'Please ring the bell',
      saveInfoForFuture: false,
    },
    trip: {
      pickup: { address: '123 Main St, Fairfield, CT', coordinates: null },
      dropoff: { address: 'JFK Airport, Queens, NY', coordinates: null },
      pickupDateTime: '2025-01-01T15:00:00.000Z',
      fareType: 'personal',
      flightInfo: { airline: 'Delta', flightNumber: 'DL123' },
    },
    payment: {
      totalAmount: 150,
      tipAmount: 0,
      fare: 150,
    },
  },
  tipAmount: 0,
};

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/payment/process-payment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

describe('POST /api/payment/process-payment', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: this request is the first (and only) one claiming its paymentId, so the new
    // booking-creation path proceeds normally. Individual tests override this to simulate a
    // losing/duplicate claim.
    mockClaimPaymentForBookingCreation.mockResolvedValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('processes payment, creates booking, and dispatches notifications', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-001',
      paymentId: 'pay-001',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });

    mockCreateBookingAtomic.mockResolvedValueOnce({ bookingId: 'booking-123' });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-123',
      trip: {
        pickup: baseRequestBody.bookingData.trip.pickup,
        dropoff: baseRequestBody.bookingData.trip.dropoff,
        pickupDateTime: baseRequestBody.bookingData.trip.pickupDateTime,
        fareType: baseRequestBody.bookingData.trip.fareType,
        flightInfo: baseRequestBody.bookingData.trip.flightInfo,
      },
      customer: {
        name: baseRequestBody.bookingData.customer.name,
        email: baseRequestBody.bookingData.customer.email,
        phone: baseRequestBody.bookingData.customer.phone,
        notes: baseRequestBody.bookingData.customer.notes,
        saveInfoForFuture: baseRequestBody.bookingData.customer.saveInfoForFuture,
      },
      payment: {
        tipAmount: baseRequestBody.bookingData.payment.tipAmount,
        tipPercent: 0,
        balanceDue: 0,
        depositAmount: 150,
        depositPaid: true,
        totalAmount: baseRequestBody.bookingData.payment.totalAmount,
      },
      status: 'pending',
    });
    mockSendBookingVerificationEmail.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest(baseRequestBody));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.bookingId).toBe('booking-123');
    expect(payload.paymentId).toBe('pay-001');

    expect(mockCreateBookingAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        squareOrderId: 'order-001',
        depositPaid: true,
        depositAmount: 150,
        tipAmount: 0,
        status: 'pending',
        bookingTimeline: expect.arrayContaining([
          expect.objectContaining({
            source: 'payment',
            event: 'payment_booking_create',
            normalizedPickupDateTimeIso: '2025-01-01T15:00:00.000Z',
            businessPickupDateTime: '1/1/2025, 10:00 AM',
          }),
        ]),
      })
    );
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+15555550123',
      body: expect.stringContaining('1/1/2025, 10:00 AM'),
    });
  });

  it('ignores a client-supplied x-smoke-test header — real payment still runs (regression: header used to bypass Square entirely)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-real',
      paymentId: 'pay-real',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });
    mockCreateBookingAtomic.mockResolvedValueOnce({ bookingId: 'booking-real' });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-real',
      trip: {
        pickup: baseRequestBody.bookingData.trip.pickup,
        dropoff: baseRequestBody.bookingData.trip.dropoff,
        pickupDateTime: baseRequestBody.bookingData.trip.pickupDateTime,
        fareType: baseRequestBody.bookingData.trip.fareType,
        flightInfo: baseRequestBody.bookingData.trip.flightInfo,
      },
      customer: {
        name: baseRequestBody.bookingData.customer.name,
        email: baseRequestBody.bookingData.customer.email,
        phone: baseRequestBody.bookingData.customer.phone,
        notes: baseRequestBody.bookingData.customer.notes,
        saveInfoForFuture: baseRequestBody.bookingData.customer.saveInfoForFuture,
      },
      payment: {
        tipAmount: baseRequestBody.bookingData.payment.tipAmount,
        tipPercent: 0,
        balanceDue: 0,
        depositAmount: 150,
        depositPaid: true,
        totalAmount: baseRequestBody.bookingData.payment.totalAmount,
      },
      status: 'pending',
    });
    mockSendBookingVerificationEmail.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);

    const request = new Request('http://localhost/api/payment/process-payment', {
      method: 'POST',
      body: JSON.stringify(baseRequestBody),
      headers: {
        'Content-Type': 'application/json',
        // An attacker-controlled header. Must NOT put the route into smoke-test mode —
        // only process.env.SMOKE_TEST_MODE may do that.
        'x-smoke-test': 'true',
      },
    });

    const response = await POST(request);
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(mockProcessPayment).toHaveBeenCalledTimes(1);
    expect(mockProcessPayment).toHaveBeenCalledWith('tok_test', 15000, 'USD', 'temp-booking-id');
    expect(payload.paymentId).toBe('pay-real');
  });

  it('returns 400 when amount is not an integer (must be cents)', async () => {
    const response = await POST(buildRequest({ ...baseRequestBody, amount: 150.5 }));
    const payload = await response!.json();
    expect(response!.status).toBe(400);
    expect(payload.error).toContain('Invalid amount');
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  it('returns 400 when tipAmount is negative', async () => {
    const response = await POST(buildRequest({ ...baseRequestBody, tipAmount: -100 }));
    const payload = await response!.json();
    expect(response!.status).toBe(400);
    expect(payload.error).toContain('Invalid tipAmount');
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  it('returns 400 when payment processing fails and skips booking creation', async () => {
    mockProcessPayment.mockResolvedValueOnce({ success: false });

    const response = await POST(buildRequest(baseRequestBody));
    const payload = await response!.json();

    expect(response!.status).toBe(400);
    expect(payload.error).toBe('Payment processing failed');

    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
    expect(mockSendBookingVerificationEmail).not.toHaveBeenCalled();
    expect(mockSendSms).not.toHaveBeenCalled();
  });

  it('continues successfully even if notifications fail', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-002',
      paymentId: 'pay-002',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });

    mockCreateBookingAtomic.mockResolvedValueOnce({ bookingId: 'booking-456' });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-456',
      trip: {
        pickup: baseRequestBody.bookingData.trip.pickup,
        dropoff: baseRequestBody.bookingData.trip.dropoff,
        pickupDateTime: baseRequestBody.bookingData.trip.pickupDateTime,
        fareType: baseRequestBody.bookingData.trip.fareType,
        flightInfo: baseRequestBody.bookingData.trip.flightInfo,
      },
      customer: {
        name: baseRequestBody.bookingData.customer.name,
        email: baseRequestBody.bookingData.customer.email,
        phone: baseRequestBody.bookingData.customer.phone,
        notes: baseRequestBody.bookingData.customer.notes,
        saveInfoForFuture: baseRequestBody.bookingData.customer.saveInfoForFuture,
      },
      payment: {
        tipAmount: baseRequestBody.bookingData.payment.tipAmount,
        tipPercent: 0,
        balanceDue: 0,
        depositAmount: 150,
        depositPaid: true,
        totalAmount: baseRequestBody.bookingData.payment.totalAmount,
      },
      status: 'pending',
    });
    mockSendBookingVerificationEmail.mockRejectedValueOnce(new Error('SMTP down'));
    mockSendSms.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest(baseRequestBody));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.bookingId).toBe('booking-456');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send verification notifications:',
      expect.any(Error)
    );
  });

  it('auto-refunds the payment when booking creation fails after a successful charge (regression: customer used to be left charged with no booking and no refund)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-conflict',
      paymentId: 'pay-conflict',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });
    mockCreateBookingAtomic.mockRejectedValueOnce(new Error('Time slot conflicts with existing bookings'));
    mockRefundPayment.mockResolvedValueOnce({ success: true, refundId: 'refund-1' });

    const response = await POST(buildRequest(baseRequestBody));

    expect(response!.status).toBe(500);
    expect(mockRefundPayment).toHaveBeenCalledWith(
      'pay-conflict',
      15000,
      'USD',
      'Automatic refund: booking creation failed after payment'
    );
  });

  it('logs a critical error (but still surfaces the original failure) when the auto-refund itself fails', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-conflict-2',
      paymentId: 'pay-conflict-2',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });
    mockCreateBookingAtomic.mockRejectedValueOnce(new Error('Time slot conflicts with existing bookings'));
    mockRefundPayment.mockRejectedValueOnce(new Error('Square refund API down'));

    const response = await POST(buildRequest(baseRequestBody));

    expect(response!.status).toBe(500);
    expect(mockRefundPayment).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('CRITICAL'),
      expect.any(Error)
    );
  });

  it('syncs balanceDue/depositPaid/tipAmount on the existing booking when paying a remaining balance (regression: this path never wrote anything back to the booking)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-balance',
      paymentId: 'pay-balance',
      status: 'COMPLETED',
      amount: 5000,
      currency: 'USD',
    });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-existing',
      customer: { name: 'Jane Doe' },
      balanceDue: 75,
      tipAmount: 5,
    });
    mockUpdateBooking.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({
      ...baseRequestBody,
      amount: 5000,
      tipAmount: 1000,
      existingBookingId: 'booking-existing',
      bookingData: undefined,
    }));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.bookingId).toBe('booking-existing');
    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-existing', {
      depositPaid: true,
      balanceDue: 25, // 75 - (5000 cents / 100)
      tipAmount: 15, // 5 existing + (1000 cents / 100)
      payment: {
        depositAmount: null,
        squareOrderId: undefined,
        squarePaymentId: undefined,
        tipPercent: 0,
        totalAmount: 0,
        depositPaid: true,
        balanceDue: 25,
        tipAmount: 15,
      },
    });
  });

  it('also syncs the nested payment.* fields, preserving unrelated payment fields (regression: Firestore .update() replaces a nested object wholesale rather than merging it, and booking-helpers.ts/bookings-utils.ts read booking.payment.* before the legacy top-level fields — writing only the legacy fields left the admin dashboard showing the stale pre-payment balance/deposit/tip state)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-balance-2',
      paymentId: 'pay-balance-2',
      status: 'COMPLETED',
      amount: 3000,
      currency: 'USD',
    });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-existing-2',
      customer: { name: 'Jane Doe' },
      payment: {
        depositAmount: 150,
        depositPaid: true,
        balanceDue: 50,
        tipAmount: 0,
        tipPercent: 0,
        totalAmount: 200,
      },
    });
    mockUpdateBooking.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest({
      ...baseRequestBody,
      amount: 3000,
      tipAmount: 0,
      existingBookingId: 'booking-existing-2',
      bookingData: undefined,
    }));

    expect(response!.status).toBe(200);
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-existing-2', {
      depositPaid: true,
      balanceDue: 20, // 50 - (3000 cents / 100)
      tipAmount: 0,
      payment: {
        depositAmount: 150, // preserved, not touched by this sync
        totalAmount: 200, // preserved, not touched by this sync
        depositPaid: true,
        balanceDue: 20,
        tipAmount: 0,
        tipPercent: 0,
      },
    });
  });

  it('returns the winning booking instead of creating a duplicate when this request loses the payment claim race (regression: Square\'s idempotency key dedupes the CHARGE for an identical retry, but nothing stopped this route from creating a second BOOKING for that one payment — e.g. a double-clicked submit firing two requests with the same token before either resolved)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-race',
      paymentId: 'pay-race',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });
    mockClaimPaymentForBookingCreation.mockResolvedValueOnce(false);
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-winner');

    const response = await POST(buildRequest(baseRequestBody));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.bookingId).toBe('booking-winner');
    expect(payload.paymentId).toBe('pay-race');
    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
  });

  it('falls through and creates a booking anyway if the payment claim is lost but no winning booking can be found within the poll window (rather than silently dropping a paid customer\'s booking)', async () => {
    mockProcessPayment.mockResolvedValueOnce({
      success: true,
      orderId: 'order-race-2',
      paymentId: 'pay-race-2',
      status: 'COMPLETED',
      amount: 15000,
      currency: 'USD',
    });
    mockClaimPaymentForBookingCreation.mockResolvedValueOnce(false);
    mockGetBookingIdBySquarePaymentId.mockResolvedValue(null);
    mockCreateBookingAtomic.mockResolvedValueOnce({ bookingId: 'booking-fallback' });
    mockGetBooking.mockResolvedValueOnce({
      id: 'booking-fallback',
      trip: {
        pickup: baseRequestBody.bookingData.trip.pickup,
        dropoff: baseRequestBody.bookingData.trip.dropoff,
        pickupDateTime: baseRequestBody.bookingData.trip.pickupDateTime,
        fareType: baseRequestBody.bookingData.trip.fareType,
        flightInfo: baseRequestBody.bookingData.trip.flightInfo,
      },
      customer: {
        name: baseRequestBody.bookingData.customer.name,
        email: baseRequestBody.bookingData.customer.email,
        phone: baseRequestBody.bookingData.customer.phone,
        notes: baseRequestBody.bookingData.customer.notes,
        saveInfoForFuture: baseRequestBody.bookingData.customer.saveInfoForFuture,
      },
      payment: {
        tipAmount: 0,
        tipPercent: 0,
        balanceDue: 0,
        depositAmount: 150,
        depositPaid: true,
        totalAmount: baseRequestBody.bookingData.payment.totalAmount,
      },
      status: 'pending',
    });
    mockSendBookingVerificationEmail.mockResolvedValueOnce(undefined);
    mockSendSms.mockResolvedValueOnce(undefined);

    const response = await POST(buildRequest(baseRequestBody));
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.bookingId).toBe('booking-fallback');
    expect(mockCreateBookingAtomic).toHaveBeenCalledTimes(1);
  }, 10_000);
});
