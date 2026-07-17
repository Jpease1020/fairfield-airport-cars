import { Settings } from '@/types/settings';
import { getPricingConfig } from '@/lib/business/pricing-config';

export async function getSettings(): Promise<Settings> {
  // Read pricing from Firestore (with env var fallback built into getPricingConfig defaults)
  const pricing = await getPricingConfig();

  return {
    baseFare: pricing.baseFare,
    perMile: pricing.perMile,
    perMinute: pricing.perMinute,
    personalDiscountPercent: pricing.personalDiscountPercent,
    airportReturnMultiplier: pricing.airportReturnMultiplier,
    minimumFare: pricing.minimumFare,
  };
}
