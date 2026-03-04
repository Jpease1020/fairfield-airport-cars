import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAdminDb = vi.fn();
const requireOwnerOrAdmin = vi.fn();
const createReview = vi.fn();
const hasBookingBeenReviewed = vi.fn();
const getBooking = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({ getAdminDb }));
vi.mock('@/lib/utils/auth-server', () => ({ requireOwnerOrAdmin }));
vi.mock('@/lib/services/review-service', () => ({ createReview, hasBookingBeenReviewed }));
vi.mock('@/lib/services/booking-service', async () => {
  const actual = await vi.importActual('@/lib/services/booking-service');
  return { ...(actual as object), getBooking };
});
vi.mock('@/lib/security/rate-limit', () => ({ enforceRateLimit: vi.fn(() => null) }));

function ensureResponse(response: Response | undefined): Response {
  expect(response).toBeDefined();
  if (!response) {
    throw new Error('Expected route handler to return a response');
  }
  return response;
}

describe('Customer journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const bookingData = {
      status: 'confirmed',
      trackingToken: 'valid-token',
      customer: { name: 'Test User', email: 'test@example.com' },
      trip: { pickupDateTime: new Date().toISOString() },
      confirmation: { status: 'pending', token: 'secret-confirm-token' },
      pickupDateTime: { toDate: () => new Date('2026-03-05T10:00:00.000Z') },
      createdAt: { toDate: () => new Date('2026-03-04T10:00:00.000Z') },
      updatedAt: { toDate: () => new Date('2026-03-04T10:05:00.000Z') },
    };

    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ exists: true, id: 'booking-123', data: () => bookingData }),
        })),
      })),
    });

    requireOwnerOrAdmin.mockResolvedValue({ ok: false, response: new Response('Forbidden', { status: 403 }) });
    hasBookingBeenReviewed.mockResolvedValue(false);
    createReview.mockResolvedValue('review-123');
    getBooking.mockResolvedValue({
      id: 'booking-123',
      status: 'completed',
      name: 'Test User',
      email: 'test@example.com',
      driverId: 'driver-1',
      driverName: 'Gregg',
      pickupDateTime: new Date('2026-03-05T10:00:00.000Z'),
    });
  });

  it('GET /api/booking/[bookingId] with valid token returns booking for that customer', async () => {
    const { GET } = await import('@/app/api/booking/[bookingId]/route');

    const req = new Request('http://localhost/api/booking/booking-123?token=valid-token') as any;
    req.nextUrl = new URL(req.url);

    const response = ensureResponse(
      await GET(req, { params: Promise.resolve({ bookingId: 'booking-123' }) })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe('booking-123');
    expect(data.confirmation.token).toBeUndefined();
  });

  it('GET /api/booking/[bookingId] with wrong token returns 403', async () => {
    const { GET } = await import('@/app/api/booking/[bookingId]/route');

    const req = new Request('http://localhost/api/booking/booking-123?token=wrong') as any;
    req.nextUrl = new URL(req.url);

    const response = ensureResponse(
      await GET(req, { params: Promise.resolve({ bookingId: 'booking-123' }) })
    );

    expect(response.status).toBe(403);
  });

  it('POST /api/reviews/submit records feedback for completed booking', async () => {
    requireOwnerOrAdmin.mockResolvedValue({ ok: true, auth: { role: 'customer' } });

    const { POST } = await import('@/app/api/reviews/submit/route');
    const response = ensureResponse(await POST(
      new Request('http://localhost/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: 'booking-123', rating: 5, comment: 'Great ride' }),
      })
    ));

    expect(response.status).toBe(200);
    expect(createReview).toHaveBeenCalledTimes(1);
  });
});
