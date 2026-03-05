import { describe, expect, it } from 'vitest';
import {
  isIsoDateTimeWithOffset,
  normalizePickupDateTimeForApi,
} from '@/lib/utils/pickup-datetime';

describe('pickup datetime normalization', () => {
  it('accepts ISO with UTC offset', () => {
    expect(isIsoDateTimeWithOffset('2026-03-02T13:00:00.000Z')).toBe(true);
    expect(isIsoDateTimeWithOffset('2026-03-02T08:00:00-05:00')).toBe(true);
  });

  it('normalizes datetime-local input to ISO UTC', () => {
    const normalized = normalizePickupDateTimeForApi('2026-03-02T08:00');
    expect(normalized).toContain('2026-03-02T');
    expect(normalized.endsWith('Z')).toBe(true);
  });

  it('rejects non-ISO input', () => {
    expect(() => normalizePickupDateTimeForApi('next Tuesday at 8')).toThrow(
      'Pickup date/time must be a valid ISO datetime string.'
    );
  });
});
