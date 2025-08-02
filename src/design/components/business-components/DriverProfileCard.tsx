'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Container, 
  Text, 
  Badge, 
  ActionButtonGroup,
  LoadingSpinner,
  useToast,
  Stack,
} from '@/ui';
import { driverProfileService, DriverProfile } from '@/lib/services/driver-profile-service';

// Styled component for profile image container
const ProfileImageContainer = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-secondary);
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--color-border);
`;

// Styled component for profile image
const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface DriverProfileCardProps {
  showContactInfo?: boolean;
  showCredentials?: boolean;
  showVehicleInfo?: boolean;
  showTrustIndicators?: boolean;
  variant?: 'compact' | 'detailed';
}

export function DriverProfileCard({
  showContactInfo = true,
  showCredentials = true,
  showVehicleInfo = true,
  showTrustIndicators = true,
  variant = 'detailed'
}: DriverProfileCardProps) {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const driverProfile = await driverProfileService.getDriverProfile();
        setProfile(driverProfile);
      } catch (err) {
        setError('Failed to load driver profile');
        addToast('error', 'Failed to load driver information');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [addToast]);

  if (loading) {
    return (
      <Container variant="default" padding="md">
        <LoadingSpinner text="Loading driver information..." />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container variant="default" padding="md">
        <Stack direction="vertical" spacing="md">
          <Text variant="body" color="error">
            Unable to load driver information. Please try again.
          </Text>
          <ActionButtonGroup buttons={[
            {
              id: 'retry',
              label: 'Retry',
              onClick: () => window.location.reload(),
              variant: 'primary',
              icon: '🔄'
            }
          ]} />
        </Stack>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'busy': return '🚗';
      case 'offline': return '⏸️';
      default: return '❓';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="lg">
        {/* Driver Header */}
        <Stack direction="horizontal" spacing="md" align="center">
          <ProfileImageContainer>
            {profile.photo ? (
              <ProfileImage 
                src={profile.photo} 
                alt={`${profile.name}`}
              />
            ) : (
              <Text variant="body" size="lg">👤</Text>
            )}
          </ProfileImageContainer>
          
          <Stack direction="vertical" spacing="xs">
            <Text variant="lead" size="lg" weight="bold">
              {profile.name}
            </Text>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Badge variant={getStatusColor(profile.status)}>
                {getStatusIcon(profile.status)} {profile.status}
              </Badge>
              <Text variant="small">
                ⭐ {profile.rating} ({profile.totalRides} rides)
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Trust Indicators */}
        {showTrustIndicators && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Trust & Safety
            </Text>
            <Stack direction="horizontal" spacing="sm" wrap="wrap">
              <Badge variant="success">✅ Background Checked</Badge>
              <Badge variant="success">✅ Licensed Driver</Badge>
              <Badge variant="success">✅ Insured Vehicle</Badge>
              <Badge variant="success">✅ Vehicle Inspected</Badge>
              <Badge variant="info">{profile.yearsOfService} years experience</Badge>
            </Stack>
          </Stack>
        )}

        {/* Contact Information */}
        {showContactInfo && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Contact Information
            </Text>
            <Stack direction="vertical" spacing="xs">
              <Text variant="small">📞 {profile.phone}</Text>
              <Text variant="small">📧 {profile.email}</Text>
              {profile.emergencyContact && (
                <Text variant="small">
                  🚨 Emergency: {profile.emergencyContact.name} ({profile.emergencyContact.phone})
                </Text>
              )}
            </Stack>
          </Stack>
        )}

        {/* Vehicle Information */}
        {showVehicleInfo && variant === 'detailed' && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Vehicle Information
            </Text>
            <Stack direction="vertical" spacing="xs">
              <Text variant="small">
                🚗 {profile.vehicle.year} {profile.vehicle.make} {profile.vehicle.model}
              </Text>
              <Text variant="small">
                🎨 {profile.vehicle.color} • Plate: {profile.vehicle.licensePlate}
              </Text>
              <Text variant="small">
                👥 Capacity: {profile.vehicle.capacity} passengers
              </Text>
              {profile.vehicle.features.length > 0 && (
                <Stack direction="horizontal" spacing="sm" wrap="wrap">
                  {profile.vehicle.features.map((feature, index) => (
                    <Badge key={index} variant="info">{feature}</Badge>
                  ))}
                </Stack>
              )}
              <Text variant="small">
                🔧 Last service: {formatDate(profile.vehicle.maintenanceHistory.lastService)}
              </Text>
            </Stack>
          </Stack>
        )}

        {/* Credentials */}
        {showCredentials && variant === 'detailed' && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Credentials
            </Text>
            <Stack direction="vertical" spacing="xs">
              <Text variant="small">
                🪪 License: {profile.credentials.licenseNumber} (expires {formatDate(profile.credentials.licenseExpiry)})
              </Text>
              <Text variant="small">
                🛡️ Insurance: {profile.credentials.insuranceProvider} (expires {formatDate(profile.credentials.insuranceExpiry)})
              </Text>
              <Text variant="small">
                🔍 Background Check: {profile.credentials.backgroundCheckStatus} ({formatDate(profile.credentials.backgroundCheckDate)})
              </Text>
              <Text variant="small">
                🚗 Vehicle Inspection: {formatDate(profile.credentials.vehicleInspectionDate)}
              </Text>
            </Stack>
          </Stack>
        )}

        {/* Specialties */}
        {variant === 'detailed' && profile.specialties.length > 0 && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Specialties
            </Text>
            <Stack direction="horizontal" spacing="sm" wrap="wrap">
              {profile.specialties.map((specialty, index) => (
                <Badge key={index} variant="info">{specialty}</Badge>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Languages */}
        {variant === 'detailed' && profile.languages.length > 0 && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Languages
            </Text>
            <Stack direction="horizontal" spacing="sm" wrap="wrap">
              {profile.languages.map((language, index) => (
                <Badge key={index} variant="default">{language}</Badge>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Availability */}
        {variant === 'detailed' && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Availability
            </Text>
            <Text variant="small">
              🕐 {profile.availability.startTime} - {profile.availability.endTime} daily
            </Text>
          </Stack>
        )}

        {/* Action Buttons */}
        <ActionButtonGroup buttons={[
          {
            id: 'call-driver',
            label: 'Call Driver',
            onClick: () => window.open(`tel:${profile.phone}`),
            variant: 'primary',
            icon: '📞'
          },
          {
            id: 'text-driver',
            label: 'Text Driver',
            onClick: () => window.open(`sms:${profile.phone}`),
            variant: 'outline',
            icon: '💬'
          },
          {
            id: 'emergency',
            label: 'Emergency Contact',
            onClick: () => {
              if (profile.emergencyContact) {
                window.open(`tel:${profile.emergencyContact.phone}`);
              }
            },
            variant: 'secondary',
            icon: '🚨'
          }
        ]} />
      </Stack>
    </Container>
  );
} 