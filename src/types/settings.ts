export interface CancellationRules {
  over24hRefundPercent: number; // percent of deposit refunded if >24h before pickup
  between3And24hRefundPercent: number; // percent deposit refunded 3–24h
  under3hRefundPercent: number; // percent deposit refunded <3h
}

export interface Settings {
  baseFare: number;          // dollars
  perMile: number;          // dollars per mile
  perMinute: number;        // dollars per minute
  personalDiscountPercent: number; // % discount for personal rides
  depositPercent: number;   // % of fare charged upfront
  bufferMinutes: number;    // gap required between rides
  airportReturnMultiplier: number; // multiplier for airport-to-home rides
  cancellation: CancellationRules;
}

export const DEFAULT_SETTINGS: Settings = {
  baseFare: 15,
  perMile: 1.80,
  perMinute: 0.20,
  personalDiscountPercent: 10,
  depositPercent: 50,
  bufferMinutes: 60,
  airportReturnMultiplier: 1.15,
  cancellation: {
    over24hRefundPercent: 100,
    between3And24hRefundPercent: 50,
    under3hRefundPercent: 0,
  },
}; 