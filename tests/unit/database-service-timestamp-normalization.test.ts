import { describe, it, expect, vi, beforeEach } from 'vitest';

const getDocs = vi.fn();
const collection = vi.fn(() => 'bookings-collection-ref');
const query = vi.fn((...args) => args);
const where = vi.fn(() => 'where-clause');
const orderBy = vi.fn(() => 'orderby-clause');

vi.mock('firebase/firestore', () => ({
  collection,
  getDocs,
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query,
  where,
  orderBy,
  serverTimestamp: vi.fn(),
}));

vi.mock('@/lib/utils/firebase-server', () => ({
  db: {},
}));

// Mimics a real Firestore Timestamp: has a .toDate() method, is NOT a Date instance.
function fakeFirestoreTimestamp(iso: string) {
  const date = new Date(iso);
  return { _seconds: Math.floor(date.getTime() / 1000), _nanoseconds: 0, toDate: () => date };
}

describe('database-service.ts — Timestamp normalization (admin bookings page read path)', () => {
  let getAllBookings: typeof import('@/lib/services/database-service').getAllBookings;
  let getBookingsByStatus: typeof import('@/lib/services/database-service').getBookingsByStatus;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ getAllBookings, getBookingsByStatus } = await import('@/lib/services/database-service'));
  });

  it('getAllBookings normalizes a raw Firestore Timestamp on trip.pickupDateTime (regression: this is a separate read path from booking-service.ts and had the identical bug)', async () => {
    const pickupIso = '2026-08-05T12:00:00.000Z';
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'booking-1',
          data: () => ({
            status: 'confirmed',
            trip: {
              pickup: { address: '123 Main St' },
              dropoff: { address: 'JFK' },
              pickupDateTime: fakeFirestoreTimestamp(pickupIso),
            },
            createdAt: fakeFirestoreTimestamp('2026-07-01T00:00:00.000Z'),
            updatedAt: fakeFirestoreTimestamp('2026-07-01T00:00:00.000Z'),
          }),
        },
      ],
    });

    const bookings = await getAllBookings();

    expect(bookings).toHaveLength(1);
    expect(bookings[0].trip?.pickupDateTime).toBeInstanceOf(Date);
    expect((bookings[0].trip?.pickupDateTime as Date).toISOString()).toBe(pickupIso);
    expect(new Date(bookings[0].trip!.pickupDateTime as string).getTime()).not.toBeNaN();
  });

  it('getBookingsByStatus normalizes trip.pickupDateTime the same way', async () => {
    const pickupIso = '2026-08-06T08:30:00.000Z';
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'booking-2',
          data: () => ({
            status: 'pending',
            trip: {
              pickup: { address: '456 Elm St' },
              dropoff: { address: 'LGA' },
              pickupDateTime: fakeFirestoreTimestamp(pickupIso),
            },
            createdAt: fakeFirestoreTimestamp('2026-07-01T00:00:00.000Z'),
            updatedAt: fakeFirestoreTimestamp('2026-07-01T00:00:00.000Z'),
          }),
        },
      ],
    });

    const bookings = await getBookingsByStatus('pending');

    expect(bookings).toHaveLength(1);
    expect(bookings[0].trip?.pickupDateTime).toBeInstanceOf(Date);
    expect((bookings[0].trip?.pickupDateTime as Date).toISOString()).toBe(pickupIso);
  });
});
