import { beforeEach, describe, expect, it, vi } from 'vitest';

const docGet = vi.fn();
const getAdminDb = vi.fn(() => ({
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ get: docGet })),
  })),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/utils/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({ ok: true }),
  requireAdmin: vi.fn().mockResolvedValue({ ok: true }),
  requireOwnerAdminOrTrackingToken: vi.fn().mockResolvedValue({ ok: true, auth: null, access: 'tracking-token' }),
}));

const buildRequest = (bookingId: string, token = 'tok_123') =>
  new Request(`http://localhost/api/booking/get-bookings-simple?id=${bookingId}&token=${token}`);

describe('GET /api/booking/get-bookings-simple', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prefers trip.pickupDateTime over a stale legacy flat pickupDateTime (regression: Codex flagged the precedence was backwards vs getBooking()/getPickupDateTime())', async () => {
    const staleFlatDate = new Date('2020-01-01T00:00:00.000Z');
    const currentNestedDate = new Date('2027-06-01T10:00:00.000Z');

    docGet.mockResolvedValue({
      exists: true,
      data: () => ({
        pickupDateTime: staleFlatDate.toISOString(),
        trip: {
          pickupDateTime: currentNestedDate.toISOString(),
        },
      }),
    });

    const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
    const response = await GET(buildRequest('booking-123') as any);
    const payload = await response!.json();

    expect(payload.success).toBe(true);
    expect(payload.booking.pickupDateTime).toBe(currentNestedDate.toISOString());
    expect(payload.booking.trip.pickupDateTime).toBe(currentNestedDate.toISOString());
  });

  it('falls back to the legacy flat pickupDateTime when trip.pickupDateTime is absent', async () => {
    const flatDate = new Date('2027-06-01T10:00:00.000Z');

    docGet.mockResolvedValue({
      exists: true,
      data: () => ({
        pickupDateTime: flatDate.toISOString(),
      }),
    });

    const { GET } = await import('@/app/api/booking/get-bookings-simple/route');
    const response = await GET(buildRequest('booking-456') as any);
    const payload = await response!.json();

    expect(payload.success).toBe(true);
    expect(payload.booking.pickupDateTime).toBe(flatDate.toISOString());
  });
});
