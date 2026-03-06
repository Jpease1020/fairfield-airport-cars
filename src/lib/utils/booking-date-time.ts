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
