'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Container, 
  Text, 
  Stack, 
  Box,
  Badge,
  ActionButtonGroup,
  LoadingSpinner,
  GridSection
} from '@/ui';
import { driverProfileService, DriverProfile } from '@/lib/services/driver-profile-service';

// Styled component for profile image container
const ProfileImageContainer = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-secondary);
  border-radius: 50%;
  overflow: hidden;
`;

// Styled component for profile image
const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Trust indicator component
const TrustIndicator = ({ icon, label, verified }: { icon: string; label: string; verified: boolean }) => (
  <Stack direction="horizontal" spacing="xs" align="center">
    <Text variant="small" color={verified ? 'success' : 'muted'}>
      {verified ? '✅' : '⏳'} {icon}
    </Text>
    <Text variant="small" color={verified ? 'success' : 'muted'}>
      {label}
    </Text>
  </Stack>
);

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const driverProfile = await driverProfileService.getDriverProfile();
        setProfile(driverProfile);
      } catch (err) {
        setError('Failed to load driver profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <LoadingSpinner text="Loading driver profile..." />
        </Stack>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <Text variant="body" color="error">
            {error || 'Unable to load driver profile'}
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

  const isInsuranceValid = new Date() < profile.credentials.insuranceExpiry;
  const isLicenseValid = new Date() < profile.credentials.licenseExpiry;
  const isVehicleInspected = new Date() < profile.vehicle.maintenanceHistory.nextService;

  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="xl">
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="lead" size="xl" weight="bold">
            Driver Profile
          </Text>
          <Text variant="body" color="muted" align="center">
            Professional driver information and credentials
          </Text>
        </Stack>

        <Box variant="outlined" padding="lg" rounded="lg">
          <Stack direction="vertical" spacing="lg">
            {/* Driver Basic Info */}
            <Stack direction="horizontal" spacing="md" align="center">
              <ProfileImageContainer>
                {profile.photo ? (
                  <ProfileImage 
                    src={profile.photo} 
                    alt={`${profile.name}`}
                  />
                ) : (
                  <Text variant="body" size="xl">👤</Text>
                )}
              </ProfileImageContainer>
              
              <Stack direction="vertical" spacing="xs">
                <Text variant="lead" size="lg" weight="bold">
                  {profile.name}
                </Text>
                <Stack direction="horizontal" spacing="sm" align="center">
                  <Badge variant={profile.status === 'available' ? 'success' : 'warning'}>
                    {profile.status}
                  </Badge>
                  <Text variant="small">
                    ⭐ {profile.rating} ({profile.totalRides} rides)
                  </Text>
                </Stack>
                <Text variant="small" color="muted">
                  {profile.yearsOfService} years of service • {profile.specialties.join(', ')}
                </Text>
              </Stack>
            </Stack>

            {/* Trust Indicators */}
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Safety & Trust Indicators
              </Text>
              <GridSection columns={2} gap="md">
                <TrustIndicator 
                  icon="🚗" 
                  label="Background Check" 
                  verified={profile.credentials.backgroundCheckStatus === 'verified'} 
                />
                <TrustIndicator 
                  icon="📋" 
                  label="License Valid" 
                  verified={isLicenseValid} 
                />
                <TrustIndicator 
                  icon="🛡️" 
                  label="Insurance Active" 
                  verified={isInsuranceValid} 
                />
                <TrustIndicator 
                  icon="🔧" 
                  label="Vehicle Inspected" 
                  verified={isVehicleInspected} 
                />
              </GridSection>
            </Stack>

            {/* Contact Information */}
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Contact Information
              </Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">📞 {profile.phone}</Text>
                <Text variant="small">📧 {profile.email}</Text>
                <Text variant="small">🚨 Emergency: {profile.emergencyContact.name} ({profile.emergencyContact.phone})</Text>
              </Stack>
            </Stack>

            {/* Vehicle Information */}
            <Stack direction="vertical" spacing="md">
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
                <Text variant="small">
                  🔧 Last service: {profile.vehicle.maintenanceHistory.lastService.toLocaleDateString()}
                </Text>
                <Text variant="small">
                  ⚡ Features: {profile.vehicle.features.join(', ')}
                </Text>
              </Stack>
            </Stack>

            {/* Credentials */}
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Professional Credentials
              </Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">🆔 License: {profile.credentials.licenseNumber}</Text>
                <Text variant="small">🛡️ Insurance: {profile.credentials.insuranceProvider} ({profile.credentials.insurancePolicyNumber})</Text>
                <Text variant="small">📅 Background Check: {profile.credentials.backgroundCheckDate.toLocaleDateString()}</Text>
                <Text variant="small">🗣️ Languages: {profile.languages.join(', ')}</Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>

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
            onClick: () => window.open(`tel:${profile.emergencyContact.phone}`),
            variant: 'outline',
            icon: '🚨'
          }
        ]} />
      </Stack>
    </Container>
  );
} 