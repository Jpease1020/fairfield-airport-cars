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
  EditableText,
  Alert,
  Input,
  Label,
  H1,
  ContentCard
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';

function CustomerProfilePage() {
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
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (profile) {
        await updateCustomerProfile(profile.uid, {
          name: formData.name,
          phone: formData.phone,
          preferences: {
            defaultPickupLocation: formData.defaultPickupLocation,
            defaultDropoffLocation: formData.defaultDropoffLocation,
            notifications: formData.notifications
          }
        });
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Reload profile to get updated data
        await loadCustomerProfile(profile.uid);
      }
    } catch (error) {
      setError(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    
    // Reset form data to original values
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

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing profile...</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading your profile...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Please log in to view your profile.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <AdminPageWrapper
      title="My Profile"
      subtitle="Manage your account information and preferences"
    >
      <Stack spacing="xl">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1>
              <EditableText field="customer.profile.title" defaultValue="My Profile">
                My Profile
              </EditableText>
            </H1>
            <Text variant="muted">
              <EditableText field="customer.profile.subtitle" defaultValue="Manage your account information and preferences">
                Manage your account information and preferences
              </EditableText>
            </Text>
          </Stack>
          {!isEditing && (
            <Button onClick={handleEdit} variant="primary">
              <EditableText field="customer.profile.edit_profile" defaultValue="Edit Profile">
                Edit Profile
              </EditableText>
            </Button>
          )}
        </Stack>

        {/* Success/Error Messages */}
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

        {/* Profile Information */}
        <ContentCard
          title="Personal Information"
          content={
            <Stack spacing="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Label htmlFor="name">
                    <EditableText field="customer.profile.name_label" defaultValue="Full Name">
                      Full Name
                    </EditableText>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <Text>{profile.name}</Text>
                  )}
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="email">
                    <EditableText field="customer.profile.email_label" defaultValue="Email Address">
                      Email Address
                    </EditableText>
                  </Label>
                  <Text>{profile.email}</Text>
                  <Text variant="muted" size="sm">
                    <EditableText field="customer.profile.email_note" defaultValue="Email cannot be changed">
                      Email cannot be changed
                    </EditableText>
                  </Text>
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="phone">
                    <EditableText field="customer.profile.phone_label" defaultValue="Phone Number">
                      Phone Number
                    </EditableText>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  ) : (
                    <Text>{profile.phone}</Text>
                  )}
                </Stack>
              </Stack>

              {isEditing && (
                <Stack direction="horizontal" spacing="sm">
                  <Button onClick={handleSave} variant="primary" disabled={saving}>
                    <EditableText field="customer.profile.save_button" defaultValue={saving ? 'Saving...' : 'Save Changes'}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </EditableText>
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <EditableText field="customer.profile.cancel_button" defaultValue="Cancel">
                      Cancel
                    </EditableText>
                  </Button>
                </Stack>
              )}
            </Stack>
          }
          variant="elevated"
        />

        {/* Preferences */}
        <ContentCard
          title="Booking Preferences"
          content={
            <Stack spacing="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Label htmlFor="defaultPickupLocation">
                    <EditableText field="customer.profile.default_pickup_label" defaultValue="Default Pickup Location">
                      Default Pickup Location
                    </EditableText>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="defaultPickupLocation"
                      type="text"
                      value={formData.defaultPickupLocation}
                      onChange={(e) => handleInputChange('defaultPickupLocation', e.target.value)}
                      placeholder="e.g., Fairfield Airport"
                    />
                                     ) : (
                     <Text>{profile.preferences?.defaultPickupLocation || 'Not set'}</Text>
                   )}
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="defaultDropoffLocation">
                    <EditableText field="customer.profile.default_dropoff_label" defaultValue="Default Dropoff Location">
                      Default Dropoff Location
                    </EditableText>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="defaultDropoffLocation"
                      type="text"
                      value={formData.defaultDropoffLocation}
                      onChange={(e) => handleInputChange('defaultDropoffLocation', e.target.value)}
                      placeholder="e.g., Downtown Fairfield"
                    />
                                     ) : (
                     <Text>{profile.preferences?.defaultDropoffLocation || 'Not set'}</Text>
                   )}
                </Stack>
              </Stack>
            </Stack>
          }
          variant="elevated"
        />

        {/* Notification Preferences */}
        <ContentCard
          title="Notification Preferences"
          content={
            <Stack spacing="lg">
              <Stack spacing="md">
                <Stack spacing="sm">
                  <Label>
                    <EditableText field="customer.profile.notifications_label" defaultValue="Notification Settings">
                      Notification Settings
                    </EditableText>
                  </Label>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={formData.notifications.email}
                        onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="emailNotifications">
                        <EditableText field="customer.profile.email_notifications" defaultValue="Email Notifications">
                          Email Notifications
                        </EditableText>
                      </Label>
                    </Stack>
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={formData.notifications.sms}
                        onChange={(e) => handleInputChange('notifications.sms', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="smsNotifications">
                        <EditableText field="customer.profile.sms_notifications" defaultValue="SMS Notifications">
                          SMS Notifications
                        </EditableText>
                      </Label>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          }
          variant="elevated"
        />

        {/* Account Information */}
        <ContentCard
          title="Account Information"
          content={
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</Text>
                <Text><strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleDateString()}</Text>
                <Text><strong>Total Bookings:</strong> {profile.totalBookings || 0}</Text>
                <Text><strong>Total Spent:</strong> ${(profile.totalSpent || 0).toFixed(2)}</Text>
              </Stack>
            </Stack>
          }
          variant="elevated"
        />
      </Stack>
    </AdminPageWrapper>
  );
}

export default CustomerProfilePage; 