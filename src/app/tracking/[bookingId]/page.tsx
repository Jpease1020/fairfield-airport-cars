'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { realTimeTrackingService, TrackingData } from '@/lib/services/real-time-tracking-service';
import { driverProfileService } from '@/lib/services/driver-profile-service';

// Status indicator component
const StatusIndicator = ({ status, message }: { status: string; message: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'info';
      case 'driver-assigned': return 'warning';
      case 'en-route': return 'primary';
      case 'arrived': return 'success';
      case 'completed': return 'success';
      default: return 'muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'driver-assigned': return '👤';
      case 'en-route': return '🚗';
      case 'arrived': return '📍';
      case 'completed': return '🎉';
      default: return '⏳';
    }
  };

  return (
    <Stack direction="horizontal" spacing="sm" align="center">
      <Badge variant={getStatusColor(status) as any}>
        {getStatusIcon(status)} {status.replace('-', ' ').toUpperCase()}
      </Badge>
      <Text variant="small" color="muted">
        {message}
      </Text>
    </Stack>
  );
};

// ETA display component
const ETADisplay = ({ eta, distance }: { eta?: Date; distance?: number }) => {
  if (!eta) return null;

  const now = new Date();
  const minutesUntilArrival = Math.round((eta.getTime() - now.getTime()) / (1000 * 60));

  return (
    <Stack direction="vertical" spacing="xs">
      <Text variant="lead" weight="bold" color="primary">
        {minutesUntilArrival > 0 ? `${minutesUntilArrival} minutes` : 'Arriving now'}
      </Text>
      {distance && (
        <Text variant="small" color="muted">
          📍 {distance.toFixed(1)} miles away
        </Text>
      )}
    </Stack>
  );
};

// Location display component
const LocationDisplay = ({ 
  pickup, 
  dropoff, 
  driverLocation 
}: { 
  pickup: any; 
  dropoff: any; 
  driverLocation?: any;
}) => (
  <Stack direction="vertical" spacing="md">
    <Stack direction="vertical" spacing="xs">
      <Text variant="small" color="muted">PICKUP</Text>
      <Text variant="body" weight="medium">
        📍 {pickup.address}
      </Text>
    </Stack>
    
    <Stack direction="vertical" spacing="xs">
      <Text variant="small" color="muted">DESTINATION</Text>
      <Text variant="body" weight="medium">
        🎯 {dropoff.address}
      </Text>
    </Stack>

    {driverLocation && (
      <Stack direction="vertical" spacing="xs">
        <Text variant="small" color="muted">DRIVER LOCATION</Text>
        <Text variant="body" weight="medium">
          🚗 Live location tracking active
        </Text>
        <Text variant="small" color="muted">
          Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
        </Text>
      </Stack>
    )}
  </Stack>
);

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID is required');
      setLoading(false);
      return;
    }

    // Subscribe to real-time tracking updates
    const unsubscribe = realTimeTrackingService.subscribeToTracking(
      bookingId,
      (data) => {
        setTrackingData(data);
        setLoading(false);
      }
    );

    // Load driver profile if driver is assigned
    const loadDriverProfile = async () => {
      try {
        const profile = await driverProfileService.getDriverProfile();
        setDriverProfile(profile);
      } catch (err) {
        console.error('Failed to load driver profile:', err);
      }
    };

    loadDriverProfile();

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  if (loading) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <LoadingSpinner text="Loading tracking information..." />
        </Stack>
      </Container>
    );
  }

  if (error || !trackingData) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <Text variant="body" color="error">
            {error || 'Unable to load tracking information'}
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

  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="xl">
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="lead" size="xl" weight="bold">
            Live Tracking
          </Text>
          <Text variant="body" color="muted" align="center">
            Real-time updates on your ride
          </Text>
        </Stack>

        <Box variant="outlined" padding="lg" rounded="lg">
          <Stack direction="vertical" spacing="lg">
            {/* Status and ETA */}
            <Stack direction="vertical" spacing="md">
              <StatusIndicator 
                status={trackingData.status} 
                message={trackingData.statusMessage}
              />
              
              {trackingData.estimatedArrival && (
                <ETADisplay 
                  eta={trackingData.estimatedArrival}
                  distance={trackingData.driverLocation ? 
                    realTimeTrackingService.calculateDistance(
                      trackingData.driverLocation,
                      trackingData.pickupLocation
                    ) : undefined
                  }
                />
              )}
            </Stack>

            {/* Driver Information */}
            {driverProfile && (
              <Stack direction="vertical" spacing="md">
                <Text variant="lead" weight="bold">
                  Your Driver
                </Text>
                <Stack direction="horizontal" spacing="md" align="center">
                  <Box 
                    variant="outlined" 
                    padding="sm" 
                    rounded="full"
                  >
                    <Text variant="body" size="lg">👤</Text>
                  </Box>
                  <Stack direction="vertical" spacing="xs">
                    <Text variant="body" weight="medium">
                      {driverProfile.name}
                    </Text>
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <Text variant="small">⭐ {driverProfile.rating}</Text>
                      <Text variant="small" color="muted">
                        {driverProfile.totalRides} rides
                      </Text>
                    </Stack>
                    <Text variant="small" color="muted">
                      {driverProfile.vehicle.year} {driverProfile.vehicle.make} {driverProfile.vehicle.model}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            )}

            {/* Location Information */}
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Trip Details
              </Text>
              <LocationDisplay 
                pickup={trackingData.pickupLocation}
                dropoff={trackingData.dropoffLocation}
                driverLocation={trackingData.driverLocation}
              />
            </Stack>

            {/* Last Updated */}
            <Stack direction="vertical" spacing="xs">
              <Text variant="small" color="muted">
                Last updated: {trackingData.lastUpdated.toLocaleTimeString()}
              </Text>
              <Text variant="small" color="muted">
                Tracking ID: {bookingId}
              </Text>
            </Stack>
          </Stack>
        </Box>

        <ActionButtonGroup buttons={[
          {
            id: 'call-driver',
            label: 'Call Driver',
            onClick: () => driverProfile && window.open(`tel:${driverProfile.phone}`),
            variant: 'primary',
            icon: '📞',
            disabled: !driverProfile
          },
          {
            id: 'text-driver',
            label: 'Text Driver',
            onClick: () => driverProfile && window.open(`sms:${driverProfile.phone}`),
            variant: 'outline',
            icon: '💬',
            disabled: !driverProfile
          },
          {
            id: 'refresh',
            label: 'Refresh',
            onClick: () => window.location.reload(),
            variant: 'outline',
            icon: '🔄'
          }
        ]} />
      </Stack>
    </Container>
  );
} 