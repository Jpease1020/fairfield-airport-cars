import { beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal in-memory fake of the Admin SDK surface `rescheduleBookingAtomic` actually uses:
// db.collection(name).doc(id) for building refs, and db.runTransaction(callback) providing a
// transaction with get/set/update backed by the same store — enough to exercise the real
// read-check-write logic without a live Firestore emulator.
function createFakeAdminDb(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));

  const makeRef = (id: string) => ({
    id,
    _docId: id,
  });

  const db = {
    collection: (_name: string) => ({
      doc: (id: string) => makeRef(id),
    }),
    runTransaction: async (callback: (tx: any) => Promise<any>) => {
      const tx = {
        get: async (ref: any) => {
          const data = store.get(ref._docId);
          return {
            exists: data !== undefined,
            data: () => data,
          };
        },
        set: (ref: any, data: any) => {
          store.set(ref._docId, data);
        },
        update: (ref: any, data: any) => {
          const existing = store.get(ref._docId) ?? {};
          store.set(ref._docId, { ...existing, ...data });
        },
      };
      return callback(tx);
    },
  };

  return { db, store };
}

const getAdminDb = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: () => getAdminDb(),
}));

vi.mock('@/lib/utils/firebase-server', () => ({
  db: {},
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'server-timestamp' },
}));

let driverSchedulingService: typeof import('@/lib/services/driver-scheduling-service').driverSchedulingService;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ driverSchedulingService } = await import('@/lib/services/driver-scheduling-service'));
});

const baseParams = {
  driverId: 'gregg-driver-001',
  driverName: 'Driver',
  bookingId: 'booking-1',
  customerName: 'Jane Doe',
  pickupLocation: '123 Main St',
  dropoffLocation: 'JFK Airport',
};

