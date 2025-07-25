'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { BusinessSettings } from '@/types/cms';
import { PageHeader } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { 
  Save, 
  RefreshCw, 
  Building2, 
  Palette, 
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const BusinessSettingsPage = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      setLoading(true);
      const businessSettings = await cmsService.getBusinessSettings();
      setSettings(businessSettings);
    } catch (error) {
      console.error('Error loading business settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await cmsService.updateBusinessSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving business settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof BusinessSettings, field: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleSocialChange = (platform: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      social: {
        ...settings.social,
        [platform]: value
      }
    });
  };

  const headerActions = [
    { 
      label: 'Back to CMS', 
      href: '/admin/cms', 
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
      <div className="admin-dashboard">
        <AdminNavigation />
        <PageHeader
          title="Business Settings"
          subtitle="Loading business configuration..."
        />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-dashboard">
        <AdminNavigation />
        <PageHeader
          title="Business Settings"
          subtitle="Failed to load settings"
        />
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-error" />
          <span className="ml-2 text-gray-600">Failed to load settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard bg-bg-secondary">
      <AdminNavigation />
      <PageHeader
        title="Business Settings"
        subtitle="Manage company information, contact details, and branding"
        actions={headerActions}
      />

      {saved && (
        <div className="mb-6">
          <Badge variant="secondary" className="bg-bg-success text-text-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Settings saved successfully
          </Badge>
        </div>
      )}

      <div className="standard-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.company.name}
                  onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.company.tagline || ''}
                  onChange={(e) => handleInputChange('company', 'tagline', e.target.value)}
                  placeholder="Your company tagline"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.company.phone}
                  onChange={(e) => handleInputChange('company', 'phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.company.email}
                  onChange={(e) => handleInputChange('company', 'email', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.company.address || ''}
                  onChange={(e) => handleInputChange('company', 'address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Business Hours</Label>
                <Input
                  id="hours"
                  value={settings.company.hours || ''}
                  onChange={(e) => handleInputChange('company', 'hours', e.target.value)}
                  placeholder="Mon-Fri 9am-5pm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Social Media</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={settings.social.facebook || ''}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={settings.social.instagram || ''}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={settings.social.twitter || ''}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourpage"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Branding</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleInputChange('branding', 'primaryColor', e.target.value)}
                    placeholder="#1f2937"
                  />
                  <div 
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: settings.branding.primaryColor }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => handleInputChange('branding', 'secondaryColor', e.target.value)}
                    placeholder="#3b82f6"
                  />
                  <div 
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: settings.branding.secondaryColor }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.branding.logoUrl || ''}
                  onChange={(e) => handleInputChange('branding', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="text-center">
                  <h2 className="text-xl font-bold" style={{ color: settings.branding.primaryColor }}>
                    {settings.company.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{settings.company.tagline}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{settings.company.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{settings.company.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hours:</span>
                    <span>{settings.company.hours}</span>
                  </div>
                </div>

                {Object.values(settings.social).some(url => url) && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Social Media:</p>
                    <div className="flex space-x-2">
                      {settings.social.facebook && (
                        <Badge variant="outline" className="text-xs">Facebook</Badge>
                      )}
                      {settings.social.instagram && (
                        <Badge variant="outline" className="text-xs">Instagram</Badge>
                      )}
                      {settings.social.twitter && (
                        <Badge variant="outline" className="text-xs">Twitter</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BusinessSettingsPage); 