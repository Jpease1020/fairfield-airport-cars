import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { updateBooking, getBookingIdBySquarePaymentId } from '@/lib/services/booking-service';
import crypto from 'crypto';

vi.mock('@/lib/services/booking-service', () => ({
  updateBooking: vi.fn(),
  getBookingIdBySquarePaymentId: vi.fn(),
}));

const processedEventGet = vi.fn().mockResolvedValue({ exists: false });
const processedEventSet = vi.fn().mockResolvedValue(undefined);
const getAdminDb = vi.fn(() => ({
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ get: processedEventGet, set: processedEventSet })),
  })),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

const mockUpdateBooking = updateBooking as unknown as ReturnType<typeof vi.fn>;
const mockGetBookingIdBySquarePaymentId = getBookingIdBySquarePaymentId as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/payment/square-webhook/route').POST;

const MOCK_SIGNATURE_KEY = 'test-signature-key-12345';
const MOCK_BASE_URL = 'https://test.example.com';

beforeAll(async () => {
  vi.stubEnv('SQUARE_WEBHOOK_SIGNATURE_KEY', MOCK_SIGNATURE_KEY);
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', MOCK_BASE_URL);
  ({ POST } = await import('@/app/api/payment/square-webhook/route'));
});

const generateSignature = (body: string, url: string): string => {
  const hmac = crypto.createHmac('sha256', MOCK_SIGNATURE_KEY);
  hmac.update(url + body);
  return hmac.digest('base64');
};

const buildRequest = (body: Record<string, unknown>, signature?: string) => {
  const rawBody = JSON.stringify(body);
  const url = `${MOCK_BASE_URL}/api/payment/square-webhook`;
  const validSignature = signature ?? generateSignature(rawBody, url);

  return {
    text: () => Promise.resolve(rawBody),
    headers: {
      get: (name: string) => {
        if (name === 'x-square-hmacsha256-signature') return validSignature;
        return null;
      },
    },
  } as unknown as Request;
};

const createPaymentEvent = (
  type: string,
  status: string,
  paymentId?: string,
  tipAmount?: number
) => ({
  type,
  data: {
    object: {
      payment: {
        id: paymentId,
        order_id: paymentId ? `square-order-${paymentId}` : undefined,
        status,
        ...(tipAmount !== undefined && { tip_money: { amount: tipAmount } }),
      },
    },
  },
});

describe('POST /api/payment/square-webhook', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processedEventGet.mockResolvedValue({ exists: false });
    processedEventSet.mockResolvedValue(undefined);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns 401 when signature is invalid', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-123');
    const request = buildRequest(event, 'invalid-signature');

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('Invalid signature');
  });

  it('returns 401 when signature header is missing', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-123');
    const rawBody = JSON.stringify(event);

    const request = {
      text: () => Promise.resolve(rawBody),
      headers: {
        get: () => null,
      },
    } as unknown as Request;

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('Invalid signature');
  });

  it('ignores non-payment events', async () => {
    const event = { type: 'order.created', data: {} };
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Event ignored');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('ignores payment events that are not COMPLETED', async () => {
    const event = createPaymentEvent('payment.updated', 'PENDING', 'pay-123');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Payment not completed or missing payment id');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('ignores payment events missing payment id (regression: previously checked order_id, which Square never ties to our booking ID)', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', undefined);
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Payment not completed or missing payment id');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('looks up the booking by squarePaymentId rather than trusting order_id as the booking ID (regression: order_id is Square-internal and never matches our Firestore doc ID)', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-456');
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-456');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(mockGetBookingIdBySquarePaymentId).toHaveBeenCalledWith('pay-456');
    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking confirmed');
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-456', {
      status: 'confirmed',
      depositPaid: true,
      balanceDue: 0,
      updatedAt: expect.any(Date),
    });
  });

  it('returns a no-match message and does not call updateBooking when no booking has this squarePaymentId', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce(null);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-orphan');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('No matching booking for this payment');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('confirms booking on valid payment.created event', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-789');
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.created', 'COMPLETED', 'pay-789');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking confirmed');
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-789', expect.objectContaining({
      status: 'confirmed',
      depositPaid: true,
    }));
  });

  it('does not set tipAmount at all when there is no tip (regression: previously set tipAmount: undefined, which Firestore Admin SDK rejects and throws on)', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-no-tip');
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-no-tip');
    const request = buildRequest(event);

    await POST(request);

    const updateArg = mockUpdateBooking.mock.calls[0][1];
    expect('tipAmount' in updateArg).toBe(false);
  });

  it('extracts tip amount from payment event', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-tip');
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-tip', 500); // $5.00 tip
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking confirmed');
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-tip', expect.objectContaining({
      tipAmount: 5, // Converted from cents to dollars
    }));
  });

  it('skips reprocessing an already-handled event (regression: no dedup previously existed at all)', async () => {
    processedEventGet.mockResolvedValueOnce({ exists: true });
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-dup');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Already processed');
    expect(mockGetBookingIdBySquarePaymentId).not.toHaveBeenCalled();
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('returns 500 when updateBooking fails', async () => {
    mockGetBookingIdBySquarePaymentId.mockResolvedValueOnce('booking-fail');
    mockUpdateBooking.mockRejectedValueOnce(new Error('Database error'));
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'pay-fail');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe('Internal error');
  });
});
