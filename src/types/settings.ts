export interface CancellationRules {
  over24hRefundPercent: number; // percent of deposit refunded if >24h before pickup
  between3And24hRefundPercent: number; // percent deposit refunded 3–24h
  under3hRefundPercent: number; // percent deposit refunded <3h
}

export interface Settings {
  baseFare: number;          // dollars
  perMile: number;          // dollars per mile
  perMinute: number;        // dollars per minute
  depositPercent: number;   // % of fare charged upfront
  bufferMinutes: number;    // gap required between rides
  cancellation: CancellationRules;
}

export const DEFAULT_SETTINGS: Settings = {
  baseFare: 10,
  perMile: 3.5,
  perMinute: 0.5,
  depositPercent: 50,
  bufferMinutes: 60,
  cancellation: {
    over24hRefundPercent: 100,
    between3And24hRefundPercent: 50,
    under3hRefundPercent: 0,
  },
}; 