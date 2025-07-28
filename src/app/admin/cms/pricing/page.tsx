'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { cmsService } from '@/lib/services/cms-service';
import { PricingSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  Input,
  Label,
  H4,
  Container,
  Span,
  EditableText
} from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Trash2,
  CheckCircle
} from 'lucide-react';

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

  if (loading) {
    return (
      <AdminPageWrapper
        title="Pricing Settings"
        subtitle="Loading pricing configuration..."
        loading={true}
        loadingMessage="Loading pricing settings..."
      >
        <Container>
          <EditableText field="admin.cms.pricing.loading" defaultValue="Loading...">
            Loading...
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (!settings) {
    return (
      <AdminPageWrapper
        title="Pricing Settings"
        subtitle="Failed to load settings"
        error="Failed to load pricing settings"
        errorTitle="Load Error"
      >
        <Container>
          <EditableText field="admin.cms.pricing.error" defaultValue="Error loading settings">
            Error loading settings
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Pricing Settings"
      subtitle="Manage fare structure, zones, and cancellation policies"
    >
      {/* Success Message */}
      {saved && (
        <GridSection variant="content" columns={1}>
          <InfoCard title="✅ Settings Saved" description="Pricing settings saved successfully">
            <Container>
              <Stack direction="horizontal" spacing="sm">
                <CheckCircle />
                <Span>Pricing settings saved successfully</Span>
              </Stack>
            </Container>
          </InfoCard>
        </GridSection>
      )}

      {/* Base Pricing */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={<EditableText field="admin.cms.pricing.basePricingTitle" defaultValue="💰 Base Pricing">💰 Base Pricing</EditableText>}
          description={<EditableText field="admin.cms.pricing.basePricingDesc" defaultValue="Configure your base fare structure and rates">Configure your base fare structure and rates</EditableText>}
        >
          <Stack spacing="md">
            <Container>
              <Stack>
                <Label htmlFor="baseFare"><EditableText field="admin.cms.pricing.baseFareLabel" defaultValue="Base Fare ($)">Base Fare ($)</EditableText></Label>
                <Input
                  id="baseFare"
                  type="number"
                  value={settings.baseFare.toString()}
                  onChange={(e) => handleBasePricingChange('baseFare', parseFloat(e.target.value) || 0)}
                  placeholder="10.00"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="perMile"><EditableText field="admin.cms.pricing.perMileLabel" defaultValue="Per Mile Rate ($)">Per Mile Rate ($)</EditableText></Label>
                <Input
                  id="perMile"
                  type="number"
                  value={settings.perMile.toString()}
                  onChange={(e) => handleBasePricingChange('perMile', parseFloat(e.target.value) || 0)}
                  placeholder="3.50"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="perMinute"><EditableText field="admin.cms.pricing.perMinuteLabel" defaultValue="Per Minute Rate ($)">Per Minute Rate ($)</EditableText></Label>
                <Input
                  id="perMinute"
                  type="number"
                  value={settings.perMinute.toString()}
                  onChange={(e) => handleBasePricingChange('perMinute', parseFloat(e.target.value) || 0)}
                  placeholder="0.50"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="depositPercent"><EditableText field="admin.cms.pricing.depositPercentLabel" defaultValue="Deposit Percentage (%)">Deposit Percentage (%)</EditableText></Label>
                <Input
                  id="depositPercent"
                  type="number"
                  value={settings.depositPercent.toString()}
                  onChange={(e) => handleBasePricingChange('depositPercent', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="bufferMinutes"><EditableText field="admin.cms.pricing.bufferMinutesLabel" defaultValue="Buffer Minutes">Buffer Minutes</EditableText></Label>
                <Input
                  id="bufferMinutes"
                  type="number"
                  value={settings.bufferMinutes.toString()}
                  onChange={(e) => handleBasePricingChange('bufferMinutes', parseInt(e.target.value) || 0)}
                  placeholder="60"
                />
              </Stack>
            </Container>
          </Stack>
        </InfoCard>
      </GridSection>

      {/* Cancellation Policy */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={<EditableText field="admin.cms.pricing.cancellationTitle" defaultValue="⏰ Cancellation Policy">⏰ Cancellation Policy</EditableText>}
          description={<EditableText field="admin.cms.pricing.cancellationDesc" defaultValue="Set refund percentages for different cancellation timeframes">Set refund percentages for different cancellation timeframes</EditableText>}
        >
          <Stack spacing="md">
            <Container>
              <Stack>
                <Label htmlFor="over24hRefund"><EditableText field="admin.cms.pricing.over24hRefundLabel" defaultValue="Over 24h Refund (%)">Over 24h Refund (%)</EditableText></Label>
                <Input
                  id="over24hRefund"
                  type="number"
                  value={settings.cancellation.over24hRefundPercent.toString()}
                  onChange={(e) => handleCancellationChange('over24hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="between3And24hRefund"><EditableText field="admin.cms.pricing.between3And24hRefundLabel" defaultValue="3-24h Refund (%)">3-24h Refund (%)</EditableText></Label>
                <Input
                  id="between3And24hRefund"
                  type="number"
                  value={settings.cancellation.between3And24hRefundPercent.toString()}
                  onChange={(e) => handleCancellationChange('between3And24hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </Stack>
            </Container>

            <Container>
              <Stack>
                <Label htmlFor="under3hRefund"><EditableText field="admin.cms.pricing.under3hRefundLabel" defaultValue="Under 3h Refund (%)">Under 3h Refund (%)</EditableText></Label>
                <Input
                  id="under3hRefund"
                  type="number"
                  value={settings.cancellation.under3hRefundPercent.toString()}
                  onChange={(e) => handleCancellationChange('under3hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </Stack>
            </Container>
          </Stack>
        </InfoCard>
      </GridSection>

      {/* Pricing Zones */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={<EditableText field="admin.cms.pricing.zonesTitle" defaultValue="📍 Pricing Zones">📍 Pricing Zones</EditableText>}
          description={<EditableText field="admin.cms.pricing.zonesDesc" defaultValue="Configure custom pricing for different geographic areas">Configure custom pricing for different geographic areas</EditableText>}
        >
          <Stack spacing="md">
            <Container>
              <ActionButtonGroup buttons={[
                {
                  label: 'Add Zone',
                  onClick: addZone,
                  variant: 'outline' as const,
                  icon: '➕'
                }
              ]} />
            </Container>

            {settings.zones.length === 0 ? (
              <Container>
                <MapPin />
                <EditableText field="admin.cms.pricing.noZones.message" defaultValue="No pricing zones configured">
                  No pricing zones configured
                </EditableText>
                <EditableText field="admin.cms.pricing.noZones.description" defaultValue="Add zones for different areas with custom pricing">
                  Add zones for different areas with custom pricing
                </EditableText>
              </Container>
            ) : (
              <Stack spacing="md">
                {settings.zones.map((zone, index) => (
                  <Container key={index}>
                    <Stack direction="horizontal" justify="between" align="center">
                      <H4><EditableText field="admin.cms.pricing.zoneHeading" defaultValue={`Zone ${index + 1}`}>{`Zone ${index + 1}`}</EditableText></H4>
                      <Button
                        onClick={() => removeZone(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 />
                      </Button>
                    </Stack>
                    
                    <Stack spacing="md">
                      <Container>
                        <Stack>
                          <Label htmlFor={`zone-name-${index}`}><EditableText field="admin.cms.pricing.zoneNameLabel" defaultValue="Zone Name">Zone Name</EditableText></Label>
                          <Input
                            id={`zone-name-${index}`}
                            value={zone.name}
                            onChange={(e) => updateZone(index, 'name', e.target.value)}
                            placeholder="Downtown"
                          />
                        </Stack>
                      </Container>
                      
                      <Container>
                        <Stack>
                          <Label htmlFor={`zone-baseFare-${index}`}><EditableText field="admin.cms.pricing.zoneBaseFareLabel" defaultValue="Base Fare ($)">Base Fare ($)</EditableText></Label>
                          <Input
                            id={`zone-baseFare-${index}`}
                            type="number"
                            value={zone.baseFare.toString()}
                            onChange={(e) => updateZone(index, 'baseFare', parseFloat(e.target.value) || 0)}
                            placeholder="10.00"
                          />
                        </Stack>
                      </Container>
                      
                      <Container>
                        <Stack>
                          <Label htmlFor={`zone-perMile-${index}`}><EditableText field="admin.cms.pricing.zonePerMileLabel" defaultValue="Per Mile ($)">Per Mile ($)</EditableText></Label>
                          <Input
                            id={`zone-perMile-${index}`}
                            type="number"
                            value={zone.perMile.toString()}
                            onChange={(e) => updateZone(index, 'perMile', parseFloat(e.target.value) || 0)}
                            placeholder="3.50"
                          />
                        </Stack>
                      </Container>
                      
                      <Container>
                        <Stack>
                          <Label htmlFor={`zone-perMinute-${index}`}><EditableText field="admin.cms.pricing.zonePerMinuteLabel" defaultValue="Per Minute ($)">Per Minute ($)</EditableText></Label>
                          <Input
                            id={`zone-perMinute-${index}`}
                            type="number"
                            value={zone.perMinute.toString()}
                            onChange={(e) => updateZone(index, 'perMinute', parseFloat(e.target.value) || 0)}
                            placeholder="0.50"
                          />
                        </Stack>
                      </Container>
                    </Stack>
                  </Container>
                ))}
              </Stack>
            )}
          </Stack>
        </InfoCard>
      </GridSection>
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
