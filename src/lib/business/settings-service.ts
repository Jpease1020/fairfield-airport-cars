import { Settings, DEFAULT_SETTINGS } from '@/types/settings';
import { getPricingConfig } from '@/lib/business/pricing-config';

const readNumberEnv = (key: string): number | undefined => {
  const raw = process.env[key];
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function getSettings(): Promise<Settings> {
  // Read pricing from Firestore (with env var fallback built into getPricingConfig defaults)
  const pricing = await getPricingConfig();

  return {
    baseFare: pricing.baseFare,
    perMile: pricing.perMile,
    perMinute: pricing.perMinute,
    personalDiscountPercent: pricing.personalDiscountPercent,
    airportReturnMultiplier: pricing.airportReturnMultiplier,
    depositPercent: readNumberEnv('FARE_DEPOSIT_PERCENT') ?? DEFAULT_SETTINGS.depositPercent,
    bufferMinutes: readNumberEnv('BOOKING_BUFFER_MINUTES') ?? DEFAULT_SETTINGS.bufferMinutes,
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
