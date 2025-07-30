'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { cmsService } from '@/lib/services/cms-service';
import { PricingSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  GridSection,
  Card,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  H4,
  Container,
  Span,
} from '@/components/ui';
import { Input } from '@/design/components/core/layout/FormSystem';
import { Label } from '@/design/components/core/layout/label';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { Stack } from '@/components/ui/layout/containers';

function PricingSettingsContent() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadPricingSettings = useCallback(async () => {
    try {
      setLoading(true);
      const pricingSettings = await cmsService.getPricingSettings();
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

  const handleSave = async () => {
    try {
      setLoading(true);
      await cmsService.updatePricingSettings(settings!);
      addToast('success', 'Pricing settings saved successfully');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving pricing settings:', error);
      addToast('error', 'Failed to save pricing settings');
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Save Changes', 
      onClick: handleSave, 
      variant: 'primary' as const,
      disabled: loading || !settings
    },
    { 
      label: 'Refresh', 
      onClick: loadPricingSettings, 
      variant: 'outline' as const,
      disabled: loading
    }
  ];

  if (loading) {
    return (
      <AdminPageWrapper
        title="Pricing Settings"
        subtitle="Loading pricing configuration..."
        actions={headerActions}
        loadingMessage="Loading pricing settings..."
      >
        <Container>
          <EditableText field="admin.cms.pricing.loading" defaultValue="Loading...">
            Loading pricing settings...
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (!settings) {
    return (
      <AdminPageWrapper
        title="Pricing Settings"
        subtitle="Error loading settings"
        actions={headerActions}
        error="Failed to load pricing settings"
      >
        <Container>
          <EditableText field="admin.cms.pricing.error" defaultValue="Error loading settings">
            Failed to load pricing settings. Please try refreshing the page.
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Pricing Settings"
      subtitle="Configure your service rates and pricing structure"
      actions={headerActions}
    >
      <Container>
        {saved && (
          <Card title="✅ Settings Saved" description="Pricing settings saved successfully">
            <Span>Pricing settings saved successfully</Span>
          </Card>
        )}

        <Stack gap="lg">
          {/* Base Pricing */}
          <GridSection>
            <Card
              title={<EditableText field="admin.cms.pricing.basePricingTitle" defaultValue="💰 Base Pricing">💰 Base Pricing</EditableText>}
              description={<EditableText field="admin.cms.pricing.basePricingDesc" defaultValue="Configure your base fare structure and rates">Configure your base fare structure and rates</EditableText>}
            >
              <Stack gap="md">
                <div>
                  <Label htmlFor="baseFare"><EditableText field="admin.cms.pricing.baseFareLabel" defaultValue="Base Fare ($)">Base Fare ($)</EditableText></Label>
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

                <div>
                  <Label htmlFor="perMile"><EditableText field="admin.cms.pricing.perMileLabel" defaultValue="Per Mile Rate ($)">Per Mile Rate ($)</EditableText></Label>
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

                <div>
                  <Label htmlFor="perMinute"><EditableText field="admin.cms.pricing.perMinuteLabel" defaultValue="Per Minute Rate ($)">Per Minute Rate ($)</EditableText></Label>
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

                <div>
                  <Label htmlFor="depositPercent"><EditableText field="admin.cms.pricing.depositPercentLabel" defaultValue="Deposit Percentage (%)">Deposit Percentage (%)</EditableText></Label>
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

                <div>
                  <Label htmlFor="bufferMinutes"><EditableText field="admin.cms.pricing.bufferMinutesLabel" defaultValue="Buffer Minutes">Buffer Minutes</EditableText></Label>
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
            </Card>
          </GridSection>

          {/* Competitor Pricing Reference */}
          <GridSection>
            <Card 
              title="🏢 Competitor Pricing Reference"
              description="Reference pricing for common routes (for comparison only - not scraped data)"
            >
              <Stack gap="sm">
                <div>
                  <strong>Fairfield, CT → JFK Airport:</strong>
                  <ul>
                    <li>Lyft/Uber: ~$120-180 (estimated)</li>
                    <li>Your Current Rate: ${settings.baseFare + (65 * settings.perMile) + (65 * settings.perMinute)}</li>
                  </ul>
                </div>
                <div>
                  <strong>Fairfield, CT → LaGuardia Airport:</strong>
                  <ul>
                    <li>Lyft/Uber: ~$100-150 (estimated)</li>
                    <li>Your Current Rate: ${settings.baseFare + (55 * settings.perMile) + (55 * settings.perMinute)}</li>
                  </ul>
                </div>
                <div>
                  <strong>Note:</strong> These are rough estimates for planning purposes. Actual competitor prices vary by time, demand, and other factors.
                </div>
              </Stack>
            </Card>
          </GridSection>

          {/* Cancellation Policy */}
          <GridSection>
            <Card
              title={<EditableText field="admin.cms.pricing.cancellationTitle" defaultValue="⏰ Cancellation Policy">⏰ Cancellation Policy</EditableText>}
              description={<EditableText field="admin.cms.pricing.cancellationDesc" defaultValue="Set refund percentages for different cancellation timeframes">Set refund percentages for different cancellation timeframes</EditableText>}
            >
              <Stack gap="md">
                <div>
                  <Label htmlFor="over24hRefund"><EditableText field="admin.cms.pricing.over24hRefundLabel" defaultValue="Over 24h Refund (%)">Over 24h Refund (%)</EditableText></Label>
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

                <div>
                  <Label htmlFor="between3And24hRefund"><EditableText field="admin.cms.pricing.between3And24hRefundLabel" defaultValue="3-24h Refund (%)">3-24h Refund (%)</EditableText></Label>
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

                <div>
                  <Label htmlFor="under3hRefund"><EditableText field="admin.cms.pricing.under3hRefundLabel" defaultValue="Under 3h Refund (%)">Under 3h Refund (%)</EditableText></Label>
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
            </Card>
          </GridSection>

          {/* Pricing Zones */}
          <GridSection>
            <Card
              title={<EditableText field="admin.cms.pricing.zonesTitle" defaultValue="📍 Pricing Zones">📍 Pricing Zones</EditableText>}
              description={<EditableText field="admin.cms.pricing.zonesDesc" defaultValue="Configure custom pricing for different geographic areas">Configure custom pricing for different geographic areas</EditableText>}
            >
              <ActionButtonGroup
                buttons={[
                  {
                    label: 'Add Zone',
                    onClick: addZone,
                    icon: '📍',
                    variant: 'outline' as const
                  }
                ]}
              />

              {settings.zones.length === 0 ? (
                <Card
                  title="No zones configured"
                  description="Add zones for different areas with custom pricing"
                >
                  <EditableText field="admin.cms.pricing.noZones.message" defaultValue="No pricing zones configured">
                    No pricing zones configured
                  </EditableText>
                  <br />
                  <EditableText field="admin.cms.pricing.noZones.description" defaultValue="Add zones for different areas with custom pricing">
                    Add zones for different areas with custom pricing
                  </EditableText>
                </Card>
              ) : (
                <Stack gap="md">
                  {settings.zones.map((zone, index) => (
                    <Card
                      key={index}
                      title={`Zone ${index + 1}`}
                      description={`Custom pricing for ${zone.name}`}
                    >
                      <Stack gap="sm">
                        <div>
                          <Label htmlFor={`zone-name-${index}`}><EditableText field="admin.cms.pricing.zoneNameLabel" defaultValue="Zone Name">Zone Name</EditableText></Label>
                          <Input
                            id={`zone-name-${index}`}
                            value={zone.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateZone(index, 'name', e.target.value)}
                            placeholder="Zone Name"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`zone-baseFare-${index}`}><EditableText field="admin.cms.pricing.zoneBaseFareLabel" defaultValue="Base Fare ($)">Base Fare ($)</EditableText></Label>
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

                        <div>
                          <Label htmlFor={`zone-perMile-${index}`}><EditableText field="admin.cms.pricing.zonePerMileLabel" defaultValue="Per Mile ($)">Per Mile ($)</EditableText></Label>
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

                        <div>
                          <Label htmlFor={`zone-perMinute-${index}`}><EditableText field="admin.cms.pricing.zonePerMinuteLabel" defaultValue="Per Minute ($)">Per Minute ($)</EditableText></Label>
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
                              label: 'Remove Zone',
                              onClick: () => removeZone(index),
                              icon: '🗑️',
                              variant: 'secondary' as const
                            }
                          ]}
                        />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </GridSection>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
}

export default function PricingSettingsPage() {
  return (
    <ToastProvider>
      <PricingSettingsContent />
    </ToastProvider>
  );
}
