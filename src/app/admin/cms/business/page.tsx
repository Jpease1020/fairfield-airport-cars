'use client';

import React, { useState, useEffect, useCallback } from 'react';
import withAuth from '../../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { BusinessSettings } from '@/types/cms';
import { 
  AdminPageWrapper,
  ToastProvider,
  useToast,
  GridSection,
  Container,
  Span,
  Text,
} from '@/ui';
import { Stack } from '@/ui';
import { EditableText } from '@/ui';
import { ContentBox } from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';

function BusinessPageContent() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessSettings = useCallback(async () => {
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
  }, [addToast]);

  useEffect(() => {
    loadBusinessSettings();
  }, [loadBusinessSettings]);

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

  // Remove the unused headerActions variable
  // const headerActions = useMemo(() => [
  //   { 
  //     label: 'Back to CMS',
  //     onClick: (): void => { window.location.href = '/admin/cms'; },
  //     variant: 'outline' as const,
  //     icon: '🔙'
  //   },
  //   { 
  //     label: 'Reload Settings',
  //     onClick: loadBusinessSettings,
  //     variant: 'outline' as const,
  //     disabled: loading,
  //     icon: '🔄'
  //   },
  //   { 
  //     label: 'Save Changes',
  //     onClick: handleSave,
  //     variant: 'primary' as const,
  //     disabled: !settings || saving,
  //     icon: '💾'
  //   }
  // ], [settings, loading, saving, loadBusinessSettings, handleSave]);

  if (loading) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
      >
        <Container>
          <EditableText field="admin.cms.business.loading" defaultValue="Loading...">
            Loading...
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
      >
        <Container>
          <EditableText field="admin.cms.business.error" defaultValue="Error loading settings">
            Error loading settings
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (!settings) {
    return (
      <AdminPageWrapper
        title="Business Settings"
        subtitle="Configure your company information and branding"
      >
        <Container>
          <EditableText field="admin.cms.business.noSettings" defaultValue="No settings found">
            No settings found
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Business Settings"
      subtitle="Configure your company information and branding"
    >

      {settings && (
        <GridSection variant="content" columns={1}>
          <Container>
            {/* Company Information */}
            <ContentBox variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="bold">🏢 Company Information</Text>
                <Text>Basic company details and contact information</Text>
                
                <Stack spacing="md">
                  <Container>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={settings.company.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'name', e.target.value)}
                      placeholder="Your Company Name"
                    />
                    <Text size="sm" color="secondary">Your official business name</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="company-tagline">Tagline</Label>
                    <Input
                      id="company-tagline"
                      value={settings.company.tagline || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'tagline', e.target.value)}
                      placeholder="Your company tagline"
                    />
                    <Text size="sm" color="secondary">A brief description of your business</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="company-phone">Phone Number</Label>
                    <Input
                      id="company-phone"
                      value={settings.company.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                    <Text size="sm" color="secondary">Primary contact phone number</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="company-email">Email Address</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={settings.company.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                    <Text size="sm" color="secondary">Primary contact email address</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="company-address">Address</Label>
                    <Input
                      id="company-address"
                      value={settings.company.address || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                    <Text size="sm" color="secondary">Business physical address</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="company-hours">Business Hours</Label>
                    <Input
                      id="company-hours"
                      value={settings.company.hours || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', 'hours', e.target.value)}
                      placeholder="Mon-Fri 9am-5pm"
                    />
                    <Text size="sm" color="secondary">Operating hours for customers</Text>
                  </Container>
                </Stack>
              </Stack>
            </ContentBox>

            {/* Social Media */}
            <ContentBox variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="bold">📱 Social Media</Text>
                <Text>Links to your social media profiles</Text>
                
                <Stack spacing="md">
                  <EditableText field="admin.cms.business.social" defaultValue="Social Media">
                    Social Media
                  </EditableText>
                  
                  <EditableText field="admin.cms.business.socialDesc" defaultValue="Your social media profiles">
                    Your social media profiles
                  </EditableText>
                  
                  <Container>
                    <Label htmlFor="social-facebook">Facebook URL</Label>
                    <Input
                      id="social-facebook"
                      value={settings.social.facebook || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSocialChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                    <Text size="sm" color="secondary">Link to your Facebook business page</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="social-instagram">Instagram URL</Label>
                    <Input
                      id="social-instagram"
                      value={settings.social.instagram || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSocialChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                    />
                    <Text size="sm" color="secondary">Link to your Instagram business account</Text>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="social-twitter">Twitter URL</Label>
                    <Input
                      id="social-twitter"
                      value={settings.social.twitter || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSocialChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                    />
                    <Text size="sm" color="secondary">Link to your Twitter business account</Text>
                  </Container>
                </Stack>
              </Stack>
            </ContentBox>

            {/* Branding */}
            <ContentBox variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="bold">🎨 Branding</Text>
                <Text>Visual identity and brand colors</Text>
                
                <Stack spacing="md">
                  <Container>
                    <Label htmlFor="brand-primary-color">Primary Color</Label>
                    <Input
                      id="brand-primary-color"
                      value={settings.branding.primaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('branding', 'primaryColor', e.target.value)}
                      placeholder="var(--primary-color)"
                    />
                    <Text size="sm" color="secondary">Main brand color for buttons and accents</Text>
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <Span>
                        <EditableText field="admin.cms.business.preview" defaultValue="Preview:">
                          Preview:
                        </EditableText>
                      </Span>
                      <Span>
                        <EditableText field="admin.cms.business.colorPreview" defaultValue="Color preview">
                          Color preview
                        </EditableText>
                      </Span>
                    </Stack>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="brand-secondary-color">Secondary Color</Label>
                    <Input
                      id="brand-secondary-color"
                      value={settings.branding.secondaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('branding', 'secondaryColor', e.target.value)}
                      placeholder="var(--secondary-color)"
                    />
                    <Text size="sm" color="secondary">Secondary brand color for highlights</Text>
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <Span>
                        <EditableText field="admin.cms.business.preview" defaultValue="Preview:">
                          Preview:
                        </EditableText>
                      </Span>
                      <Span>
                        <EditableText field="admin.cms.business.colorPreview" defaultValue="Color preview">
                          Color preview
                        </EditableText>
                      </Span>
                    </Stack>
                  </Container>
                  
                  <Container>
                    <Label htmlFor="brand-logo-url">Logo URL</Label>
                    <Input
                      id="brand-logo-url"
                      value={settings.branding.logoUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('branding', 'logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <Text size="sm" color="secondary">Direct link to your company logo image</Text>
                  </Container>
                </Stack>
              </Stack>
            </ContentBox>

            {/* Business Preview */}
            <ContentBox variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="bold">👀 Business ContentBox Preview</Text>
                <Text>How your business information will appear to customers</Text>
                
                <Stack spacing="lg">
                  <EditableText field="admin.cms.business.companyName" defaultValue="Company Name">
                    Company Name
                  </EditableText>
                  <EditableText field="admin.cms.business.companyNameDesc" defaultValue="Your business name as it appears to customers">
                    Your business name as it appears to customers
                  </EditableText>
                  <EditableText field="admin.cms.business.phone" defaultValue="Phone Number">
                    Phone Number
                  </EditableText>
                  <EditableText field="admin.cms.business.email" defaultValue="Email Address">
                    Email Address
                  </EditableText>
                  <EditableText field="admin.cms.business.address" defaultValue="Address">
                    Address
                  </EditableText>
                  <EditableText field="admin.cms.business.hours" defaultValue="Business Hours">
                    Business Hours
                  </EditableText>
                </Stack>
              </Stack>
            </ContentBox>
          </Container>
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
