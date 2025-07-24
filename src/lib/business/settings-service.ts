import { cmsService } from '@/lib/services/cms-service';
import { Settings, DEFAULT_SETTINGS } from '@/types/settings';

export async function getSettings(): Promise<Settings> {
  try {
    const cmsConfig = await cmsService.getCMSConfiguration();
    if (!cmsConfig || !cmsConfig.pricing) {
      console.error('CMS config or pricing is null, falling back to defaults');
      return DEFAULT_SETTINGS;
    }
    // Convert CMS pricing settings to the old settings format for backward compatibility
    const settings: Settings = {
      baseFare: cmsConfig.pricing.baseFare,
      perMile: cmsConfig.pricing.perMile,
      perMinute: cmsConfig.pricing.perMinute,
      depositPercent: cmsConfig.pricing.depositPercent,
      bufferMinutes: cmsConfig.pricing.bufferMinutes,
      cancellation: cmsConfig.pricing.cancellation,
    };
    return settings;
  } catch (err) {
    console.error('Failed to load settings from CMS, falling back to defaults', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
  try {
    const cmsConfig = await cmsService.getCMSConfiguration();
    if (!cmsConfig || !cmsConfig.pricing) {
      throw new Error('CMS config or pricing is null, cannot update settings');
    }
    // Update the pricing section of the CMS config
    await cmsService.updatePricingSettings({
      baseFare: partial.baseFare ?? cmsConfig.pricing.baseFare,
      perMile: partial.perMile ?? cmsConfig.pricing.perMile,
      perMinute: partial.perMinute ?? cmsConfig.pricing.perMinute,
      depositPercent: partial.depositPercent ?? cmsConfig.pricing.depositPercent,
      bufferMinutes: partial.bufferMinutes ?? cmsConfig.pricing.bufferMinutes,
      cancellation: partial.cancellation ?? cmsConfig.pricing.cancellation,
    });
  } catch (err) {
    console.error('Failed to update settings in CMS', err);
    throw err;
  }
} 