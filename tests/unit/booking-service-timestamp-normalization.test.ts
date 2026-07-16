import { describe, it, expect, vi, beforeEach } from 'vitest';

const getAdminDb = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/services/driver-service', () => ({
  getDriver: vi.fn(),
}));

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts: vi.fn(),
    getAvailableDriversForTimeSlot: vi.fn(),
    getScheduleDocId: vi.fn(),
    generateTimeSlots: vi.fn(() => []),
  },
}));

vi.mock('@/utils/booking-id-generator', () => ({
  generateShortBookingId: vi.fn(() => 'booking_123'),
}));

vi.mock('@/lib/services/booking-availability', () => ({
  isTimeSlotAvailable: vi.fn(),
  getAvailableDrivers: vi.fn(),
}));

vi.mock('@/lib/services/booking-cancellation', () => ({
  cancelBooking: vi.fn(),
}));

// Mimics a real Firestore Timestamp: has a .toDate() method, is NOT a Date instance,
// and new Date(timestamp) does NOT produce a valid date (which is the root cause
// this regression test guards against).
function fakeFirestoreTimestamp(iso: string) {
  const date = new Date(iso);
  return {
    _seconds: Math.floor(date.getTime() / 1000),
    _nanoseconds: 0,
    toDate: () => date,
  };
}

describe('getBooking / getBookings — Timestamp normalization', () => {
  let getBooking: typeof import('@/lib/services/booking-service').getBooking;
  let getBookings: typeof import('@/lib/services/booking-service').getBookings;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ getBooking, getBookings } = await import('@/lib/services/booking-service'));
  });

  it('normalizes a raw Firestore Timestamp on trip.pickupDateTime into a real Date', async () => {
    const pickupIso = '2026-08-01T14:00:00.000Z';
    const rawBookingData = {
      status: 'pending',
      trip: {
        pickup: { address: '123 Main St' },
        dropoff: { address: 'JFK' },
        pickupDateTime: fakeFirestoreTimestamp(pickupIso),
      },
      customer: { name: 'Jane Doe', email: 'jane@example.com' },
      createdAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
      updatedAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
    };

    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'booking-1',
            data: () => rawBookingData,
          }),
        })),
      })),
    });

    const booking = await getBooking('booking-1');

    expect(booking).not.toBeNull();
    const trip = booking!.trip!;
    // This is the actual regression: before the fix, `trip.pickupDateTime` stayed a raw
    // Timestamp object, and `new Date(timestampObject)` produces an Invalid Date.
    expect(trip.pickupDateTime).toBeInstanceOf(Date);
    expect((trip.pickupDateTime as unknown as Date).toISOString()).toBe(pickupIso);
    expect(new Date(trip.pickupDateTime as unknown as string).getTime()).not.toBeNaN();
  });

  it('normalizes trip.pickupDateTime across a list of bookings via getBookings', async () => {
    const pickupIso = '2026-08-02T09:30:00.000Z';
    const rawBookingData = {
      status: 'confirmed',
      trip: {
        pickup: { address: '456 Elm St' },
        dropoff: { address: 'LGA' },
        pickupDateTime: fakeFirestoreTimestamp(pickupIso),
      },
      customer: { name: 'John Smith', email: 'john@example.com' },
      createdAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
      updatedAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
    };

    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
          docs: [{ id: 'booking-2', data: () => rawBookingData }],
        }),
      })),
    });

    const bookings = await getBookings();

    expect(bookings).toHaveLength(1);
    const trip = bookings[0].trip!;
    expect(trip.pickupDateTime).toBeInstanceOf(Date);
    expect((trip.pickupDateTime as unknown as Date).toISOString()).toBe(pickupIso);
  });

  it('falls back to the flat pickupDateTime field when trip is absent (legacy bookings)', async () => {
    const pickupIso = '2026-08-03T18:00:00.000Z';
    const rawBookingData = {
      status: 'pending',
      pickupDateTime: fakeFirestoreTimestamp(pickupIso),
      name: 'Legacy Booking',
      createdAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
      updatedAt: fakeFirestoreTimestamp('2026-07-01T10:00:00.000Z'),
    };

    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'booking-legacy',
            data: () => rawBookingData,
          }),
        })),
      })),
    });

    const booking = await getBooking('booking-legacy');

    expect(booking).not.toBeNull();
    expect(booking!.pickupDateTime).toBeInstanceOf(Date);
    expect((booking!.pickupDateTime as unknown as Date).toISOString()).toBe(pickupIso);
  });
});
