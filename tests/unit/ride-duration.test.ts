import { describe, expect, it } from 'vitest';
import {
  resolveRideDurationMinutes,
  DEFAULT_RIDE_DURATION_MINUTES,
  MIN_RIDE_DURATION_MINUTES,
  MAX_RIDE_DURATION_MINUTES,
} from '@/lib/utils/ride-duration';

describe('resolveRideDurationMinutes', () => {
  it('falls back to the default when no estimate is available (regression: every driver-schedule conflict check used to hardcode a flat 2-hour slot regardless of the actual trip length)', () => {
    expect(resolveRideDurationMinutes(undefined)).toBe(DEFAULT_RIDE_DURATION_MINUTES);
    expect(resolveRideDurationMinutes(null)).toBe(DEFAULT_RIDE_DURATION_MINUTES);
    expect(resolveRideDurationMinutes(NaN)).toBe(DEFAULT_RIDE_DURATION_MINUTES);
    expect(resolveRideDurationMinutes(0)).toBe(DEFAULT_RIDE_DURATION_MINUTES);
    expect(resolveRideDurationMinutes(-15)).toBe(DEFAULT_RIDE_DURATION_MINUTES);
  });

  it('uses the real estimate when it falls within the sane range', () => {
    expect(resolveRideDurationMinutes(45)).toBe(45);
    expect(resolveRideDurationMinutes(180)).toBe(180);
  });

  it('floors an implausibly short estimate so conflict checks always reserve a minimum turnaround', () => {
    expect(resolveRideDurationMinutes(5)).toBe(MIN_RIDE_DURATION_MINUTES);
  });

  it('caps an implausibly long estimate so a corrupted or extreme value cannot block out the whole day', () => {
    expect(resolveRideDurationMinutes(1000)).toBe(MAX_RIDE_DURATION_MINUTES);
  });
});