describe('rescheduleBookingAtomic', () => {
  it('moves a booking to a new time on the same day when there is no conflict', async () => {
    const { db, store } = createFakeAdminDb({
      'gregg-driver-001_2026-08-01': {
        id: 'gregg-driver-001_2026-08-01',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-01',
        timeSlots: [
          { id: '09:00-10:00', startTime: '09:00', endTime: '10:00', isAvailable: false, status: 'booked', bookingId: 'booking-1', customerName: 'Jane Doe' },
          { id: '08:00-09:00', startTime: '08:00', endTime: '09:00', isAvailable: false, status: 'prep', bookingId: 'booking-1', customerName: 'Jane Doe' },
        ],
      },
    });
    getAdminDb.mockReturnValue(db);

    const result = await driverSchedulingService.rescheduleBookingAtomic({
      ...baseParams,
      oldDate: '2026-08-01',
      newDate: '2026-08-01',
      startTime: '14:00',
      endTime: '15:00',
    });

    expect(result.success).toBe(true);
    const updated = store.get('gregg-driver-001_2026-08-01');
    const bookedSlot = updated.timeSlots.find((s: any) => s.id === '14:00-15:00');
    expect(bookedSlot?.status).toBe('booked');
    expect(bookedSlot?.bookingId).toBe('booking-1');
    // The old 09:00-10:00 slot should now be free.
    const oldSlot = updated.timeSlots.find((s: any) => s.id === '09:00-10:00');
    expect(oldSlot?.status).toBe('available');
    expect(oldSlot?.bookingId).toBeUndefined();
  });

  it('moves a booking across two different days, freeing the old day and reserving the new day', async () => {
    const { db, store } = createFakeAdminDb({
      'gregg-driver-001_2026-08-01': {
        id: 'gregg-driver-001_2026-08-01',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-01',
        timeSlots: [
          { id: '09:00-10:00', startTime: '09:00', endTime: '10:00', isAvailable: false, status: 'booked', bookingId: 'booking-1', customerName: 'Jane Doe' },
        ],
      },
    });
    getAdminDb.mockReturnValue(db);

    const result = await driverSchedulingService.rescheduleBookingAtomic({
      ...baseParams,
      oldDate: '2026-08-01',
      newDate: '2026-08-02',
      startTime: '11:00',
      endTime: '12:00',
    });

    expect(result.success).toBe(true);

    const oldDay = store.get('gregg-driver-001_2026-08-01');
    const oldSlot = oldDay.timeSlots.find((s: any) => s.id === '09:00-10:00');
    expect(oldSlot?.status).toBe('available');

    const newDay = store.get('gregg-driver-001_2026-08-02');
    const newSlot = newDay.timeSlots.find((s: any) => s.id === '11:00-12:00');
    expect(newSlot?.status).toBe('booked');
    expect(newSlot?.bookingId).toBe('booking-1');
  });

  it('detects a conflict on the new day and does not write anything (regression: the old cancel-then-book sequence had no re-check inside a single atomic operation, so two concurrent reschedules — or a reschedule racing a fresh booking for the same slot — could both pass an earlier check and one would silently clobber the other)', async () => {
    const { db, store } = createFakeAdminDb({
      'gregg-driver-001_2026-08-01': {
        id: 'gregg-driver-001_2026-08-01',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-01',
        timeSlots: [
          { id: '09:00-10:00', startTime: '09:00', endTime: '10:00', isAvailable: false, status: 'booked', bookingId: 'booking-1', customerName: 'Jane Doe' },
        ],
      },
      'gregg-driver-001_2026-08-02': {
        id: 'gregg-driver-001_2026-08-02',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-02',
        timeSlots: [
          // A different booking already occupies the requested new slot.
          { id: '11:00-12:00', startTime: '11:00', endTime: '12:00', isAvailable: false, status: 'booked', bookingId: 'booking-OTHER', customerName: 'Other Customer' },
        ],
      },
    });
    getAdminDb.mockReturnValue(db);

    const result = await driverSchedulingService.rescheduleBookingAtomic({
      ...baseParams,
      oldDate: '2026-08-01',
      newDate: '2026-08-02',
      startTime: '11:00',
      endTime: '12:00',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.conflict.hasConflict).toBe(true);
      expect(result.conflict.conflictingBookings[0].bookingId).toBe('booking-OTHER');
    }

    // Nothing should have been written — the old day's slot is still booked (not freed), and the
    // conflicting booking on the new day is untouched.
    const oldDay = store.get('gregg-driver-001_2026-08-01');
    expect(oldDay.timeSlots.find((s: any) => s.id === '09:00-10:00')?.status).toBe('booked');
    const newDay = store.get('gregg-driver-001_2026-08-02');
    expect(newDay.timeSlots.find((s: any) => s.id === '11:00-12:00')?.bookingId).toBe('booking-OTHER');
  });

  it('detects a conflict when the requested ride itself spans midnight (regression: overlap-checking only handled a slot spanning midnight, never the requested range — real quoted ride durations up to 6 hours make a late-evening pickup cross midnight far more often than the old flat 2-hour assumption did)', async () => {
    const { db, store } = createFakeAdminDb({
      'gregg-driver-001_2026-08-01': {
        id: 'gregg-driver-001_2026-08-01',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-01',
        timeSlots: [
          // An early-morning booking that the new 10pm-to-3am ride genuinely overlaps.
          { id: '01:00-02:00', startTime: '01:00', endTime: '02:00', isAvailable: false, status: 'booked', bookingId: 'booking-EARLY', customerName: 'Early Riser' },
        ],
      },
    });
    getAdminDb.mockReturnValue(db);

    const result = await driverSchedulingService.rescheduleBookingAtomic({
      ...baseParams,
      oldDate: '2026-07-31',
      newDate: '2026-08-01',
      startTime: '22:00',
      endTime: '03:00', // crosses midnight — a real 5-hour quoted duration from a 10pm pickup
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.conflict.conflictingBookings[0].bookingId).toBe('booking-EARLY');
    }
    expect(store.get('gregg-driver-001_2026-08-01').timeSlots.find((s: any) => s.id === '01:00-02:00')?.status).toBe('booked');
  });

  it('creates a schedule document for the new day when none exists yet', async () => {
    const { db, store } = createFakeAdminDb({
      'gregg-driver-001_2026-08-01': {
        id: 'gregg-driver-001_2026-08-01',
        driverId: 'gregg-driver-001',
        driverName: 'Driver',
        date: '2026-08-01',
        timeSlots: [
          { id: '09:00-10:00', startTime: '09:00', endTime: '10:00', isAvailable: false, status: 'booked', bookingId: 'booking-1', customerName: 'Jane Doe' },
        ],
      },
    });
    getAdminDb.mockReturnValue(db);

    const result = await driverSchedulingService.rescheduleBookingAtomic({
      ...baseParams,
      oldDate: '2026-08-01',
      newDate: '2026-09-15',
      startTime: '11:00',
      endTime: '12:00',
    });

    expect(result.success).toBe(true);
    const newDay = store.get('gregg-driver-001_2026-09-15');
    expect(newDay).toBeDefined();
    expect(newDay.timeSlots.find((s: any) => s.id === '11:00-12:00')?.bookingId).toBe('booking-1');
  });
});
