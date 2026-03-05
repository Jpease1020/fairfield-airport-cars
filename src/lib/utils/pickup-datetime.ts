const ISO_WITH_OFFSET_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const ISO_WITHOUT_OFFSET_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;

export function isIsoDateTimeWithOffset(value: string): boolean {
  return ISO_WITH_OFFSET_REGEX.test(value);
}

export function normalizePickupDateTimeForApi(value: string): string {
  const raw = value.trim();
  if (!raw) {
    throw new Error('Pickup date/time is required.');
  }

  if (!isIsoDateTimeWithOffset(raw) && !ISO_WITHOUT_OFFSET_REGEX.test(raw)) {
    throw new Error('Pickup date/time must be a valid ISO datetime string.');
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Pickup date/time must be a valid ISO datetime string.');
  }

  return parsed.toISOString();
}
