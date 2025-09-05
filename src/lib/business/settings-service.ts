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
    // Convert CMS pricing settings to the old settings format for backward compatibility
    const settings: Settings = {
      baseFare: cmsConfig.pricing['base-fare'],
      perMile: cmsConfig.pricing['per-mile'],
      perMinute: cmsConfig.pricing['per-minute'],
      depositPercent: cmsConfig.pricing['deposit-percent'],
      bufferMinutes: cmsConfig.pricing['buffer-minutes'],
      cancellation: {
        over24hRefundPercent: cmsConfig.pricing['cancellation-over24h-refund-percent'],
        between3And24hRefundPercent: cmsConfig.pricing['cancellation-between3and24h-refund-percent'],
        under3hRefundPercent: cmsConfig.pricing['cancellation-under3h-refund-percent'],
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
    // Update the pricing section of the CMS config
    const updatedPricing = {
      ...cmsConfig.pricing,
      baseFare: partial.baseFare ?? cmsConfig.pricing.baseFare,
      perMile: partial.perMile ?? cmsConfig.pricing.perMile,
      perMinute: partial.perMinute ?? cmsConfig.pricing.perMinute,
      depositPercent: partial.depositPercent ?? cmsConfig.pricing.depositPercent,
      bufferMinutes: partial.bufferMinutes ?? cmsConfig.pricing.bufferMinutes,
      cancellation: partial.cancellation ?? cmsConfig.pricing.cancellation,
    };
    
    await cmsFlattenedService.updatePageContent('pricing', updatedPricing);
  } catch (err) {
    console.error('Failed to update settings in CMS', err);
    throw err;
  }
} 