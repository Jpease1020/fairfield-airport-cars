'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container } from '@/design/layout/containers/Container';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';
import { Card } from '@/design/layout/content/Card';
import { Badge } from '@/design/components/base-components/Badge';
import { Button } from '@/design/components/base-components/Button';
import { StarRating } from '@/design/components/base-components/StarRating';
import { LoadingSpinner } from '@/design/components/base-components/notifications/LoadingSpinner';
import { ActionButtonGroup } from '@/design/components/base-components/ActionButtonGroup';

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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Driver profile functionality temporarily disabled - service was deleted during cleanup
        const driverProfile = null;
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
      case 'available': return '🟢';
      case 'busy': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, string> = {
      'wheelchair': '♿',
      'child_seat': '👶',
      'pet_friendly': '🐕',
      'luxury': '⭐',
      'electric': '⚡',
      'hybrid': '🌱'
    };
    return icons[feature] || '✓';
  };

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      'wheelchair': 'Wheelchair Accessible',
      'child_seat': 'Child Seat Available',
      'pet_friendly': 'Pet Friendly',
      'luxury': 'Luxury Vehicle',
      'electric': 'Electric Vehicle',
      'hybrid': 'Hybrid Vehicle'
    };
    return labels[feature] || feature;
  };

  return (
    <Container variant="default" padding="md">
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" spacing="lg">
          {/* Header */}
          <Stack direction="horizontal" spacing="md" align="center">
            <ProfileImageContainer>
              {profile.profileImage ? (
                <ProfileImage src={profile.profileImage} alt={profile.name} />
              ) : (
                <Text size="xl">👨‍💼</Text>
              )}
            </ProfileImageContainer>
            
            <Stack direction="vertical" spacing="xs">
              <Text variant="lead" weight="bold">{profile.name}</Text>
              <Stack direction="horizontal" spacing="sm" align="center">
                <Badge variant={getStatusColor(profile.status)}>
                  {getStatusIcon(profile.status)} {profile.status}
                </Badge>
                {profile.rating && (
                  <StarRating rating={profile.rating} size="sm" />
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* Contact Info */}
          {showContactInfo && (
            <Stack direction="vertical" spacing="sm">
              <Text variant="small" weight="semibold">Contact Information</Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">📧 {profile.email}</Text>
                <Text variant="small">📱 {profile.phone}</Text>
              </Stack>
            </Stack>
          )}

          {/* Credentials */}
          {showCredentials && (
            <Stack direction="vertical" spacing="sm">
              <Text variant="small" weight="semibold">Credentials</Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">🆔 License: {profile.licenseNumber}</Text>
                <Text variant="small">📅 Expires: {formatDate(profile.licenseExpiry)}</Text>
                <Text variant="small">🛡️ Insurance: {profile.insuranceProvider}</Text>
              </Stack>
            </Stack>
          )}

          {/* Vehicle Info */}
          {showVehicleInfo && (
            <Stack direction="vertical" spacing="sm">
              <Text variant="small" weight="semibold">Vehicle Information</Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">
                  🚗 {profile.vehicleInfo.year} {profile.vehicleInfo.make} {profile.vehicleInfo.model}
                </Text>
                <Text variant="small">🎨 Color: {profile.vehicleInfo.color}</Text>
                <Text variant="small">🔢 Plate: {profile.vehicleInfo.licensePlate}</Text>
                <Text variant="small">👥 Capacity: {profile.vehicleInfo.capacity} passengers</Text>
              </Stack>
            </Stack>
          )}

          {/* Trust Indicators */}
          {showTrustIndicators && (
            <Stack direction="vertical" spacing="sm">
              <Text variant="small" weight="semibold">Trust Indicators</Text>
              <Stack direction="vertical" spacing="xs">
                <Text variant="small">⭐ Rating: {profile.rating}/5.0 ({profile.totalReviews} reviews)</Text>
                <Text variant="small">🚗 Rides: {profile.totalRides} completed</Text>
                <Text variant="small">📅 Member since: {formatDate(profile.joinedDate)}</Text>
                <Text variant="small">✅ Background check: Verified</Text>
              </Stack>
            </Stack>
          )}

          {/* Features */}
          {profile.features && profile.features.length > 0 && (
            <Stack direction="vertical" spacing="sm">
              <Text variant="small" weight="semibold">Features</Text>
              <Stack direction="horizontal" spacing="sm">
                {profile.features.map((feature: string) => (
                  <Badge key={feature} variant="default" size="sm">
                    {getFeatureIcon(feature)} {getFeatureLabel(feature)}
                  </Badge>
                ))}
              </Stack>
            </Stack>
          )}

          {/* Actions */}
          <Stack direction="horizontal" spacing="sm">
            <Button variant="primary" size="sm">
              📞 Contact Driver
            </Button>
            <Button variant="outline" size="sm">
              📍 Track Location
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
} 