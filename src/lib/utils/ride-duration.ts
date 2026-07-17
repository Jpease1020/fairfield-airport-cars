// Fallback used when no real trip duration is available (e.g. exception bookings that skip the
// quote step, or bookings created before estimatedMinutes existed on the trip record) — matches
// the flat assumption every call site used before this was made duration-aware.
export const DEFAULT_RIDE_DURATION_MINUTES = 120;

// Sanity clamps around a real quoted duration before it's used to size a driver-schedule slot:
// a floor so a very short local hop doesn't block too little prep/turnaround time, and a ceiling
// so a corrupted or implausible value can't block out the driver's entire day.
export const MIN_RIDE_DURATION_MINUTES = 30;
export const MAX_RIDE_DURATION_MINUTES = 360;

export function resolveRideDurationMinutes(estimatedMinutes: number | null | undefined): number {
  if (!Number.isFinite(estimatedMinutes) || (estimatedMinutes as number) <= 0) {
    return DEFAULT_RIDE_DURATION_MINUTES;
  }
  return Math.min(MAX_RIDE_DURATION_MINUTES, Math.max(MIN_RIDE_DURATION_MINUTES, estimatedMinutes as number));
}
