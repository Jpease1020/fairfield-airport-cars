import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { processPayment } from '@/lib/services/square-service';
import { createBookingAtomic, getBooking } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { sendSms } from '@/lib/services/twilio-service';

vi.mock('@/lib/services/square-service', () => ({
  processPayment: vi.fn(),
}));

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: vi.fn(),
  getBooking: vi.fn(),
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

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

const mockProcessPayment = processPayment as unknown as ReturnType<typeof vi.fn>;
const mockCreateBookingAtomic = createBookingAtomic as unknown as ReturnType<typeof vi.fn>;
const mockGetBooking = getBooking as unknown as ReturnType<typeof vi.fn>;
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
      pickupDateTime: '2028-01-01T15:00:00.000Z',
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
            normalizedPickupDateTimeIso: '2028-01-01T15:00:00.000Z',
            businessPickupDateTime: '1/1/2028, 10:00 AM',
          }),
        ]),
      })
    );
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+15555550123',
      body: expect.stringContaining('1/1/2028, 10:00 AM'),
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

  it('rejects a new booking pickup time less than 24h out BEFORE charging the card (regression: this check used to only run inside createPaidBookingAndNotify, after Square had already been charged, with no refund path)', async () => {
    const soonPayload = {
      ...baseRequestBody,
      bookingData: {
        ...baseRequestBody.bookingData,
        trip: {
          ...baseRequestBody.bookingData.trip,
          pickupDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      },
    };

    const response = await POST(buildRequest(soonPayload));
    const payload = await response!.json();

    expect(response!.status).toBe(400);
    expect(payload.code).toBe('MINIMUM_ADVANCE_NOTICE');
    expect(mockProcessPayment).not.toHaveBeenCalled();
    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
  });

  it('rejects an invalid or missing pickup date/time BEFORE charging the card (regression: an invalid Date made the advance-notice guard silently no-op — Number.isNaN(parsedDate.getTime()) short-circuited the whole check to skipped rather than rejected — so the charge went through and only createPaidBookingAndNotify caught it afterward, once the card was already charged)', async () => {
    const invalidDatePayload = {
      ...baseRequestBody,
      bookingData: {
        ...baseRequestBody.bookingData,
        trip: {
          ...baseRequestBody.bookingData.trip,
          pickupDateTime: 'not-a-real-date',
        },
      },
    };

    const response = await POST(buildRequest(invalidDatePayload));
    const payload = await response!.json();

    expect(response!.status).toBe(400);
    expect(payload.code).toBe('INVALID_PICKUP_DATETIME');
    expect(mockProcessPayment).not.toHaveBeenCalled();
    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
  });
});
