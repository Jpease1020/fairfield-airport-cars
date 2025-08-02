'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  Badge, 
  ActionButtonGroup,
  LoadingSpinner,
  useToast,
  Stack,
  Box
} from '@/ui';
import { realTimeTrackingService, TrackingData } from '@/lib/services/real-time-tracking-service';

interface LiveTrackingCardProps {
  bookingId: string;
  showMap?: boolean;
  showETA?: boolean;
  showDriverInfo?: boolean;
}

export function LiveTrackingCard({
  bookingId,
  showMap = true,
  showETA = true,
  showDriverInfo = true
}: LiveTrackingCardProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = realTimeTrackingService.subscribeToTracking(bookingId, (data) => {
      setTrackingData(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  if (loading) {
    return (
      <Container variant="default" padding="md">
        <LoadingSpinner text="Loading tracking information..." />
      </Container>
    );
  }

  if (error || !trackingData) {
    return (
      <Container variant="default" padding="md">
        <Stack direction="vertical" spacing="md">
          <Text variant="body" color="error">
            Unable to load tracking information. Please try again.
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
      case 'confirmed': return 'info';
      case 'driver-assigned': return 'warning';
      case 'en-route': return 'success';
      case 'arrived': return 'success';
      case 'completed': return 'default';
      default: return 'default';
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

  const formatETA = (eta: Date) => {
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Arriving now';
    if (diffMins === 1) return '1 minute';
    return `${diffMins} minutes`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="lg">
        {/* Status Header */}
        <Stack direction="horizontal" spacing="md" align="center">
          <Badge variant={getStatusColor(trackingData.status)}>
            {getStatusIcon(trackingData.status)} {trackingData.status.replace('-', ' ')}
          </Badge>
          <Text variant="body" size="sm">
            Last updated: {formatTime(trackingData.lastUpdated)}
          </Text>
        </Stack>

        {/* Status Message */}
        <Text variant="lead" weight="medium">
          {trackingData.statusMessage}
        </Text>

        {/* Driver Information */}
        {showDriverInfo && trackingData.driverName && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Your Driver
            </Text>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Text variant="body">👤 {trackingData.driverName}</Text>
              <ActionButtonGroup buttons={[
                {
                  id: 'call-driver',
                  label: 'Call',
                  onClick: () => {
                    // This would need to be implemented with actual driver phone
                    addToast('info', 'Calling driver...');
                  },
                  variant: 'primary',
                  icon: '📞'
                },
                {
                  id: 'text-driver',
                  label: 'Text',
                  onClick: () => {
                    // This would need to be implemented with actual driver phone
                    addToast('info', 'Opening text message...');
                  },
                  variant: 'outline',
                  icon: '💬'
                }
              ]} />
            </Stack>
          </Stack>
        )}

        {/* ETA Information */}
        {showETA && trackingData.estimatedArrival && (
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              Estimated Arrival
            </Text>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text variant="body" size="lg" weight="bold">
                ⏰ {formatETA(trackingData.estimatedArrival)}
              </Text>
              <Text variant="small">
                ({formatTime(trackingData.estimatedArrival)})
              </Text>
            </Stack>
          </Stack>
        )}

        {/* Location Information */}
        <Stack direction="vertical" spacing="sm">
          <Text variant="lead" weight="bold">
            Trip Details
          </Text>
          <Stack direction="vertical" spacing="sm">
            <Stack direction="vertical" spacing="xs">
              <Text variant="small" color="muted">From:</Text>
              <Text variant="body">📍 {trackingData.pickupLocation.address}</Text>
            </Stack>
            <Stack direction="vertical" spacing="xs">
              <Text variant="small" color="muted">To:</Text>
              <Text variant="body">🎯 {trackingData.dropoffLocation.address}</Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Map Placeholder */}
        {showMap && (
          <Box variant="outlined" padding="lg" rounded="md">
            <Stack direction="vertical" spacing="md" align="center">
              <Text variant="body" size="lg">🗺️</Text>
              <Text variant="small" color="muted" align="center">
                Interactive map coming soon
              </Text>
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <ActionButtonGroup buttons={[
          {
            id: 'refresh',
            label: 'Refresh',
            onClick: () => window.location.reload(),
            variant: 'outline',
            icon: '🔄'
          },
          {
            id: 'contact-support',
            label: 'Need Help?',
            onClick: () => {
              addToast('info', 'Contact support at (203) 555-0123');
            },
            variant: 'secondary',
            icon: '❓'
          }
        ]} />
      </Stack>
    </Container>
  );
} 