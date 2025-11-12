import { cmsFlattenedService } from '@/lib/services/cms-service';
import { Settings, DEFAULT_SETTINGS } from '@/types/settings';

export async function getSettings(): Promise<Settings> {
  try {
    const cmsConfig = await cmsFlattenedService.getAllCMSData();
    console.log('CMS config keys:', Object.keys(cmsConfig));
    console.log('Pricing data:', cmsConfig.pricing);
    if (!cmsConfig || !cmsConfig.pricing) {
      console.error('CMS config or pricing is null, falling back to defaults');
      return DEFAULT_SETTINGS;
    }
    const pricing = cmsConfig.pricing;

    const resolveNumber = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = key.includes('.')
          ? key.split('.').reduce<any>((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), pricing)
          : pricing?.[key];
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return value;
        }
        if (typeof value === 'string') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
      return undefined;
    };

    // Convert CMS pricing settings to the settings format with sensible defaults
    const settings: Settings = {
      baseFare: resolveNumber('baseFare', 'base-fare') ?? DEFAULT_SETTINGS.baseFare,
      perMile: resolveNumber('perMile', 'per-mile') ?? DEFAULT_SETTINGS.perMile,
      perMinute: resolveNumber('perMinute', 'per-minute') ?? DEFAULT_SETTINGS.perMinute,
      depositPercent: resolveNumber('depositPercent', 'deposit-percent') ?? DEFAULT_SETTINGS.depositPercent,
      bufferMinutes: resolveNumber('bufferMinutes', 'buffer-minutes') ?? DEFAULT_SETTINGS.bufferMinutes,
      airportReturnMultiplier: resolveNumber(
        'airportReturnMultiplier',
        'airport-return-multiplier'
      ) ?? DEFAULT_SETTINGS.airportReturnMultiplier,
      cancellation: {
        over24hRefundPercent: resolveNumber(
          'cancellation.over24hRefundPercent',
          'cancellation-over24h-refund-percent'
        ) ?? DEFAULT_SETTINGS.cancellation.over24hRefundPercent,
        between3And24hRefundPercent: resolveNumber(
          'cancellation.between3And24hRefundPercent',
          'cancellation-between3and24h-refund-percent'
        ) ?? DEFAULT_SETTINGS.cancellation.between3And24hRefundPercent,
        under3hRefundPercent: resolveNumber(
          'cancellation.under3hRefundPercent',
          'cancellation-under3h-refund-percent'
        ) ?? DEFAULT_SETTINGS.cancellation.under3hRefundPercent,
      },
    };
    return settings;
  } catch (err) {
    console.error('Failed to load settings from CMS, falling back to defaults', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
  try {
    const cmsConfig = await cmsFlattenedService.getAllCMSData();
    if (!cmsConfig || !cmsConfig.pricing) {
      throw new Error('CMS config or pricing is null, cannot update settings');
    }
    const currentPricing = cmsConfig.pricing;
    // Update the pricing section of the CMS config
    const updatedPricing = {
      ...currentPricing,
      baseFare: partial.baseFare ?? currentPricing.baseFare ?? currentPricing['base-fare'] ?? DEFAULT_SETTINGS.baseFare,
      perMile: partial.perMile ?? currentPricing.perMile ?? currentPricing['per-mile'] ?? DEFAULT_SETTINGS.perMile,
      perMinute: partial.perMinute ?? currentPricing.perMinute ?? currentPricing['per-minute'] ?? DEFAULT_SETTINGS.perMinute,
      depositPercent:
        partial.depositPercent ??
        currentPricing.depositPercent ??
        currentPricing['deposit-percent'] ??
        DEFAULT_SETTINGS.depositPercent,
      bufferMinutes:
        partial.bufferMinutes ??
        currentPricing.bufferMinutes ??
        currentPricing['buffer-minutes'] ??
        DEFAULT_SETTINGS.bufferMinutes,
      airportReturnMultiplier:
        partial.airportReturnMultiplier ??
        currentPricing.airportReturnMultiplier ??
        currentPricing['airport-return-multiplier'] ??
        DEFAULT_SETTINGS.airportReturnMultiplier,
      cancellation: partial.cancellation ?? currentPricing.cancellation ?? {
        over24hRefundPercent:
          currentPricing['cancellation-over24h-refund-percent'] ??
          DEFAULT_SETTINGS.cancellation.over24hRefundPercent,
        between3And24hRefundPercent:
          currentPricing['cancellation-between3and24h-refund-percent'] ??
          DEFAULT_SETTINGS.cancellation.between3And24hRefundPercent,
        under3hRefundPercent:
          currentPricing['cancellation-under3h-refund-percent'] ??
          DEFAULT_SETTINGS.cancellation.under3hRefundPercent,
      },
    };
    updatedPricing['airport-return-multiplier'] = updatedPricing.airportReturnMultiplier;
    
    await cmsFlattenedService.updatePageContent('pricing', updatedPricing);
  } catch (err) {
    console.error('Failed to update settings in CMS', err);
    throw err;
  }
} 