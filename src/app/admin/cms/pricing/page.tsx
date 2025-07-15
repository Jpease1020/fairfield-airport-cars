'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../withAuth';
import { cmsService } from '@/lib/cms-service';
import { PricingSettings } from '@/types/cms';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { 
  Save, 
  RefreshCw, 
  DollarSign, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

const PricingSettingsPage = () => {
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
    } catch (error) {
      console.error('Error loading pricing settings:', error);
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
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving pricing settings:', error);
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

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Pricing Settings" />
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!settings) {
    return (
      <PageContainer>
        <PageHeader title="Pricing Settings" />
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <AlertCircle className="h-8 w-8 text-error" />
            <span className="ml-2 text-gray-600">Failed to load settings</span>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <>
      <AdminNavigation />
      <PageContainer className="bg-bg-secondary">
        <PageHeader 
          title="Pricing Settings" 
          subtitle="Manage fare structure, zones, and cancellation policies"
        >
        <div className="flex items-center space-x-2">
          {saved && (
            <Badge variant="secondary" className="bg-bg-success text-text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Base Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Base Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseFare">Base Fare ($)</Label>
                <Input
                  id="baseFare"
                  type="number"
                  step="0.01"
                  value={settings.baseFare}
                  onChange={(e) => handleBasePricingChange('baseFare', parseFloat(e.target.value) || 0)}
                  placeholder="10.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perMile">Per Mile Rate ($)</Label>
                <Input
                  id="perMile"
                  type="number"
                  step="0.01"
                  value={settings.perMile}
                  onChange={(e) => handleBasePricingChange('perMile', parseFloat(e.target.value) || 0)}
                  placeholder="3.50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perMinute">Per Minute Rate ($)</Label>
                <Input
                  id="perMinute"
                  type="number"
                  step="0.01"
                  value={settings.perMinute}
                  onChange={(e) => handleBasePricingChange('perMinute', parseFloat(e.target.value) || 0)}
                  placeholder="0.50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositPercent">Deposit Percentage (%)</Label>
                <Input
                  id="depositPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.depositPercent}
                  onChange={(e) => handleBasePricingChange('depositPercent', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bufferMinutes">Buffer Minutes</Label>
                <Input
                  id="bufferMinutes"
                  type="number"
                  value={settings.bufferMinutes}
                  onChange={(e) => handleBasePricingChange('bufferMinutes', parseInt(e.target.value) || 0)}
                  placeholder="60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Cancellation Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="over24h">Over 24h Refund (%)</Label>
                <Input
                  id="over24h"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.cancellation.over24hRefundPercent}
                  onChange={(e) => handleCancellationChange('over24hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="between3And24h">3-24h Refund (%)</Label>
                <Input
                  id="between3And24h"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.cancellation.between3And24hRefundPercent}
                  onChange={(e) => handleCancellationChange('between3And24hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="under3h">Under 3h Refund (%)</Label>
                <Input
                  id="under3h"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.cancellation.under3hRefundPercent}
                  onChange={(e) => handleCancellationChange('under3hRefundPercent', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Zones */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Pricing Zones</span>
                </div>
                <Button onClick={addZone} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {settings.zones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pricing zones configured</p>
                  <p className="text-sm">Add zones for different areas with custom pricing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.zones.map((zone, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Zone {index + 1}</h4>
                        <Button
                          onClick={() => removeZone(index)}
                          size="sm"
                          variant="outline"
                          className="text-error hover:text-error-hover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`zone-${index}-name`}>Zone Name</Label>
                          <Input
                            id={`zone-${index}-name`}
                            value={zone.name}
                            onChange={(e) => updateZone(index, 'name', e.target.value)}
                            placeholder="Downtown"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`zone-${index}-baseFare`}>Base Fare ($)</Label>
                          <Input
                            id={`zone-${index}-baseFare`}
                            type="number"
                            step="0.01"
                            value={zone.baseFare}
                            onChange={(e) => updateZone(index, 'baseFare', parseFloat(e.target.value) || 0)}
                            placeholder="10.00"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`zone-${index}-perMile`}>Per Mile ($)</Label>
                          <Input
                            id={`zone-${index}-perMile`}
                            type="number"
                            step="0.01"
                            value={zone.perMile}
                            onChange={(e) => updateZone(index, 'perMile', parseFloat(e.target.value) || 0)}
                            placeholder="3.50"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`zone-${index}-perMinute`}>Per Minute ($)</Label>
                          <Input
                            id={`zone-${index}-perMinute`}
                            type="number"
                            step="0.01"
                            value={zone.perMinute}
                            onChange={(e) => updateZone(index, 'perMinute', parseFloat(e.target.value) || 0)}
                            placeholder="0.50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pricing Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-center">Base Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span className="font-medium">${settings.baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Mile:</span>
                      <span className="font-medium">${settings.perMile.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Minute:</span>
                      <span className="font-medium">${settings.perMinute.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit:</span>
                      <span className="font-medium">{settings.depositPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-center">Cancellation Policy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Over 24h:</span>
                      <span className="font-medium">{settings.cancellation.over24hRefundPercent}% refund</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3-24h:</span>
                      <span className="font-medium">{settings.cancellation.between3And24hRefundPercent}% refund</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Under 3h:</span>
                      <span className="font-medium">{settings.cancellation.under3hRefundPercent}% refund</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-center">Zones</h4>
                  <div className="space-y-2 text-sm">
                    {settings.zones.length === 0 ? (
                      <p className="text-gray-500 text-center">No zones configured</p>
                    ) : (
                      settings.zones.map((zone, index) => (
                        <div key={index} className="border-t pt-2">
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-xs text-gray-600">
                            ${zone.baseFare} + ${zone.perMile}/mile + ${zone.perMinute}/min
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
    </>
  );
};

export default withAuth(PricingSettingsPage); 