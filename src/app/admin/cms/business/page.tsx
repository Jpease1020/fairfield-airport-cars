'use client';

import { useState, useEffect, useMemo } from 'react';
import withAuth from '../../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { BusinessSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  SettingSection,
  SettingInput,
  ActionButtonGroup,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection
} from '@/components/ui';

function BusinessSettingsPageContent() {
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
      variant: 'secondary' as const,
      icon: '🔄'
    },
    { 
      label: saving ? 'Saving...' : 'Save Changes',
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: saving || !settings,
      icon: '💾'
    }
  ], [saving, settings, handleSave]);

  return (
    <AdminPageWrapper
      title="Business Settings"
      subtitle="Manage company information, contact details, and branding"
      actions={headerActions}
      loading={loading}
      error={error}
      errorTitle="Business Settings Error"
      loadingMessage="Loading business configuration..."
    >
      {/* Error Message */}
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {settings && (
        <GridSection variant="content" columns={1}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)'
          }}>
            {/* Company Information */}
            <SettingSection
              title="Company Information"
              description="Basic company details and contact information"
              icon="🏢"
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-md)'
              }}>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-md)'
              }}>
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
                  description="Link to your Instagram business profile"
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-md)'
              }}>
                <div style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--background-secondary)'
                }}>
                  <SettingInput
                    id="brand-primary-color"
                    label="Primary Color"
                    description="Main brand color for buttons and accents"
                    value={settings.branding.primaryColor}
                    onChange={(value) => handleInputChange('branding', 'primaryColor', value)}
                    placeholder="#1f2937"
                    icon="🎨"
                  />
                  <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Preview:</span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: settings.branding.primaryColor
                    }} />
                  </div>
                </div>
                
                <div style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--background-secondary)'
                }}>
                  <SettingInput
                    id="brand-secondary-color"
                    label="Secondary Color"
                    description="Secondary brand color for highlights"
                    value={settings.branding.secondaryColor}
                    onChange={(value) => handleInputChange('branding', 'secondaryColor', value)}
                    placeholder="#3b82f6"
                    icon="🎨"
                  />
                  <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Preview:</span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: settings.branding.secondaryColor
                    }} />
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
              <div style={{
                padding: 'var(--spacing-xl)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--background-secondary)',
                textAlign: 'center',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h2 style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-xs)',
                  color: settings.branding.primaryColor
                }}>
                  {settings.company.name}
                </h2>
                
                {settings.company.tagline && (
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-md)',
                    fontStyle: 'italic'
                  }}>
                    {settings.company.tagline}
                  </p>
                )}
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500' }}>📞 Phone:</span>
                    <span>{settings.company.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500' }}>✉️ Email:</span>
                    <span>{settings.company.email}</span>
                  </div>
                  {settings.company.hours && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>🕒 Hours:</span>
                      <span>{settings.company.hours}</span>
                    </div>
                  )}
                  {settings.company.address && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>📍 Address:</span>
                      <span>{settings.company.address}</span>
                    </div>
                  )}
                </div>

                {Object.values(settings.social).some(url => url) && (
                  <div style={{
                    marginTop: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-md)',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <p style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      Social Media:
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 'var(--spacing-xs)',
                      flexWrap: 'wrap'
                    }}>
                      {settings.social.facebook && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--background-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          fontSize: 'var(--font-size-xs)'
                        }}>
                          📘 Facebook
                        </span>
                      )}
                      {settings.social.instagram && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--background-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          fontSize: 'var(--font-size-xs)'
                        }}>
                          📷 Instagram
                        </span>
                      )}
                      {settings.social.twitter && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--background-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          fontSize: 'var(--font-size-xs)'
                        }}>
                          🐦 Twitter
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SettingSection>
          </div>
        </GridSection>
      )}
    </AdminPageWrapper>
  );
}

const BusinessSettingsPage = () => {
  return (
    <ToastProvider>
      <BusinessSettingsPageContent />
    </ToastProvider>
  );
};

export default withAuth(BusinessSettingsPage); 