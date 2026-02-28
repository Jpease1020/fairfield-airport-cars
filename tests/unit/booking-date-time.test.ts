import { describe, expect, it } from 'vitest';
import {
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
  getBusinessDateTimeParts,
} from '@/lib/utils/booking-date-time';

describe('booking-date-time formatting', () => {
  it('formats UTC input as America/New_York business time', () => {
    const pickupUtc = '2026-03-02T13:00:00.000Z';

    expect(formatBusinessDateTime(pickupUtc)).toBe('3/2/2026, 8:00 AM');
    expect(formatBusinessDate(pickupUtc)).toBe('Monday, March 2, 2026');
    expect(formatBusinessTime(pickupUtc)).toBe('8:00 AM');
    expect(getBusinessDateTimeParts(pickupUtc)).toEqual({
      year: 2026,
      month: 3,
      day: 2,
      hour: 8,
      minute: 0,
    });
  });

  it('handles spring DST jump without drifting displayed local time', () => {
    expect(formatBusinessDateTime('2026-03-08T06:59:00.000Z')).toBe('3/8/2026, 1:59 AM');
    expect(formatBusinessDateTime('2026-03-08T07:00:00.000Z')).toBe('3/8/2026, 3:00 AM');
    expect(formatBusinessTime('2026-03-08T07:00:00.000Z')).toBe('3:00 AM');
    expect(getBusinessDateTimeParts('2026-03-08T07:00:00.000Z')).toEqual({
      year: 2026,
      month: 3,
      day: 8,
      hour: 3,
      minute: 0,
    });
  });

  it('handles fall DST repeated hour deterministically', () => {
    expect(formatBusinessDateTime('2026-11-01T05:30:00.000Z')).toBe('11/1/2026, 1:30 AM');
    expect(formatBusinessDateTime('2026-11-01T06:30:00.000Z')).toBe('11/1/2026, 1:30 AM');
    expect(getBusinessDateTimeParts('2026-11-01T05:30:00.000Z')).toEqual({
      year: 2026,
      month: 11,
      day: 1,
      hour: 1,
      minute: 30,
    });
    expect(getBusinessDateTimeParts('2026-11-01T06:30:00.000Z')).toEqual({
      year: 2026,
      month: 11,
      day: 1,
      hour: 1,
      minute: 30,
    });
  });
});
