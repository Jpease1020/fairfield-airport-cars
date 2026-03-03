import { Settings, DEFAULT_SETTINGS } from '@/types/settings';

const readNumberEnv = (key: string): number | undefined => {
  const raw = process.env[key];
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function getSettings(): Promise<Settings> {
  return {
    baseFare: readNumberEnv('FARE_BASE') ?? DEFAULT_SETTINGS.baseFare,
    perMile: readNumberEnv('FARE_PER_MILE') ?? DEFAULT_SETTINGS.perMile,
    perMinute: readNumberEnv('FARE_PER_MINUTE') ?? DEFAULT_SETTINGS.perMinute,
    depositPercent: readNumberEnv('FARE_DEPOSIT_PERCENT') ?? DEFAULT_SETTINGS.depositPercent,
    bufferMinutes: readNumberEnv('BOOKING_BUFFER_MINUTES') ?? DEFAULT_SETTINGS.bufferMinutes,
    airportReturnMultiplier:
      readNumberEnv('FARE_AIRPORT_RETURN_MULTIPLIER') ?? DEFAULT_SETTINGS.airportReturnMultiplier,
    cancellation: {
      over24hRefundPercent:
        readNumberEnv('CANCEL_REFUND_OVER_24H_PERCENT') ??
        DEFAULT_SETTINGS.cancellation.over24hRefundPercent,
      between3And24hRefundPercent:
        readNumberEnv('CANCEL_REFUND_3_TO_24H_PERCENT') ??
        DEFAULT_SETTINGS.cancellation.between3And24hRefundPercent,
      under3hRefundPercent:
        readNumberEnv('CANCEL_REFUND_UNDER_3H_PERCENT') ??
        DEFAULT_SETTINGS.cancellation.under3hRefundPercent,
    },
  };
}

export async function updateSettings(_partial: Partial<Settings>): Promise<void> {
  throw new Error('Runtime settings updates are disabled. Configure pricing via environment variables.');
}
