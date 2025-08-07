'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container,
  Stack,
  Text,
  Box,
  Badge,
  LoadingSpinner,
  Alert
} from '@/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';
import { firebaseTrackingService, type ETACalculation } from '@/lib/services/firebase-tracking-service';

// Styled components for ETA display
const ETACard = styled.div<{ $trafficLevel: 'low' | 'medium' | 'high' }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${props => {
    switch (props.$trafficLevel) {
      case 'low': return colors.success[200];
      case 'medium': return colors.warning[200];
      case 'high': return colors.danger[200];
      default: return colors.gray[200];
    }
  }};
  background: ${props => {
    switch (props.$trafficLevel) {
      case 'low': return colors.success[50];
      case 'medium': return colors.warning[50];
      case 'high': return colors.danger[50];
      default: return colors.gray[50];
    }
  }};
`;

const ConfidenceBar = styled.div<{ $confidence: number }>`
  width: 100%;
  height: 8px;
  background: ${colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$confidence * 100}%;
    background: ${props => {
      if (props.$confidence >= 0.8) return colors.success[500];
      if (props.$confidence >= 0.6) return colors.warning[500];
      return colors.danger[500];
    }};
    transition: width 0.3s ease;
  }
`;

const TrafficIndicator = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => {
      switch (props.$level) {
        case 'low': return colors.success[500];
        case 'medium': return colors.warning[500];
        case 'high': return colors.danger[500];
        default: return colors.gray[500];
      }
    }};
  }
`;

interface TrafficETAProps {
  bookingId: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading: number;
    speed: number;
  };
  onETAUpdate?: (eta: ETACalculation) => void;
}

export function TrafficETA({
  bookingId,
  pickupLocation,
  dropoffLocation,
  currentLocation,
  onETAUpdate
}: TrafficETAProps) {
  const [etaCalculation, setETACalculation] = useState<ETACalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load initial ETA
  useEffect(() => {
    loadETA();
  }, [bookingId, pickupLocation, dropoffLocation]);

  // Set up real-time ETA updates
  useEffect(() => {
    firebaseTrackingService.onETAUpdate(bookingId, (eta) => {
      setETACalculation(eta);
      setLastUpdate(new Date());
      if (onETAUpdate) {
        onETAUpdate(eta);
      }
    });

    return () => {
      firebaseTrackingService.stopTracking(bookingId);
    };
  }, [bookingId, onETAUpdate]);

  const loadETA = async () => {
    try {
      setLoading(true);
      setError(null);

      const eta = await firebaseTrackingService.calculateAdvancedETA(
        bookingId,
        pickupLocation,
        dropoffLocation,
        currentLocation
      );

      setETACalculation(eta);
      setLastUpdate(new Date());
      
      if (onETAUpdate) {
        onETAUpdate(eta);
      }
    } catch (err) {
      console.error('Error loading ETA:', err);
      setError('Failed to calculate ETA');
    } finally {
      setLoading(false);
    }
  };

  const getTrafficIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getTrafficText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'Light Traffic';
      case 'medium': return 'Moderate Traffic';
      case 'high': return 'Heavy Traffic';
      default: return 'Unknown';
    }
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.6) return 'Fair';
    return 'Low';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="md" align="center">
          <LoadingSpinner size="md" />
          <Text variant="muted">Calculating ETA...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  if (!etaCalculation) {
    return (
      <Container>
        <Alert variant="warning">
          <Text>ETA not available</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Main ETA Display */}
        <ETACard $trafficLevel={etaCalculation.trafficConditions}>
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold" size="lg">Estimated Arrival</Text>
              <Badge variant="success">
                {formatTime(etaCalculation.estimatedArrival)}
              </Badge>
            </Stack>

            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Travel Time</Text>
                <Text weight="bold">{formatDuration(etaCalculation.duration)}</Text>
              </Stack>

              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Distance</Text>
                <Text weight="bold">{etaCalculation.distance.toFixed(1)} miles</Text>
              </Stack>
            </Stack>
          </Stack>
        </ETACard>

        {/* Traffic Conditions */}
        <Box variant="outlined" padding="md">
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold">Traffic Conditions</Text>
              <TrafficIndicator $level={etaCalculation.trafficConditions}>
                <Text size="sm">{getTrafficText(etaCalculation.trafficConditions)}</Text>
              </TrafficIndicator>
            </Stack>

            <Stack direction="horizontal" justify="space-between" align="center">
              <Text>Confidence Level</Text>
              <Text size="sm" weight="bold">
                {getConfidenceText(etaCalculation.confidence)}
              </Text>
            </Stack>

            <ConfidenceBar $confidence={etaCalculation.confidence} />
          </Stack>
        </Box>

        {/* Additional Info */}
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text variant="muted" size="sm">Route</Text>
            <Text variant="muted" size="sm">
              {pickupLocation} → {dropoffLocation}
            </Text>
          </Stack>

          {lastUpdate && (
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="muted" size="sm">Last Updated</Text>
              <Text variant="muted" size="sm">
                {lastUpdate.toLocaleTimeString()}
              </Text>
            </Stack>
          )}
        </Stack>

        {/* Traffic Tips */}
        {etaCalculation.trafficConditions === 'high' && (
          <Alert variant="warning">
            <Stack spacing="xs">
              <Text weight="bold">Traffic Alert</Text>
              <Text size="sm">
                Heavy traffic detected. Consider allowing extra time for your journey.
              </Text>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Container>
  );
} 