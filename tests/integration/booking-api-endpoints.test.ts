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

    it('never leaks other customers\' names or booking IDs to this public, unauthenticated endpoint', async () => {
      checkBookingConflicts.mockResolvedValueOnce({
        hasConflict: true,
        conflictingBookings: [
          { bookingId: 'secret-booking-1', customerName: 'Jane Rider', timeSlot: '10:00-12:00', driverName: 'Gregg' },
        ],
        suggestedTimeSlots: ['13:00-15:00'],
      });

      const { POST } = await import('@/app/api/booking/check-time-slot/route');
      const response = await POST(
        makeNextRequest('http://localhost/api/booking/check-time-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-03-05', startTime: '10:00', endTime: '12:00' }),
        }) as any
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.conflictingBookings).toEqual([{ timeSlot: '10:00-12:00' }]);
      const rawBody = JSON.stringify(body);
      expect(rawBody).not.toContain('Jane Rider');
      expect(rawBody).not.toContain('secret-booking-1');
    });
  });

  describe('PUT /api/booking/[bookingId] — tracking-token flight-info flow (guest, no Firebase session)', () => {
    const existingFlightInfo = { hasFlight: false, airline: '', flightNumber: '', arrivalTime: '', terminal: '' };
    const baseBookingData = {
      status: 'pending',
      trackingToken: 'track-abc',
      trip: {
        pickup: { address: '123 Main St', coordinates: null },
        dropoff: { address: 'JFK', coordinates: null },
        pickupDateTime: makeTimestamp('2026-04-01T10:00:00.000Z'),
        flightInfo: existingFlightInfo,
      },
      customer: { name: 'Test Rider', email: 'rider@example.com', phone: '+12035551234' },
      createdAt: makeTimestamp('2026-03-01T00:00:00.000Z'),
      updatedAt: makeTimestamp('2026-03-01T00:00:00.000Z'),
    };

    const mockBookingDb = () => {
      const docUpdate = vi.fn().mockResolvedValue(undefined);
      const docGet = vi.fn().mockResolvedValue({ exists: true, id: 'booking-1', data: () => baseBookingData });
      getAdminDb.mockReturnValue({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: docGet,
            update: docUpdate,
          })),
        })),
      });
      return { docUpdate, docGet };
    };

    it('allows tracking-token access to save flight info', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      const { docUpdate } = mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flightInfo: { hasFlight: true, airline: 'Delta', flightNumber: 'DL123', arrivalTime: '', terminal: '4' },
            }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(200);
      expect(docUpdate).toHaveBeenCalled();
      const updatePayload = docUpdate.mock.calls[0][0] as any;
      expect(updatePayload.trip.flightInfo.flightNumber).toBe('DL123');
      expect(updatePayload.flightNumber).toBe('DL123');
      const body = await response.json();
      expect(body.changedFields).toContain('flight info');
    });

    it('normalizes hasFlight to false when true but every flight detail field is blank, so it matches the existing (also blank) state and is not reported as a change (regression: hasFlight:true with all-blank fields used to be stored as-is and trigger a "flight info changed" admin SMS for what was really a no-op)', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flightInfo: { hasFlight: true, airline: '', flightNumber: '', arrivalTime: '', terminal: '' },
            }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.changedFields).toEqual([]);
    });

    it('normalizes hasFlight to false when true but every flight detail field is blank, even when other detail fields (e.g. a leftover terminal) are non-blank on their own — airline/flightNumber/arrivalTime are what matter for pickup planning', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      const { docUpdate } = mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flightInfo: { hasFlight: true, airline: '', flightNumber: '', arrivalTime: '', terminal: '4' },
            }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(200);
      const updatePayload = docUpdate.mock.calls[0][0] as any;
      expect(updatePayload.trip.flightInfo.hasFlight).toBe(false);
    });

    it('does not crash when a flight detail field arrives as a non-string value (regression: this route has no schema validation on `updates`, so a malformed JSON body with e.g. flightInfo.airline as a number used to hit `.trim()` on a non-string and throw a 500 instead of a controlled response)', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flightInfo: { hasFlight: true, airline: 12345, flightNumber: null, arrivalTime: {}, terminal: '' },
            }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(200);
    });

    it('rejects tracking-token access trying to change fields other than flightInfo', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      const { docUpdate } = mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer: { name: 'Hacked Name' } }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(403);
      expect(docUpdate).not.toHaveBeenCalled();
    });

    it('does not report a change (and skips the admin SMS trigger) when flight info is unchanged', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' });
      mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1?token=track-abc', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightInfo: existingFlightInfo }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.changedFields).toEqual([]);
    });

    it('rejects a request with no valid access (no session, no tracking token)', async () => {
      requireOwnerAdminOrTrackingToken.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
      });
      const { docUpdate } = mockBookingDb();

      const { PUT } = await import('@/app/api/booking/[bookingId]/route');
      const response = ensureResponse(
        await PUT(
          makeNextRequest('http://localhost/api/booking/booking-1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightInfo: { hasFlight: true, airline: 'Delta', flightNumber: 'DL123', arrivalTime: '', terminal: '4' } }),
          }) as any,
          { params: Promise.resolve({ bookingId: 'booking-1' }) }
        )
      );

      expect(response.status).toBe(401);
      expect(docUpdate).not.toHaveBeenCalled();
    });
  });
});
