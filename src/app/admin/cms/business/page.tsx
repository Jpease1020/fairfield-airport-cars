'use client';

import { useState, useEffect, useMemo } from 'react';
import withAuth from '../../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { BusinessSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  SettingSection,
  SettingInput,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection
} from '@/components/ui';

function BusinessPageContent() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const businessSettings = await cmsService.getBusinessSettings();
      setSettings(businessSettings);
      addToast('success', 'Business settings loaded successfully');
    } catch (error) {
      console.error('Error loading business settings:', error);
      const errorMsg = 'Failed to load business settings';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await cmsService.updateBusinessSettings(settings);
      addToast('success', 'Business settings saved successfully!');
    } catch (error) {
      console.error('Error saving business settings:', error);
      const errorMsg = 'Failed to save business settings';
      setError(errorMsg);
      addToast('error', errorMsg);
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

  // Header actions
  const headerActions = useMemo(() => [
    { 
      label: 'Back to CMS',
      onClick: (): void => { window.location.href = '/admin/cms'; },
      variant: 'outline' as const,
      icon: '🔙'
    },
    { 
      label: 'Reload Settings',
      onClick: loadBusinessSettings,
      variant: 'outline' as const,
      disabled: loading,
      icon: '🔄'
    },
    { 
      label: 'Save Changes',
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: !settings || saving,
      icon: '💾'
    }
  ], [settings, loading, saving]);

  if (loading) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
        loading={true}
        loadingMessage="Loading business settings..."
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
        error={error}
        errorTitle="Settings Load Error"
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!settings) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
        error="No business settings found"
        errorTitle="Settings Not Found"
      >
        <div />
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Business Settings"
      subtitle="Configure your company information and branding"
      actions={headerActions}
      loading={saving}
      loadingMessage="Saving business settings..."
    >
      {saving && (
        <StatusMessage
          type="info"
          message="Please wait while we save your business settings..."
        />
      )}

      {settings && (
        <GridSection variant="content" columns={1}>
          <div className="settings-container">
            {/* Company Information */}
            <SettingSection
              title="Company Information"
              description="Basic company details and contact information"
              icon="🏢"
            >
              <div className="settings-grid">
                <SettingInput
                  id="company-name"
                  label="Company Name"
                  description="Your official business name"
                  value={settings.company.name}
                  onChange={(value) => handleInputChange('company', 'name', value)}
                  placeholder="Your Company Name"
                  icon="🏢"
                />
                
                <SettingInput
                  id="company-tagline"
                  label="Tagline"
                  description="A brief description of your business"
                  value={settings.company.tagline || ''}
                  onChange={(value) => handleInputChange('company', 'tagline', value)}
                  placeholder="Your company tagline"
                  icon="💬"
                />
                
                <SettingInput
                  id="company-phone"
                  label="Phone Number"
                  description="Primary contact phone number"
                  value={settings.company.phone}
                  onChange={(value) => handleInputChange('company', 'phone', value)}
                  placeholder="(555) 123-4567"
                  icon="📞"
                />
                
                <SettingInput
                  id="company-email"
                  label="Email Address"
                  description="Primary contact email address"
                  type="email"
                  value={settings.company.email}
                  onChange={(value) => handleInputChange('company', 'email', value)}
                  placeholder="contact@company.com"
                  icon="✉️"
                />
                
                <SettingInput
                  id="company-address"
                  label="Address"
                  description="Business physical address"
                  value={settings.company.address || ''}
                  onChange={(value) => handleInputChange('company', 'address', value)}
                  placeholder="123 Main St, City, State 12345"
                  icon="📍"
                />
                
                <SettingInput
                  id="company-hours"
                  label="Business Hours"
                  description="Operating hours for customers"
                  value={settings.company.hours || ''}
                  onChange={(value) => handleInputChange('company', 'hours', value)}
                  placeholder="Mon-Fri 9am-5pm"
                  icon="🕒"
                />
              </div>
            </SettingSection>

            {/* Social Media */}
            <SettingSection
              title="Social Media"
              description="Links to your social media profiles"
              icon="📱"
            >
              <div className="settings-grid">
                <SettingInput
                  id="social-facebook"
                  label="Facebook URL"
                  description="Link to your Facebook business page"
                  value={settings.social.facebook || ''}
                  onChange={(value) => handleSocialChange('facebook', value)}
                  placeholder="https://facebook.com/yourpage"
                  icon="📘"
                />
                
                <SettingInput
                  id="social-instagram"
                  label="Instagram URL"
                  description="Link to your Instagram business account"
                  value={settings.social.instagram || ''}
                  onChange={(value) => handleSocialChange('instagram', value)}
                  placeholder="https://instagram.com/yourpage"
                  icon="📷"
                />
                
                <SettingInput
                  id="social-twitter"
                  label="Twitter URL"
                  description="Link to your Twitter business account"
                  value={settings.social.twitter || ''}
                  onChange={(value) => handleSocialChange('twitter', value)}
                  placeholder="https://twitter.com/yourpage"
                  icon="🐦"
                />
              </div>
            </SettingSection>

            {/* Branding */}
            <SettingSection
              title="Branding"
              description="Visual identity and brand colors"
              icon="🎨"
            >
              <div className="settings-grid">
                <div className="color-preview-card">
                  <SettingInput
                    id="brand-primary-color"
                    label="Primary Color"
                    description="Main brand color for buttons and accents"
                    value={settings.branding.primaryColor}
                    onChange={(value) => handleInputChange('branding', 'primaryColor', value)}
                    placeholder="#1f2937"
                    icon="🎨"
                  />
                  <div className="color-preview">
                    <span className="preview-label">Preview:</span>
                    <div className="color-swatch" />
                  </div>
                </div>
                
                <div className="color-preview-card">
                  <SettingInput
                    id="brand-secondary-color"
                    label="Secondary Color"
                    description="Secondary brand color for highlights"
                    value={settings.branding.secondaryColor}
                    onChange={(value) => handleInputChange('branding', 'secondaryColor', value)}
                    placeholder="#3b82f6"
                    icon="🎨"
                  />
                  <div className="color-preview">
                    <span className="preview-label">Preview:</span>
                    <div className="color-swatch" />
                  </div>
                </div>
                
                <SettingInput
                  id="brand-logo-url"
                  label="Logo URL"
                  description="Direct link to your company logo image"
                  value={settings.branding.logoUrl || ''}
                  onChange={(value) => handleInputChange('branding', 'logoUrl', value)}
                  placeholder="https://example.com/logo.png"
                  icon="🖼️"
                />
              </div>
            </SettingSection>

            {/* Business Preview */}
            <SettingSection
              title="Business Card Preview"
              description="How your business information will appear to customers"
              icon="👀"
            >
              <div className="business-preview">
                <div className="preview-card">
                  <div className="preview-header">
                    <h3 className="preview-company-name">{settings.company.name}</h3>
                    <p className="preview-tagline">{settings.company.tagline}</p>
                  </div>
                  <div className="preview-contact">
                    <p className="preview-phone">📞 {settings.company.phone}</p>
                    <p className="preview-email">✉️ {settings.company.email}</p>
                    <p className="preview-address">📍 {settings.company.address}</p>
                    <p className="preview-hours">🕒 {settings.company.hours}</p>
                  </div>
                </div>
              </div>
            </SettingSection>
          </div>
        </GridSection>
      )}
    </AdminPageWrapper>
  );
}

const BusinessPage = () => {
  return (
    <ToastProvider>
      <BusinessPageContent />
    </ToastProvider>
  );
};

export default withAuth(BusinessPage);
