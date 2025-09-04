'use client';

import { useEffect, useState } from 'react';
import { 
  Container,
  Stack,
  Text,
  Box,
  Badge,
  LoadingSpinner,
  Alert
} from '@/ui';


interface TrackingETADisplayProps {
  bookingId: string;
  estimatedArrival?: Date;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  cmsData: any;
}

interface ETAInfo {
  estimatedArrival: Date;
  distanceMiles: number;
  timeMinutes: number;
  trafficConditions: 'clear' | 'moderate' | 'heavy';
}

export function TrackingETADisplay({
  bookingId,
  estimatedArrival: _estimatedArrival,
  driverLocation,
  status,
  pickupLocation,
  dropoffLocation,
  cmsData
}: TrackingETADisplayProps) {
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate ETA when driver location changes
  useEffect(() => {
    if (!driverLocation || status !== 'in-progress') {
      setEtaInfo(null);
      return;
    }

    const calculateETA = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/tracking/eta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            driverLocation: {
              lat: driverLocation.lat,
              lng: driverLocation.lng,
            },
            destination: pickupLocation,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate ETA');
        }

        const data = await response.json();
        setEtaInfo(data);
      } catch (err) {
        console.error('Error calculating ETA:', err);
        setError('Failed to calculate arrival time');
      } finally {
        setLoading(false);
      }
    };

    calculateETA();
  }, [bookingId, driverLocation, status, pickupLocation]);

  // Format time remaining
  const formatTimeRemaining = (eta: Date): string => {
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    if (diffMinutes <= 0) {
      return 'Arriving now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  // Get traffic condition color
  const getTrafficColor = (condition: 'clear' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'clear': return 'success';
      case 'moderate': return 'warning';
      case 'heavy': return 'error';
      default: return 'default';
    }
  };

  // Get traffic condition text
  const getTrafficText = (condition: 'clear' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'clear': return 'Clear';
      case 'moderate': return 'Moderate';
      case 'heavy': return 'Heavy';
      default: return 'Unknown';
    }
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          text: 'Waiting for driver assignment',
          color: 'warning' as const,
          icon: '⏳',
        };
      case 'confirmed':
        return {
          text: 'Driver assigned',
          color: 'info' as const,
          icon: '✅',
        };
      case 'in-progress':
        return {
          text: 'Driver is on the way',
          color: 'success' as const,
          icon: '🚗',
        };
      case 'completed':
        return {
          text: 'Trip completed',
          color: 'success' as const,
          icon: '🏁',
        };
      case 'cancelled':
        return {
          text: 'Trip cancelled',
          color: 'error' as const,
          icon: '❌',
        };
      default:
        return {
          text: 'Unknown status',
          color: 'default' as const,
          icon: '❓',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Container>
      <Stack spacing="lg">
        {/* Status Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack direction="horizontal" align="center" spacing="sm">
            <Text size="lg" cmsId="tracking-status-icon">{statusInfo.icon}</Text>
            <Stack spacing="xs">
              <Text weight="bold" cmsId="tracking-status-text">{statusInfo.text}</Text>
              <Text variant="muted" size="sm" cmsId="tracking-booking-id">
                {cmsData?.['tracking-bookingId'] || `Booking #${bookingId.slice(-8)}`}
              </Text>
            </Stack>
          </Stack>
          <Badge variant={statusInfo.color}>
            {statusInfo.text}
          </Badge>
        </Stack>

        {/* ETA Information */}
        {status === 'in-progress' && (
          <Box variant="outlined" padding="lg">
            <Stack spacing="md">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text weight="bold" size="lg" cmsId="tracking-eta-title">{cmsData?.['tracking-etaTitle'] || 'Estimated Arrival'}</Text>
                {loading && <LoadingSpinner size="sm" />}
              </Stack>

              {error ? (
                <Alert variant="error">
                  <Text cmsId="tracking-error">{error}</Text>
                </Alert>
              ) : etaInfo ? (
                <Stack spacing="md">
                  {/* Time Remaining */}
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-time-remaining">{cmsData?.['tracking-timeRemaining'] || 'Time Remaining'}</Text>
                    <Text weight="bold" size="lg">
                      {formatTimeRemaining(etaInfo.estimatedArrival)}
                    </Text>
                  </Stack>

                  {/* Arrival Time */}
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-arrival-time">{cmsData?.['tracking-arrivalTime'] || 'Arrival Time'}</Text>
                    <Text weight="bold">
                      {etaInfo.estimatedArrival.toLocaleTimeString()}
                    </Text>
                  </Stack>

                  {/* Distance */}
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-distance">{cmsData?.['tracking-distance'] || 'Distance'}</Text>
                    <Text cmsId="ignore">{etaInfo.distanceMiles.toFixed(1)} miles</Text>
                  </Stack>

                  {/* Traffic Conditions */}
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-traffic">{cmsData?.['tracking-traffic'] || 'Traffic'}</Text>
                    <Badge variant={getTrafficColor(etaInfo.trafficConditions)}>
                      {getTrafficText(etaInfo.trafficConditions)}
                    </Badge>
                  </Stack>
                </Stack>
              ) : (
                <Text variant="muted" cmsId="tracking-calculating">{cmsData?.['tracking-calculating'] || 'Calculating arrival time...'}</Text>
              )}
            </Stack>
          </Box>
        )}

        {/* Route Information */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" cmsId="tracking-route-info">{cmsData?.['tracking-route-info'] || 'Route Information'}</Text>
            
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="tracking-from">{cmsData?.['tracking-from'] || 'From'}</Text>
                <Text weight="bold" cmsId="ignore">{pickupLocation}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="tracking-to">{cmsData?.['tracking-to'] || 'To'}</Text>
                <Text weight="bold" cmsId="ignore">{dropoffLocation}</Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Driver Information */}
        {driverLocation && (
          <Box variant="outlined" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" cmsId="tracking-driver-info">{cmsData?.['tracking-driverInfo'] || 'Driver Information'}</Text>
              
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text cmsId="tracking-last-updated">{cmsData?.['tracking-lastUpdated'] || 'Last Updated'}</Text>
                  <Text cmsId="ignore">{driverLocation.timestamp.toLocaleTimeString()}</Text>
                </Stack>
                
                {driverLocation.speed && (
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-speed">{cmsData?.['tracking-speed'] || 'Speed'}</Text>
                    <Text cmsId="ignore">{Math.round(driverLocation.speed)} mph</Text>
                  </Stack>
                )}
                
                {driverLocation.heading && (
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text cmsId="tracking-heading">{cmsData?.['tracking-heading'] || 'Heading'}</Text>
                    <Text cmsId="ignore">{Math.round(driverLocation.heading)}°</Text>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
} 