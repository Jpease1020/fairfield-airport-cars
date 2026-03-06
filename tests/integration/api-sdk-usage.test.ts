import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAdminDb = vi.fn();
const requireAuth = vi.fn();
const requireAdmin = vi.fn();
const requireOwnerOrAdmin = vi.fn();
const requireOwnerAdminOrTrackingToken = vi.fn();
const getBooking = vi.fn();
const sendConfirmationEmail = vi.fn().mockResolvedValue(undefined);
const adaptOldBookingToNew = vi.fn((booking) => booking);
const createBookingCalendarEvent = vi.fn().mockResolvedValue(null);

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/utils/auth-server', () => ({
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  requireOwnerAdminOrTrackingToken,
}));

vi.mock('@/lib/services/booking-service', () => ({
  getBooking,
}));

vi.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail,
}));

vi.mock('@/utils/bookingAdapter', () => ({
  adaptOldBookingToNew,
}));

vi.mock('@/lib/services/google-calendar', () => ({
  createBookingCalendarEvent,
}));

function makeNextRequest(url: string, init?: RequestInit): Request {
  const request = new Request(url, init) as Request & { nextUrl: URL };
  request.nextUrl = new URL(url);
  return request;
}

function makeTimestamp(iso: string) {
  return {
    toDate: () => new Date(iso),
  };
}

function ensureResponse(response: Response | undefined): Response {
  expect(response).toBeDefined();
  if (!response) {
    throw new Error('Expected route handler to return a response');
  }
  return response;
}

describe('API access and confirmation flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAuth.mockResolvedValue({ ok: true, auth: { role: 'customer', uid: 'cust-1' } });
    requireAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });
    requireOwnerOrAdmin.mockResolvedValue({ ok: true, auth: { role: 'customer', uid: 'cust-1' } });
    requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: { role: 'customer', uid: 'cust-1' }, access: 'owner' });
  });

  describe('GET /api/booking/get-bookings-simple', () => {
    it('returns auth response when request is not authorized', async () => {
      requireAuth.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
      });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple?id=booking-1') as any)
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns booking data for authorized owner access', async () => {
      const timestamp = makeTimestamp('2026-03-05T10:00:00.000Z');
      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: 'booking-1',
              data: () => ({
                status: 'confirmed',
                createdAt: timestamp,
                updatedAt: timestamp,
                pickupDateTime: timestamp,
                confirmation: {
                  status: 'pending',
                  token: 'secret-token',
                  sentAt: timestamp,
                },
              }),
            }),
          })),
        })),
      });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple?id=booking-1') as any)
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.booking.id).toBe('booking-1');
      expect(body.booking.createdAt).toBe('2026-03-05T10:00:00.000Z');
      expect(body.booking.confirmation.token).toBeUndefined();
    });

    it('returns booking data for valid tracking-token access without auth', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({
        ok: true,
        auth: null,
        access: 'tracking-token',
      });

      const timestamp = makeTimestamp('2026-03-05T10:00:00.000Z');
      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: 'booking-1',
              data: () => ({
                status: 'confirmed',
                trackingToken: 'track-123',
                createdAt: timestamp,
                updatedAt: timestamp,
                pickupDateTime: timestamp,
                confirmation: {
                  status: 'pending',
                  token: 'secret-token',
                  sentAt: timestamp,
                },
              }),
            }),
          })),
        })),
      });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple?id=booking-1&token=track-123') as any)
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.booking.id).toBe('booking-1');
      expect(body.booking.confirmation.token).toBeUndefined();
    });
  });

  describe('POST /api/booking/confirm', () => {
    it('returns 400 when bookingId or token is missing', async () => {
      const { POST } = await import('@/app/api/booking/confirm/route');
      const response = ensureResponse(
        await POST(
          makeNextRequest('http://localhost/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: 'booking-1' }),
          }) as any
        )
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('required');
    });

    it('returns 401 when confirmation token does not match', async () => {
      const docGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          status: 'pending',
          confirmation: {
            status: 'pending',
            token: 'expected-token',
            sentAt: '2026-03-05T10:00:00.000Z',
          },
        }),
      });

      const docUpdate = vi.fn().mockResolvedValue(undefined);

      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: docGet,
            update: docUpdate,
          })),
        })),
      });

      const { POST } = await import('@/app/api/booking/confirm/route');
      const response = ensureResponse(
        await POST(
          makeNextRequest('http://localhost/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: 'booking-1', token: 'wrong-token' }),
          }) as any
        )
      );

      expect(response.status).toBe(401);
      expect(docUpdate).not.toHaveBeenCalled();
      const body = await response.json();
      expect(body.error).toContain('Invalid confirmation token');
    });

    it('confirms booking and sends confirmation email when token matches', async () => {
      const docUpdate = vi.fn().mockResolvedValue(undefined);
      const bookingDocData = {
        status: 'pending',
        calendarAddedByUser: false,
        confirmation: {
          status: 'pending',
          token: 'expected-token',
          sentAt: '2026-03-05T10:00:00.000Z',
        },
      };

      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ exists: true, data: () => bookingDocData }),
            update: docUpdate,
          })),
        })),
      });

      getBooking.mockResolvedValue({
        id: 'booking-1',
        status: 'confirmed',
        trip: {
          pickupDateTime: '2026-03-10T10:00:00.000Z',
          pickup: { address: '123 Main St' },
          dropoff: { address: 'JFK' },
        },
        customer: {
          name: 'Test Rider',
          email: 'test@example.com',
        },
      });

      const { POST } = await import('@/app/api/booking/confirm/route');
      const response = ensureResponse(
        await POST(
          makeNextRequest('http://localhost/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-smoke-test': 'true' },
            body: JSON.stringify({ bookingId: 'booking-1', token: 'expected-token' }),
          }) as any
        )
      );

      expect(response.status).toBe(200);
      expect(docUpdate).toHaveBeenCalled();
      expect(createBookingCalendarEvent).toHaveBeenCalledTimes(1);
      expect(adaptOldBookingToNew).toHaveBeenCalledTimes(1);
      expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
      const body = await response.json();
      expect(body.trackingToken).toBeNull();
    });
  });
});
