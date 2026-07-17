import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';

// The default (jsdom) test environment defines `window`, so getDb() takes the client-SDK branch
// (not the Admin SDK branch a real server process would use) — fake the client SDK query chain
// instead of fighting the environment.
vi.mock('@/lib/utils/firebase-server', () => ({ db: {} }));

function mockScheduleDocsByDate(docsByDate: Record<string, any[]>) {
  vi.mocked(where).mockImplementation(
    (field: any, _op: any, value: any) => ({ __field: field, __value: value }) as any
  );
  vi.mocked(query).mockImplementation((_coll: any, ...constraints: any[]) => ({ __constraints: constraints }) as any);
  vi.mocked(getDocs).mockImplementation(async (q: any) => {
    const dateConstraint = q.__constraints?.find((c: any) => c.__field === 'date');
    const d = dateConstraint?.__value;
    const docs = docsByDate[d] ?? [];
    return {
      docs: docs.map((data: any, i: number) => ({ data: () => data, id: `doc-${d}-${i}` })),
      empty: docs.length === 0,
      size: docs.length,
    } as any;
  });
  return collection; // keep referenced so the import isn't flagged unused
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkBookingConflicts — midnight-wrapping ranges checked against adjacent day docs', () => {
  it('detects a conflict in the NEXT day\'s schedule doc for a ride that wraps past midnight (regression: the wrapped [0,end] segment was compared against the pickup date\'s own doc instead of tomorrow\'s)', async () => {
    mockScheduleDocsByDate({
      '2026-08-01': [
        {
          driverName: 'Driver',
          // An unrelated early-morning booking on the pickup date itself — must NOT be reported
          // as the conflict (that would be the pre-fix bug: matching the wrong day).
          timeSlots: [
            { id: '01:00-02:00', startTime: '01:00', endTime: '02:00', status: 'booked', bookingId: 'booking-WRONG-DAY', customerName: 'Wrong Day' },
          ],
        },
      ],
      '2026-08-02': [
        {
          driverName: 'Driver',
          // The real conflict: 01:00-02:00 on the day AFTER pickup, inside the wrapped portion of
          // a 22:00 (Aug 1) -> 03:00 (Aug 2) ride.
          timeSlots: [
            { id: '01:00-02:00', startTime: '01:00', endTime: '02:00', status: 'booked', bookingId: 'booking-RIGHT-DAY', customerName: 'Right Day' },
          ],
        },
      ],
    });

    const result = await driverSchedulingService.checkBookingConflicts('2026-08-01', '22:00', '03:00');

    expect(result.hasConflict).toBe(true);
    expect(result.conflictingBookings.map((c) => c.bookingId)).toContain('booking-RIGHT-DAY');
    expect(result.conflictingBookings.map((c) => c.bookingId)).not.toContain('booking-WRONG-DAY');
  });

  it('does not flag a false conflict against the pickup date\'s own doc when the wrapped portion has no real overlap on the next day', async () => {
    mockScheduleDocsByDate({
      '2026-08-01': [
        {
          driverName: 'Driver',
          timeSlots: [
            { id: '01:00-02:00', startTime: '01:00', endTime: '02:00', status: 'booked', bookingId: 'booking-WRONG-DAY', customerName: 'Wrong Day' },
          ],
        },
      ],
      '2026-08-02': [],
    });

    const result = await driverSchedulingService.checkBookingConflicts('2026-08-01', '22:00', '03:00');

    expect(result.hasConflict).toBe(false);
  });

  it('detects a prep-time conflict in the PREVIOUS day\'s schedule doc for an early pickup (prep window spans back across midnight)', async () => {
    mockScheduleDocsByDate({
      '2026-08-01': [],
      '2026-07-31': [
        {
          driverName: 'Driver',
          // Late-night booking on the day before pickup that the prep window (23:30 -> 00:30) hits.
          timeSlots: [
            { id: '23:00-23:45', startTime: '23:00', endTime: '23:45', status: 'booked', bookingId: 'booking-PREV-DAY', customerName: 'Prev Day' },
          ],
        },
      ],
    });

    // Pickup at 00:30 on 2026-08-01 -> prep window is 23:30 (2026-07-31) to 00:30 (2026-08-01).
    const result = await driverSchedulingService.checkBookingConflicts('2026-08-01', '00:30', '01:00');

    expect(result.hasConflict).toBe(true);
    expect(result.conflictingBookings.map((c) => c.bookingId)).toContain('booking-PREV-DAY');
  });
});
