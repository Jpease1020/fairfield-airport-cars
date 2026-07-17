import { describe, expect, it } from 'vitest';
import {
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
  getBusinessDateTimeParts,
  getBusinessDateString,
  getBusinessTimeString,
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

describe('getBusinessDateString / getBusinessTimeString', () => {
  it('buckets an evening Eastern pickup into the correct business day, not the UTC calendar day (regression: driver-schedule bucketing used to derive the date via toISOString(), which is always UTC — an 8:30pm EDT pickup is already past midnight UTC, so it silently landed in the next day\'s schedule document)', () => {
    // 8:30 PM EDT on July 16 == 00:30 UTC on July 17 (EDT is UTC-4).
    const lateEveningPickup = '2026-07-17T00:30:00.000Z';

    expect(getBusinessDateString(lateEveningPickup)).toBe('2026-07-16');
    expect(getBusinessTimeString(lateEveningPickup)).toBe('20:30');

    // The naive UTC-based approach this replaces would have produced the wrong day and time.
    const naiveDate = new Date(lateEveningPickup);
    expect(naiveDate.toISOString().split('T')[0]).toBe('2026-07-17');
  });

  it('buckets a winter (EST) evening pickup correctly across the UTC-5 offset', () => {
    // 9:00 PM EST on January 15 == 02:00 UTC on January 16 (EST is UTC-5).
    const winterEveningPickup = '2026-01-16T02:00:00.000Z';

    expect(getBusinessDateString(winterEveningPickup)).toBe('2026-01-15');
    expect(getBusinessTimeString(winterEveningPickup)).toBe('21:00');
  });

  it('agrees with the UTC calendar day for a pickup safely in the middle of the business day', () => {
    const middayPickup = '2026-07-16T18:00:00.000Z'; // 2:00 PM EDT
    expect(getBusinessDateString(middayPickup)).toBe('2026-07-16');
    expect(getBusinessTimeString(middayPickup)).toBe('14:00');
  });

  it('throws on an invalid date input instead of silently returning a placeholder (this feeds directly into driver-schedule document IDs and conflict checks, where a swallowed value would silently create/read a garbage schedule bucket)', () => {
    expect(() => getBusinessDateString('not-a-date')).toThrow();
    expect(() => getBusinessTimeString('not-a-date')).toThrow();
  });
});
