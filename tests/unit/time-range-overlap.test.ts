import { describe, expect, it } from 'vitest';
import { timeRangesOverlap } from '@/lib/utils/time-range-overlap';

describe('timeRangesOverlap', () => {
  it('detects a normal (non-wrapping) overlap', () => {
    expect(timeRangesOverlap(600, 660, 630, 690)).toBe(true); // 10:00-11:00 vs 10:30-11:30
  });

  it('returns false for two non-wrapping ranges that do not overlap', () => {
    expect(timeRangesOverlap(600, 660, 700, 760)).toBe(false); // 10:00-11:00 vs 11:40-12:40
  });

  it('detects overlap when only the SLOT spans midnight (regression: this case was already handled before this fix)', () => {
    // Slot 23:00-01:00 (1380-60), requested range 00:30-01:30 (30-90).
    expect(timeRangesOverlap(30, 90, 1380, 60)).toBe(true);
  });

  it('detects overlap when only the REQUESTED RANGE spans midnight (regression: a real bug — the range-side of this check never handled wrapping before this fix, only the slot-side did; a late-evening pickup with a real quoted duration long enough to cross midnight would silently fail to conflict-check against early-morning bookings)', () => {
    // Requested range 22:00-03:00 (1320-180, e.g. a 5-hour ride from a 10pm pickup), existing
    // slot 01:00-02:00 (60-120) the next calendar day.
    expect(timeRangesOverlap(1320, 180, 60, 120)).toBe(true);
    // Symmetric: swapping which argument is "a" vs "b" must give the same answer.
    expect(timeRangesOverlap(60, 120, 1320, 180)).toBe(true);
  });

  it('detects overlap when BOTH sides span midnight', () => {
    // Requested 23:30-00:30 (1410-30), slot 23:45-00:15 (1425-15).
    expect(timeRangesOverlap(1410, 30, 1425, 15)).toBe(true);
  });

  it('returns false when a wrapping range does not actually overlap a normal slot', () => {
    // Requested range 22:00-01:00 (1320-60) — occupies late night through 1am.
    // Slot 10:00-11:00 (600-660) is safely in the middle of the day.
    expect(timeRangesOverlap(1320, 60, 600, 660)).toBe(false);
  });
});
