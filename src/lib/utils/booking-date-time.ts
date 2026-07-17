import { parseBookingDate } from '@/utils/booking-helpers';

const DEFAULT_BUSINESS_TIMEZONE = 'America/New_York';

type DateInput = Date | string | number;

function toDate(value: DateInput): Date | null {
  const parsed = parseBookingDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getBusinessTimeZone(): string {
  return process.env.BUSINESS_TIMEZONE || DEFAULT_BUSINESS_TIMEZONE;
}

export function formatBusinessDateTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return 'Date not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatBusinessDateTimeWithZone(value: DateInput): string {
  const date = toDate(value);
  if (!date) return 'Date not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}

export function formatBusinessDate(value: DateInput): string {
  const date = toDate(value);
  if (!date) return 'Date not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatBusinessTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return 'Time not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatBusinessTimeWithZone(value: DateInput): string {
  const date = toDate(value);
  if (!date) return 'Time not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}

export function getBusinessDateTimeParts(value: DateInput): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  const date = toDate(value);
  if (!date) return null;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: getBusinessTimeZone(),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number | null => {
    const part = parts.find((item) => item.type === type)?.value;
    if (!part) return null;
    const parsed = Number.parseInt(part, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const year = read('year');
  const month = read('month');
  const day = read('day');
  const hour = read('hour');
  const minute = read('minute');

  if (
    year === null ||
    month === null ||
    day === null ||
    hour === null ||
    minute === null
  ) {
    return null;
  }

  return { year, month, day, hour, minute };
}

// YYYY-MM-DD in business local time — for bucketing a booking into a driver-schedule day.
// `date.toISOString().split('T')[0]` (the pattern this replaces) buckets by UTC calendar day
// instead: on a server running in UTC (the Vercel default), a pickup at 8pm Eastern is already
// past midnight UTC, so it silently lands in the NEXT day's schedule document and is checked
// for conflicts against the wrong day's bookings entirely.
//
// Throws on an invalid date rather than returning a placeholder: this feeds directly into
// driver-schedule document IDs and conflict checks, where a swallowed-null value (or a
// placeholder string) would silently create/read a garbage schedule bucket instead of failing
// loudly — the same way `date.toISOString()` on an Invalid Date already throws today.
export function getBusinessDateString(value: DateInput): string {
  const date = toDate(value);
  if (!date) {
    throw new Error(`getBusinessDateString: invalid date input: ${String(value)}`);
  }
  const parts = getBusinessDateTimeParts(date)!;
  const { year, month, day } = parts;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// HH:MM in business local time — for computing the time-of-day slot within that day's schedule.
// `date.toTimeString().slice(0, 5)` (the pattern this replaces) uses the server process's local
// timezone, which is UTC on Vercel — same underlying bug as getBusinessDateString, just for the
// time-of-day component instead of the calendar day. Throws on an invalid date for the same
// reason getBusinessDateString does.
export function getBusinessTimeString(value: DateInput): string {
  const date = toDate(value);
  if (!date) {
    throw new Error(`getBusinessTimeString: invalid date input: ${String(value)}`);
  }
  const parts = getBusinessDateTimeParts(date)!;
  const { hour, minute } = parts;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function getUtcDateTimeParts(value: DateInput): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  const date = toDate(value);
  if (!date) return null;

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}
