'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { cmsFlattenedService } from '@/lib/services/cms-service';
import { PricingSettings } from '@/types/cms';
import { 
  GridSection,
  Box,
  ActionButtonGroup,
  ToastProvider,
  useToast, 
  Container,
  Text,
  Input,
  Label,
  Stack,
  Span
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

function PricingSettingsContent() {
  const { cmsData } = useCMSData();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadPricingSettings = useCallback(async () => {
    try {
      setLoading(true);
      const pricingSettings = await cmsFlattenedService.getPricingSettings();
      setSettings(pricingSettings);
      addToast('success', 'Pricing settings loaded successfully');
    } catch (error) {
      console.error('Error loading pricing settings:', error);
      addToast('error', 'Failed to load pricing settings');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPricingSettings();
  }, [loadPricingSettings]);



  const handleBasePricingChange = (field: keyof Omit<PricingSettings, 'cancellation' | 'zones'>, value: number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleCancellationChange = (field: keyof PricingSettings['cancellation'], value: number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      cancellation: {
        ...settings.cancellation,
        [field]: value
      }
    });
  };

  const addZone = () => {
    if (!settings) return;
    
    const newZone = {
      name: `Zone ${settings.zones.length + 1}`,
      baseFare: settings.baseFare,
      perMile: settings.perMile,
      perMinute: settings.perMinute
    };
    
    setSettings({
      ...settings,
      zones: [...settings.zones, newZone]
    });
  };

  const updateZone = (index: number, field: string, value: number | string) => {
    if (!settings) return;
    
    const updatedZones = [...settings.zones];
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value
    };
    
    setSettings({
      ...settings,
      zones: updatedZones
    });
  };

  const removeZone = (index: number) => {
    if (!settings) return;
    
    const updatedZones = settings.zones.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      zones: updatedZones
    });
  };

  if (loading) {
    return (
      <>
        <Container>
          {getCMSField(cmsData, 'loading', 'Loading pricing settings...')}
        </Container>
      </>
    );
  }

  if (!settings) {
    return (
      <>
        <Container>
          {getCMSField(cmsData, 'error', 'Failed to load pricing settings. Please try refreshing the page.')}
        </Container>
      </>
    );
  }

  return (
    <>
      <Container>
        {saved && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text variant="lead" size="md" weight="semibold">
                ✅ Settings Saved
              </Text>
              <Text variant="muted" size="sm">
                Pricing settings saved successfully
              </Text>
              <Span>Pricing settings saved successfully</Span>
            </Stack>
          </Box>
        )}

        <Stack spacing="lg">
          {/* Base Pricing */}
          <GridSection>
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Text variant="lead" size="md" weight="semibold">
                    {getCMSField(cmsData, 'basePricingTitle', '💰 Base Pricing')}
                  </Text>
                  <Text variant="muted" size="sm">
                    {getCMSField(cmsData, 'basePricingDesc', 'Configure your base fare structure and rates')}
                  </Text>
                </Stack>
                <div data-cms-id="baseFare-container">
                  <Label htmlFor="baseFare" data-cms-id="baseFareLabel">{getCMSField(cmsData, 'baseFareLabel', 'Base Fare ($)')}</Label>
                  <Input
                    id="baseFare"
                    type="number"
                    value={settings.baseFare.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasePricingChange('baseFare', parseFloat(e.target.value) || 0)}
                    placeholder="10"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div data-cms-id="perMile-container">
                  <Label htmlFor="perMile" data-cms-id="perMileLabel">{getCMSField(cmsData, 'perMileLabel', 'Per Mile Rate ($)')}</Label>
                  <Input
                    id="perMile"
                    type="number"
                    value={settings.perMile.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasePricingChange('perMile', parseFloat(e.target.value) || 0)}
                    placeholder="3.50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div data-cms-id="perMinute-container">
                  <Label htmlFor="perMinute" data-cms-id="perMinuteLabel">{getCMSField(cmsData, 'perMinuteLabel', 'Per Minute Rate ($)')}</Label>
                  <Input
                    id="perMinute"
                    type="number"
                    value={settings.perMinute.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasePricingChange('perMinute', parseFloat(e.target.value) || 0)}
                    placeholder="0.50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div data-cms-id="depositPercent-container">
                  <Label htmlFor="depositPercent" data-cms-id="depositPercentLabel">{getCMSField(cmsData, 'depositPercentLabel', 'Deposit Percentage (%)')}</Label>
                  <Input
                    id="depositPercent"
                    type="number"
                    value={settings.depositPercent.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasePricingChange('depositPercent', parseInt(e.target.value) || 0)}
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                </div>

                <div data-cms-id="bufferMinutes-container">
                  <Label htmlFor="bufferMinutes" data-cms-id="bufferMinutesLabel">{getCMSField(cmsData, 'bufferMinutesLabel', 'Buffer Minutes')}</Label>
                  <Input
                    id="bufferMinutes"
                    type="number"
                    value={settings.bufferMinutes.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasePricingChange('bufferMinutes', parseInt(e.target.value) || 0)}
                    placeholder="60"
                    min="0"
                  />
                </div>
              </Stack>
            </Box>
          </GridSection>

          {/* Competitor Pricing Reference */}
          <GridSection>
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Text variant="lead" size="md" weight="semibold">
                    🏢 Competitor Pricing Reference
                  </Text>
                  <Text variant="muted" size="sm">
                    Reference pricing for common routes (for comparison only - not scraped data)
                  </Text>
                </Stack>
                <div>
                  <strong>Local → Airport:</strong>
                  <ul>
                    <li>Competitor: ~$120-180 (estimated)</li>
                    <li>Your Current Rate: ${settings.baseFare + (65 * settings.perMile) + (65 * settings.perMinute)}</li>
                  </ul>
                </div>
                <div>
                  <strong>Local → LaGuardia Airport:</strong>
                  <ul>
                    <li>Competitor: ~$100-150 (estimated)</li>
                    <li>Your Current Rate: ${settings.baseFare + (55 * settings.perMile) + (55 * settings.perMinute)}</li>
                  </ul>
                </div>
                <div data-cms-id="cancellationDesc">
                  <strong>Note:</strong> These are rough estimates for planning purposes. Actual competitor prices vary by time, demand, and other factors.
                </div>
              </Stack>
            </Box>
          </GridSection>

          {/* Cancellation Policy */}
          <GridSection>
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Text variant="lead" size="md" weight="semibold">
                    {getCMSField(cmsData, 'cancellationTitle', '⏰ Cancellation Policy')}
                  </Text>
                  <Text variant="muted" size="sm">
                    {getCMSField(cmsData, 'cancellationDesc', 'Set refund percentages for different cancellation timeframes')}
                  </Text>
                </Stack>
                <div data-cms-id="over24hRefund-container">
                  <Label htmlFor="over24hRefund" data-cms-id="over24hRefundLabel">{getCMSField(cmsData, 'over24hRefundLabel', 'Over 24h Refund (%)')}</Label>
                  <Input
                    id="over24hRefund"
                    type="number"
                    value={settings.cancellation.over24hRefundPercent.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCancellationChange('over24hRefundPercent', parseInt(e.target.value) || 0)}
                    placeholder="100"
                    min="0"
                    max="100"
                  />
                </div>

                <div data-cms-id="between3And24hRefund-container">
                  <Label htmlFor="between3And24hRefund" data-cms-id="between3And24hRefundLabel">{getCMSField(cmsData, 'between3And24hRefundLabel', '3-24h Refund (%)')}</Label>
                  <Input
                    id="between3And24hRefund"
                    type="number"
                    value={settings.cancellation.between3And24hRefundPercent.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCancellationChange('between3And24hRefundPercent', parseInt(e.target.value) || 0)}
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                </div>

                <div data-cms-id="noZones-message">
                  <Label htmlFor="under3hRefund" data-cms-id="under3hRefundLabel">{getCMSField(cmsData, 'under3hRefundLabel', 'Under 3h Refund (%)')}</Label>
                  <Input
                    id="under3hRefund"
                    type="number"
                    value={settings.cancellation.under3hRefundPercent.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCancellationChange('under3hRefundPercent', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </Stack>
            </Box>
          </GridSection>

          {/* Pricing Zones */}
          <GridSection>
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Text variant="lead" size="md" weight="semibold">
                    {getCMSField(cmsData, 'zonesTitle', '📍 Pricing Zones')}
                  </Text>
                  <Text variant="muted" size="sm">
                    {getCMSField(cmsData, 'zonesDesc', 'Configure custom pricing for different geographic areas')}
                  </Text>
                </Stack>
              <ActionButtonGroup
                buttons={[
                  {
                    id: 'add-zone',
                    label: 'Add Zone',
                    onClick: addZone,
                    icon: '📍',
                    variant: 'outline' as const
                  }
                ]}
              />

              {settings.zones.length === 0 ? (
                <Box variant="elevated" padding="lg">
                  <Stack spacing="md">
                    <Stack spacing="sm">
                      <Text variant="lead" size="md" weight="semibold">
                        No zones configured
                      </Text>
                      <Text variant="muted" size="sm">
                        Add zones for different areas with custom pricing
                      </Text>
                    </Stack>
                    {getCMSField(cmsData, 'noZones-message', 'No pricing zones configured')}
                    <br data-cms-id="noZones-description" />
                    {getCMSField(cmsData, 'noZones-description', 'Add zones for different areas with custom pricing')}
                  </Stack>
                </Box>
              ) : (
                <Stack spacing="md">
                  {settings.zones.map((zone, index) => (
                    <Box key={index} variant="elevated" padding="lg">
                      <Stack spacing="md">
                        <Stack spacing="sm">
                          <Text variant="lead" size="md" weight="semibold">
                            Zone {index + 1}
                          </Text>
                          <Text variant="muted" size="sm">
                            Custom pricing for {zone.name}
                          </Text>
                        </Stack>
                      </Stack>
                      <Stack spacing="sm">
                        <div data-cms-id="zoneName-container">
                          <Label htmlFor={`zone-name-${index}`} data-cms-id="zoneNameLabel">{getCMSField(cmsData, 'zoneNameLabel', 'Zone Name')}</Label>
                          <Input
                            id={`zone-name-${index}`}
                            value={zone.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateZone(index, 'name', e.target.value)}
                            placeholder="Zone Name"
                          />
                        </div>

                        <div data-cms-id="zoneBaseFare-container">
                          <Label htmlFor={`zone-baseFare-${index}`} data-cms-id="zoneBaseFareLabel">{getCMSField(cmsData, 'zoneBaseFareLabel', 'Base Fare ($)')}</Label>
                          <Input
                            id={`zone-baseFare-${index}`}
                            type="number"
                            value={zone.baseFare.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateZone(index, 'baseFare', parseFloat(e.target.value) || 0)}
                            placeholder="10"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div data-cms-id="zonePerMile-container">
                          <Label htmlFor={`zone-perMile-${index}`} data-cms-id="zonePerMileLabel">{getCMSField(cmsData, 'zonePerMileLabel', 'Per Mile ($)')}</Label>
                          <Input
                            id={`zone-perMile-${index}`}
                            type="number"
                            value={zone.perMile.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateZone(index, 'perMile', parseFloat(e.target.value) || 0)}
                            placeholder="3.50"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div data-cms-id="zonePerMinute-container">
                          <Label htmlFor={`zone-perMinute-${index}`} data-cms-id="zonePerMinuteLabel">{getCMSField(cmsData, 'zonePerMinuteLabel', 'Per Minute ($)')}</Label>
                          <Input
                            id={`zone-perMinute-${index}`}
                            type="number"
                            value={zone.perMinute.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateZone(index, 'perMinute', parseFloat(e.target.value) || 0)}
                            placeholder="0.50"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <ActionButtonGroup
                          buttons={[
                            {
                              id: `remove-zone-${index}`,
                              label: 'Remove Zone',
                              onClick: () => removeZone(index),
                              icon: '🗑️',
                              variant: 'secondary' as const
                            }
                          ]}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
          </GridSection>
        </Stack>
      </Container>
    </>
  );
}

export default function PricingSettingsPage() {
  return (
    <ToastProvider>
      <PricingSettingsContent />
    </ToastProvider>
  );
}
