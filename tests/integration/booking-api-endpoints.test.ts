import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAuth = vi.fn();
const requireAdmin = vi.fn();
const requireOwnerOrAdmin = vi.fn();
const requireOwnerAdminOrTrackingToken = vi.fn();
const getAuthContext = vi.fn();
const getAdminDb = vi.fn();
const checkBookingConflicts = vi.fn();
const getAvailableDriversForTimeSlot = vi.fn();
const submitBookingOrchestration = vi.fn();

class MockBookingApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : 'Booking request failed');
    this.status = status;
    this.body = body;
  }
}

vi.mock('@/lib/utils/auth-server', () => ({
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  requireOwnerAdminOrTrackingToken,
  getAuthContext,
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/security/rate-limit', () => ({
  enforceRateLimit: vi.fn(() => null),
}));

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts,
    getAvailableDriversForTimeSlot,
  },
}));

vi.mock('@/lib/services/booking-orchestrator', () => ({
  BookingApiError: MockBookingApiError,
  submitBookingOrchestration,
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

describe('Booking API Endpoints - Deterministic Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAuth.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });
    requireAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });
    requireOwnerOrAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });
    requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' }, access: 'admin' });
    getAuthContext.mockResolvedValue({ uid: 'admin-1' });

    checkBookingConflicts.mockResolvedValue({
      hasConflict: false,
      conflictingBookings: [],
      suggestedTimeSlots: [],
    });
    getAvailableDriversForTimeSlot.mockResolvedValue([{ id: 'gregg-driver-001' }]);

    submitBookingOrchestration.mockResolvedValue({
      success: true,
      bookingId: 'booking-123',
      totalFare: 120,
      message: 'Booking created',
      emailWarning: null,
    });
  });

  describe('GET /api/booking/get-bookings-simple', () => {
    it('returns 404 when booking ID is unknown', async () => {
      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ exists: false }),
          })),
        })),
      });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple?id=missing') as any)
      );

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('serializes firestore timestamps and redacts confirmation token for non-admin access', async () => {
      const ts = makeTimestamp('2026-03-05T10:00:00.000Z');

      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: 'booking-123',
              data: () => ({
                pickupDateTime: ts,
                createdAt: ts,
                updatedAt: ts,
                confirmation: {
                  status: 'pending',
                  token: 'secret-token',
                  sentAt: ts,
                },
              }),
            }),
          })),
        })),
      });

      requireOwnerOrAdmin.mockResolvedValue({ ok: true, auth: { role: 'customer', uid: 'cust-1' } });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple?id=booking-123') as any)
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.booking.id).toBe('booking-123');
      expect(body.booking.createdAt).toBe('2026-03-05T10:00:00.000Z');
      expect(body.booking.updatedAt).toBe('2026-03-05T10:00:00.000Z');
      expect(body.booking.confirmation.token).toBeUndefined();
    });

    it('returns recent bookings for admin list request', async () => {
      const ts = makeTimestamp('2026-03-05T10:00:00.000Z');
      const query = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
          docs: [
            {
              id: 'booking-1',
              data: () => ({
                createdAt: ts,
                updatedAt: ts,
                pickupDateTime: ts,
              }),
            },
          ],
        }),
      };

      getAdminDb.mockReturnValue({
        collection: vi.fn(() => query),
      });

      const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-bookings-simple') as any)
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.bookings).toHaveLength(1);
      expect(body.bookings[0].createdAt).toBe('2026-03-05T10:00:00.000Z');
      expect(query.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(query.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('GET /api/booking/get-customer-bookings', () => {
    it('requires email or phone for admin requests', async () => {
      requireAuth.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });
      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({})),
      });

      const { GET } = await import('@/app/api/booking/get-customer-bookings/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-customer-bookings') as any)
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Email or phone');
    });

    it('returns customer bookings sorted by pickupDateTime', async () => {
      requireAuth.mockResolvedValue({
        ok: true,
        auth: { role: 'customer', uid: null, email: 'test@example.com', phone: null },
      });

      const early = makeTimestamp('2026-03-05T09:00:00.000Z');
      const late = makeTimestamp('2026-03-05T15:00:00.000Z');

      const query = {
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: 'late-booking',
              data: () => ({
                trip: { pickupDateTime: late },
                createdAt: late,
                updatedAt: late,
              }),
            },
            {
              id: 'early-booking',
              data: () => ({
                trip: { pickupDateTime: early },
                createdAt: early,
                updatedAt: early,
              }),
            },
          ],
        }),
      };

      getAdminDb.mockReturnValue({
        collection: vi.fn(() => query),
      });

      const { GET } = await import('@/app/api/booking/get-customer-bookings/route');
      const response = ensureResponse(
        await GET(makeNextRequest('http://localhost/api/booking/get-customer-bookings') as any)
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.bookings.map((booking: { id: string }) => booking.id)).toEqual([
        'early-booking',
        'late-booking',
      ]);
    });
  });

  describe('POST /api/booking/submit', () => {
    it('rejects invalid pickup datetime with 400', async () => {
      const { POST } = await import('@/app/api/booking/submit/route');

      const response = await POST(
        new Request('http://localhost/api/booking/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: 'quote-123',
            fare: 120,
            customer: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+12035550123',
              notes: '',
            },
            trip: {
              pickup: {
                address: '123 Main St',
                coordinates: null,
              },
              dropoff: {
                address: 'JFK Airport',
                coordinates: null,
              },
              pickupDateTime: 'not-a-date',
              fareType: 'personal',
            },
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid input');
      expect(submitBookingOrchestration).not.toHaveBeenCalled();
    });

    it('rejects pickup datetime without timezone offset with 400', async () => {
      const { POST } = await import('@/app/api/booking/submit/route');

      const response = await POST(
        new Request('http://localhost/api/booking/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: 'quote-123',
            fare: 120,
            customer: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+12035550123',
              notes: '',
            },
            trip: {
              pickup: {
                address: '123 Main St',
                coordinates: null,
              },
              dropoff: {
                address: 'JFK Airport',
                coordinates: null,
              },
              pickupDateTime: '2027-03-01T10:00:00',
              fareType: 'personal',
            },
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid input');
      expect(submitBookingOrchestration).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/booking/check-time-slot', () => {
    it('proxies to check-availability behavior', async () => {
      const { POST } = await import('@/app/api/booking/check-time-slot/route');

      const response = await POST(
        makeNextRequest('http://localhost/api/booking/check-time-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: '2026-03-05',
            startTime: '10:00',
            endTime: '12:00',
          }),
        }) as any
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.isAvailable).toBe(true);
      expect(body.hasConflict).toBe(false);
      expect(body.availableDrivers).toBe(1);
      expect(checkBookingConflicts).toHaveBeenCalledWith('2026-03-05', '10:00', '12:00');
      expect(getAvailableDriversForTimeSlot).toHaveBeenCalledWith('2026-03-05', '10:00', '12:00');
    });
  });
});
