import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { updateBooking } from '@/lib/services/booking-service';
import crypto from 'crypto';

vi.mock('@/lib/services/booking-service', () => ({
  updateBooking: vi.fn(),
}));

const mockUpdateBooking = updateBooking as unknown as ReturnType<typeof vi.fn>;

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
  orderId?: string,
  tipAmount?: number
) => ({
  type,
  data: {
    object: {
      payment: {
        order_id: orderId,
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
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns 401 when signature is invalid', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'order-123');
    const request = buildRequest(event, 'invalid-signature');

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('Invalid signature');
  });

  it('returns 401 when signature header is missing', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'order-123');
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
    const event = createPaymentEvent('payment.updated', 'PENDING', 'order-123');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Payment not completed or missing order id');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('ignores payment events missing order_id', async () => {
    const event = createPaymentEvent('payment.updated', 'COMPLETED', undefined);
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Payment not completed or missing order id');
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });

  it('confirms booking on valid payment.updated event', async () => {
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'booking-456');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking confirmed');
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-456', {
      status: 'confirmed',
      depositPaid: true,
      balanceDue: 0,
      tipAmount: undefined,
      updatedAt: expect.any(Date),
    });
  });

  it('confirms booking on valid payment.created event', async () => {
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.created', 'COMPLETED', 'booking-789');
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

  it('extracts tip amount from payment event', async () => {
    mockUpdateBooking.mockResolvedValueOnce(undefined);
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'booking-tip', 500); // $5.00 tip
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Booking confirmed');
    expect(mockUpdateBooking).toHaveBeenCalledWith('booking-tip', expect.objectContaining({
      tipAmount: 5, // Converted from cents to dollars
    }));
  });

  it('returns 500 when updateBooking fails', async () => {
    mockUpdateBooking.mockRejectedValueOnce(new Error('Database error'));
    const event = createPaymentEvent('payment.updated', 'COMPLETED', 'booking-fail');
    const request = buildRequest(event);

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe('Internal error');
  });
});
