/**
 * DateTimePicker Timezone Regression Tests
 *
 * Pins the runtime to a negative-offset timezone (US Eastern) during evening
 * hours, when the LOCAL date and the UTC date disagree.
 *
 * Regression guarded: the time field's "is this the earliest allowed date?"
 * check used to derive its date-only string via `toISOString()` (UTC), while
 * the date input's `min` used LOCAL components. In the evening Eastern, those
 * disagreed by a day, so picking a date one day *past* the minimum was misread
 * as the minimum date — which clamped the time to "now + 24h" and snapped every
 * earlier time back. Symptom: "I can change the date but not the time."
 *
 * IMPORTANT: the timezone is pinned by the test runner, NOT in this file.
 * Setting `process.env.TZ` here at runtime is a no-op — V8 locks the zone at
 * worker startup. The `test:unit` / `test:integration` npm scripts run vitest
 * under `TZ=America/New_York`. The guard below fails loudly (instead of
 * silently passing for the wrong reason) if that pin is ever lost — e.g. if
 * someone runs `vitest` directly, or the script prefix is removed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DateTimePicker } from '@/design/components/base-components/forms/DateTimePicker';

// June is EDT (UTC-4); getTimezoneOffset() returns minutes BEHIND UTC, so 240.
// If this fails, the runner is not in America/New_York — run via `npm run
// test:unit` (which pins TZ) rather than invoking vitest directly.
const JUNE_2026 = new Date('2026-06-11T12:00:00.000Z');
if (JUNE_2026.getTimezoneOffset() !== 240) {
  throw new Error(
    `datetime-picker-timezone.test.tsx requires TZ=America/New_York (EDT, offset 240); ` +
    `got offset ${JUNE_2026.getTimezoneOffset()}. Run via "npm run test:unit".`
  );
}

// 9:42 PM EDT on June 10, 2026. In UTC this is already 01:42 on June 11 — and
// "now + 24h" (the minimum pickup) is June 11 9:42 PM EDT == June 12 01:42 UTC.
// That UTC rollover is exactly what used to corrupt the date-only comparison.
const NOW = new Date('2026-06-11T01:42:00.000Z'); // === 2026-06-10 21:42 EDT

describe('DateTimePicker - timezone-safe minimum-date handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('does NOT snap the time when a date later than the minimum is selected (evening Eastern)', () => {
    const onChange = vi.fn();

    // Selected date is June 12 — a full day AFTER the minimum date (June 11).
    // The user should be able to pick any time freely.
    render(
      <DateTimePicker
        id="tz-test"
        label="When"
        value="2026-06-12T09:00"
        onChange={onChange}
        required
      />
    );

    const timeInput = screen.getByTestId('tz-test-time') as HTMLInputElement;

    // A later date must not carry a restrictive `min` time.
    expect(timeInput.getAttribute('min')).toBeFalsy();

    // Pick an early-morning time well before "now + 24h" (9:42 PM).
    fireEvent.change(timeInput, { target: { value: '08:00' } });

    // The chosen time must survive unchanged — NOT be snapped to 21:42.
    expect(onChange).toHaveBeenCalledWith('2026-06-12T08:00');
  });

  it('still enforces the 24-hour minimum time on the earliest allowed date', () => {
    const onChange = vi.fn();

    // Selected date IS the minimum date (tomorrow, June 11). The 24h rule applies.
    render(
      <DateTimePicker
        id="tz-min-test"
        label="When"
        value="2026-06-11T09:00"
        onChange={onChange}
        required
      />
    );

    const timeInput = screen.getByTestId('tz-min-test-time') as HTMLInputElement;

    // On the minimum date, the time field must restrict to now+24h (21:42 local).
    expect(timeInput.getAttribute('min')).toBe('21:42');

    // Attempting an earlier time snaps forward to the earliest valid time.
    fireEvent.change(timeInput, { target: { value: '08:00' } });
    expect(onChange).toHaveBeenCalledWith('2026-06-11T21:42');
  });

  it('keeps the date input minimum on the LOCAL day (not the UTC day)', () => {
    render(
      <DateTimePicker
        id="tz-date-min"
        label="When"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    const dateInput = screen.getByTestId('tz-date-min-date') as HTMLInputElement;

    // now + 24h is June 11 *local*. The UTC date would wrongly be June 12.
    expect(dateInput.getAttribute('min')).toBe('2026-06-11');
  });
});
