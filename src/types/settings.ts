// depositPercent, bufferMinutes, and a CancellationRules field used to live here, each reading
// from its own env var (FARE_DEPOSIT_PERCENT, BOOKING_BUFFER_MINUTES, CANCEL_REFUND_*). None of
// them had a single real consumer anywhere in the app — the actual, admin-editable, live
// equivalents are business-rules.ts's `deposit`/`bookingBufferMinutes`/`cancellationFeeTiers`
// (stored in Firestore config/businessRules). This parallel, env-var-driven copy was confirmed
// dead and removed rather than fixed: it read as configuration that did something, when setting
// those env vars silently had zero effect on any real booking, buffer, or cancellation.
export interface Settings {
  baseFare: number;          // dollars
  perMile: number;          // dollars per mile
  perMinute: number;        // dollars per minute
  personalDiscountPercent: number; // % discount for personal rides
  airportReturnMultiplier: number; // multiplier for airport-to-home rides
}

export const DEFAULT_SETTINGS: Settings = {
  baseFare: 15,
  perMile: 1.80,
  perMinute: 0.20,
  personalDiscountPercent: 10,
  airportReturnMultiplier: 1.15,
};