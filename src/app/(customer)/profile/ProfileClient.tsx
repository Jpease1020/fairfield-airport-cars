'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, getCustomerProfile, updateCustomerProfile } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/services/auth-service';
import { 
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  Alert,
  Input,
  Label,
  H1,
  ContentCard,
  GridSection
} from '@/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { getCMSField } from '../../../design/hooks/useCMSData';

interface ProfileClientProps {
  cmsData: any;
}

export default function ProfileClient({ cmsData }: ProfileClientProps) {
  const { mode } = useInteractionMode();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    defaultPickupLocation: '',
    defaultDropoffLocation: '',
    notifications: {
      email: true,
      sms: true
    }
  });

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadCustomerProfile(firebaseUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const loadCustomerProfile = async (uid: string) => {
    try {
      const customerProfile = await getCustomerProfile(uid);
      if (!customerProfile) {
        setError('Profile not found');
        return;
      }
      
      setProfile(customerProfile);
      
      // Initialize form data
      setFormData({
        name: customerProfile.name || '',
        email: customerProfile.email || '',
        phone: customerProfile.phone || '',
        defaultPickupLocation: customerProfile.preferences?.defaultPickupLocation || '',
        defaultDropoffLocation: customerProfile.preferences?.defaultDropoffLocation || '',
        notifications: customerProfile.preferences?.notifications || {
          email: true,
          sms: true
        }
      });
    } catch (error) {
      console.error('Error loading customer profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await updateCustomerProfile(user.uid, {
        name: formData.name,
        phone: formData.phone,
        preferences: {
          defaultPickupLocation: formData.defaultPickupLocation,
          defaultDropoffLocation: formData.defaultDropoffLocation,
          notifications: formData.notifications
        }
      });
      
      setSuccess(getCMSField(cmsData, 'messages.profileUpdated', 'Profile updated successfully!'));
      setIsEditing(false);
      
      // Reload profile to get updated data
      await loadCustomerProfile(user.uid);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(getCMSField(cmsData, 'messages.updateFailed', 'Failed to update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        defaultPickupLocation: profile.preferences?.defaultPickupLocation || '',
        defaultDropoffLocation: profile.preferences?.defaultDropoffLocation || '',
        notifications: profile.preferences?.notifications || {
          email: true,
          sms: true
        }
      });
    }
  };

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="full" padding="xl">
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading profile...</Text>
        </Stack>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container maxWidth="full" padding="xl">
        <Stack spacing="xl" align="center">
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
          <Button onClick={() => router.push('/login')}>
            Back to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl" align="center">
        {/* Header */}
        <Stack spacing="md" align="center">
          <H1 
            align="center" 
            data-cms-id="profile-title"
            mode={mode}
          >
            {getCMSField(cmsData, 'profile-title', 'Profile Settings')}
          </H1>
          <Text 
            variant="lead" 
            align="center" 
            data-cms-id="profile-subtitle"
            mode={mode}
          >
            {getCMSField(cmsData, 'profile-subtitle', 'Manage your account information and preferences')}
          </Text>
        </Stack>

        {success && (
          <Alert variant="success">
            <Text>{success}</Text>
          </Alert>
        )}

        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Profile Form */}
        <ContentCard 
          padding="xl"
          content={
            <Stack spacing="xl">
              {/* Personal Information */}
              <GridSection
                title={getCMSField(cmsData, 'personal-info-title', 'Personal Information')}
                data-cms-id="personal-info-title"
              >
                <Stack spacing="md">
                  <div data-cms-id="personal-info-name">
                    <Label htmlFor="name">
                      {getCMSField(cmsData, 'personalInfo.name', 'Full Name')}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div data-cms-id="personal-info-email">
                    <Label htmlFor="email">
                      {getCMSField(cmsData, 'personalInfo.email', 'Email Address')}
                    </Label>
                    <Input
                      id="email"
                      value={formData.email}
                      disabled={true} // Email cannot be changed
                      placeholder="Your email address"
                    />
                    <Text variant="small" color="muted">
                      Email address cannot be changed. Contact support if needed.
                    </Text>
                  </div>
                  
                  <div data-cms-id="locations-title">
                    <Label htmlFor="phone">
                      {getCMSField(cmsData, 'personalInfo.phone', 'Phone Number')}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </Stack>
              </GridSection>

              {/* Default Locations */}
              <GridSection
                data-cms-id="locations-title"
                title={getCMSField(cmsData, 'locations.title', 'Default Locations')}
              >
                <Stack spacing="md">
                  <div data-cms-id="locations-pickup">
                    <Label htmlFor="pickup">
                      {getCMSField(cmsData, 'locations.pickup', 'Default Pickup Location')}
                    </Label>
                    <Input
                      id="pickup"
                      value={formData.defaultPickupLocation}
                      onChange={(e) => handleInputChange('defaultPickupLocation', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your default pickup location"
                    />
                  </div>
                  
                  <div data-cms-id="locations-dropoff">
                    <Label htmlFor="dropoff">
                      {getCMSField(cmsData, 'locations.dropoff', 'Default Dropoff Location')}
                    </Label>
                    <Input
                      id="dropoff"
                      value={formData.defaultDropoffLocation}
                      onChange={(e) => handleInputChange('defaultDropoffLocation', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your default dropoff location"
                    />
                  </div>
                </Stack>
              </GridSection>

              {/* Notification Preferences */}
              <GridSection
                data-cms-id="notifications-title"
                title={getCMSField(cmsData, 'notifications.title', 'Notification Preferences')}
              >
                <Stack spacing="md">
                  <div data-cms-id="notifications-email">
                    <Label>
                      <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                        disabled={!isEditing}
                      />
                      {' '}
                      {getCMSField(cmsData, 'notifications.email', 'Email Notifications')}
                    </Label>
                  </div>
                  
                  <div data-cms-id="notifications-sms">
                    <Label>
                      <input
                        type="checkbox"
                        checked={formData.notifications.sms}
                        onChange={(e) => handleInputChange('notifications-sms', e.target.checked)}
                        disabled={!isEditing}
                      />
                      {' '}
                      {getCMSField(cmsData, 'notifications-sms', 'SMS Notifications')}
                    </Label>
                  </div>
                </Stack>
              </GridSection>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'vertical', md: 'horizontal' }} spacing="md" justify="center">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                    data-cms-id="profile-buttons-edit"
                  >
                    {getCMSField(cmsData, 'profile-buttons-edit', 'Edit Profile')}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      disabled={saving}
                      data-cms-id="profile-buttons-save"
                    >
                      {getCMSField(cmsData, saving ? 'buttons.saving' : 'buttons.save', saving ? 'Saving...' : 'Save Changes')}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      data-cms-id="profile-buttons-cancel"
                    >
                      {getCMSField(cmsData, 'buttons.cancel', 'Cancel')}
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          }
        />
      </Stack>
    </Container>
  );
}

