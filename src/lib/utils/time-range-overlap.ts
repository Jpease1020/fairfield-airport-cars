// Whether two time-of-day intervals overlap, in minutes since midnight, where either interval
// may itself "wrap" past midnight (start > end, e.g. 23:00-01:00). Each wrapping interval is
// split into its two non-wrapping segments before comparing, so overlap is detected correctly
// regardless of which side — or both — crosses the day boundary.
//
// This replaces three independent, near-identical overlap checks (driver-scheduling-service.ts's
// slotOverlapsRange + its inline prep-overlap checks, and booking-service.ts's own copy of both)
// that only handled a wrapping SLOT, never a wrapping REQUESTED RANGE. That was already a latent
// gap with the old flat 2-hour ride duration (only reachable for a pickup in the last ~2 hours of
// the day), but making ride duration real and up to 6 hours (see resolveRideDurationMinutes) makes
// it reachable for any evening pickup — an unnoticed double-booking risk, not just a rounding nit.
export function timeRangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
  minutesPerDay: number = 24 * 60
): boolean {
  const segments = (start: number, end: number): Array<[number, number]> =>
    start <= end ? [[start, end]] : [[0, end], [start, minutesPerDay]];

  const aSegments = segments(aStart, aEnd);
  const bSegments = segments(bStart, bEnd);

  return aSegments.some(([aSegStart, aSegEnd]) =>
    bSegments.some(([bSegStart, bSegEnd]) => aSegStart < bSegEnd && bSegStart < aSegEnd)
  );
}
