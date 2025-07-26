'use client';

import { useState, useEffect } from 'react';

import { cmsService } from '@/lib/services/cms-service';
import { PricingSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast
} from '@/components/ui';
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

  useEffect(() => {
    loadPricingSettings();
  }, []);

  const loadPricingSettings = async () => {
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
  };

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
        <div />
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
        <div />
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
            <div className="pricing-save-success">
              <CheckCircle className="pricing-save-icon" />
              <span className="pricing-save-text">Pricing settings saved successfully</span>
            </div>
          </InfoCard>
        </GridSection>
      )}

      {/* Base Pricing */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💰 Base Pricing"
          description="Configure your base fare structure and rates"
        >
          <div className="pricing-base-section">
            <div className="pricing-field-group">
              <label className="pricing-field-label">Base Fare ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.baseFare}
                onChange={(e) => handleBasePricingChange('baseFare', parseFloat(e.target.value) || 0)}
                placeholder="10.00"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">Per Mile Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.perMile}
                onChange={(e) => handleBasePricingChange('perMile', parseFloat(e.target.value) || 0)}
                placeholder="3.50"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">Per Minute Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.perMinute}
                onChange={(e) => handleBasePricingChange('perMinute', parseFloat(e.target.value) || 0)}
                placeholder="0.50"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">Deposit Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.depositPercent}
                onChange={(e) => handleBasePricingChange('depositPercent', parseInt(e.target.value) || 0)}
                placeholder="50"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">Buffer Minutes</label>
              <input
                type="number"
                value={settings.bufferMinutes}
                onChange={(e) => handleBasePricingChange('bufferMinutes', parseInt(e.target.value) || 0)}
                placeholder="60"
                className="pricing-field-input"
              />
            </div>
          </div>
        </InfoCard>
      </GridSection>

      {/* Cancellation Policy */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="⏰ Cancellation Policy"
          description="Set refund percentages for different cancellation timeframes"
        >
          <div className="pricing-cancellation-section">
            <div className="pricing-field-group">
              <label className="pricing-field-label">Over 24h Refund (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.cancellation.over24hRefundPercent}
                onChange={(e) => handleCancellationChange('over24hRefundPercent', parseInt(e.target.value) || 0)}
                placeholder="100"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">3-24h Refund (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.cancellation.between3And24hRefundPercent}
                onChange={(e) => handleCancellationChange('between3And24hRefundPercent', parseInt(e.target.value) || 0)}
                placeholder="50"
                className="pricing-field-input"
              />
            </div>

            <div className="pricing-field-group">
              <label className="pricing-field-label">Under 3h Refund (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.cancellation.under3hRefundPercent}
                onChange={(e) => handleCancellationChange('under3hRefundPercent', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="pricing-field-input"
              />
            </div>
          </div>
        </InfoCard>
      </GridSection>

      {/* Pricing Zones */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📍 Pricing Zones"
          description="Configure custom pricing for different geographic areas"
        >
          <div className="pricing-zones-section">
            <div className="pricing-zones-header">
              <ActionButtonGroup buttons={[
                {
                  label: 'Add Zone',
                  onClick: addZone,
                  variant: 'outline' as const,
                  icon: '➕'
                }
              ]} />
            </div>

            {settings.zones.length === 0 ? (
              <div className="pricing-zones-empty">
                <MapPin className="pricing-zones-empty-icon" />
                <p className="pricing-zones-empty-title">No pricing zones configured</p>
                <p className="pricing-zones-empty-description">Add zones for different areas with custom pricing</p>
              </div>
            ) : (
              <div className="pricing-zones-list">
                {settings.zones.map((zone, index) => (
                  <div key={index} className="pricing-zone-item">
                    <div className="pricing-zone-header">
                      <h4 className="pricing-zone-title">Zone {index + 1}</h4>
                      <button
                        onClick={() => removeZone(index)}
                        className="pricing-zone-remove-btn"
                      >
                        <Trash2 className="pricing-zone-remove-icon" />
                      </button>
                    </div>
                    
                    <div className="pricing-zone-fields">
                      <div className="pricing-field-group">
                        <label className="pricing-field-label">Zone Name</label>
                        <input
                          value={zone.name}
                          onChange={(e) => updateZone(index, 'name', e.target.value)}
                          placeholder="Downtown"
                          className="pricing-field-input"
                        />
                      </div>
                      
                      <div className="pricing-field-group">
                        <label className="pricing-field-label">Base Fare ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={zone.baseFare}
                          onChange={(e) => updateZone(index, 'baseFare', parseFloat(e.target.value) || 0)}
                          placeholder="10.00"
                          className="pricing-field-input"
                        />
                      </div>
                      
                      <div className="pricing-field-group">
                        <label className="pricing-field-label">Per Mile ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={zone.perMile}
                          onChange={(e) => updateZone(index, 'perMile', parseFloat(e.target.value) || 0)}
                          placeholder="3.50"
                          className="pricing-field-input"
                        />
                      </div>
                      
                      <div className="pricing-field-group">
                        <label className="pricing-field-label">Per Minute ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={zone.perMinute}
                          onChange={(e) => updateZone(index, 'perMinute', parseFloat(e.target.value) || 0)}
                          placeholder="0.50"
                          className="pricing-field-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
