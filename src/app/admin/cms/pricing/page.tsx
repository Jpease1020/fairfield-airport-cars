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
  Text,
  Container,
  Span
} from '@/components/ui';
import { Stack } from '@/components/ui/containers';
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
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await cmsService.updatePricingSettings(settings);
      setSaved(true);
      addToast('success', 'Pricing settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving pricing settings:', error);
      addToast('error', 'Failed to save pricing settings');
    } finally {
      setSaving(false);
    }
  };

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

  const headerActions = [
    { 
      label: 'Back to CMS', 
      onClick: () => window.location.href = '/admin/cms', 
      variant: 'outline' as const 
    },
    { 
      label: saving ? 'Saving...' : 'Save Changes', 
      onClick: handleSave, 
      variant: 'primary' as const,
      disabled: saving || !settings
    }
  ];

  if (loading) {
    return (
      <AdminPageWrapper
        title="Pricing Settings"
        subtitle="Loading pricing configuration..."
        loading={true}
        loadingMessage="Loading pricing settings..."
      >
        <Container>
          <Span>Loading...</Span>
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
          <Span>Error loading settings</Span>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Pricing Settings"
      subtitle="Manage fare structure, zones, and cancellation policies"
      actions={headerActions}
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
          title="💰 Base Pricing"
          description="Configure your base fare structure and rates"
        >
          <Stack spacing="md">
            <Container>
              <Stack>
                <Label htmlFor="baseFare">Base Fare ($)</Label>
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
                <Label htmlFor="perMile">Per Mile Rate ($)</Label>
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
                <Label htmlFor="perMinute">Per Minute Rate ($)</Label>
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
                <Label htmlFor="depositPercent">Deposit Percentage (%)</Label>
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
                <Label htmlFor="bufferMinutes">Buffer Minutes</Label>
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
          title="⏰ Cancellation Policy"
          description="Set refund percentages for different cancellation timeframes"
        >
          <Stack spacing="md">
            <Container>
              <Stack>
                <Label htmlFor="over24hRefund">Over 24h Refund (%)</Label>
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
                <Label htmlFor="between3And24hRefund">3-24h Refund (%)</Label>
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
                <Label htmlFor="under3hRefund">Under 3h Refund (%)</Label>
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
          title="📍 Pricing Zones"
          description="Configure custom pricing for different geographic areas"
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
                <Text>No pricing zones configured</Text>
                <Text>Add zones for different areas with custom pricing</Text>
              </Container>
            ) : (
              <Stack spacing="md">
                {settings.zones.map((zone, index) => (
                  <Container key={index}>
                    <Stack direction="horizontal" justify="between" align="center">
                      <H4>Zone {index + 1}</H4>
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
                          <Label htmlFor={`zone-name-${index}`}>Zone Name</Label>
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
                          <Label htmlFor={`zone-baseFare-${index}`}>Base Fare ($)</Label>
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
                          <Label htmlFor={`zone-perMile-${index}`}>Per Mile ($)</Label>
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
                          <Label htmlFor={`zone-perMinute-${index}`}>Per Minute ($)</Label>
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
