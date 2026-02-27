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
} from '@/design/ui';
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
    display: flex;
    align-items: center;
    justify-content: flex-start;
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
  onETAUpdate?: (_eta: ETACalculation) => void;
  cmsData?: Record<string, string>;
}

export function TrafficETA({
  bookingId,
  pickupLocation,
  dropoffLocation,
  currentLocation,
  onETAUpdate,
  cmsData
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
          <Text variant="muted" cmsId="traffic-eta-calculating">{cmsData?.['traffic-etaCalculating'] || 'Calculating ETA...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text cmsId="traffic-eta-error">{cmsData?.['traffic-etaError'] || 'Failed to calculate ETA'}</Text>
        </Alert>
      </Container>
    );
  }

  if (!etaCalculation) {
    return (
      <Container>
        <Alert variant="warning">
          <Text cmsId="traffic-eta-not-available">{cmsData?.['traffic-etaNotAvailable'] || 'ETA not available'}</Text>
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
              <Text weight="bold" size="lg" cmsId="traffic-eta-estimated-arrival">{cmsData?.['traffic-etaEstimatedArrival'] || 'Estimated Arrival'}</Text>
              <Badge variant="success">
                {formatTime(etaCalculation.estimatedArrival)}
              </Badge>
            </Stack>

            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="traffic-eta-travel-time">{cmsData?.['traffic-etaTravelTime'] || 'Travel Time'}</Text>
                <Text weight="bold" cmsId="traffic-eta-travel-time-value">{cmsData?.['traffic-etaTravelTimeValue'] || formatDuration(etaCalculation.duration)}</Text>
              </Stack>

              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="traffic-eta-distance">{cmsData?.['traffic-etaDistance'] || 'Distance'}</Text>
                <Text weight="bold" cmsId="traffic-eta-distance-value">{cmsData?.['traffic-etaDistanceValue'] || `${etaCalculation.distance.toFixed(1)} miles`}</Text>
              </Stack>
            </Stack>
          </Stack>
        </ETACard>

        {/* Traffic Conditions */}
        <Box variant="outlined" padding="md">
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold" cmsId="traffic-eta-traffic-conditions">{cmsData?.['traffic-etaTrafficConditions'] || 'Traffic Conditions'}</Text>
              <TrafficIndicator $level={etaCalculation.trafficConditions}>
                <Text size="sm" cmsId="traffic-eta-traffic-conditions-value">{cmsData?.['traffic-etaTrafficConditionsValue'] || getTrafficText(etaCalculation.trafficConditions)}</Text>
              </TrafficIndicator>
            </Stack>

            <Stack direction="horizontal" justify="space-between" align="center">
              <Text cmsId="traffic-eta-confidence-level">{cmsData?.['traffic-etaConfidenceLevel'] || 'Confidence Level'}</Text>
              <Text size="sm" weight="bold">
                {cmsData?.['traffic-etaConfidenceLevelValue'] || getConfidenceText(etaCalculation.confidence)}
              </Text>
            </Stack>

            <ConfidenceBar $confidence={etaCalculation.confidence} />
          </Stack>
        </Box>

        {/* Additional Info */}
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text variant="muted" size="sm" cmsId="traffic-eta-route">{cmsData?.['traffic-etaRoute'] || 'Route'}</Text>
            <Text variant="muted" size="sm" cmsId="ignore">
              {/* eslint-disable-next-line fairfield/enforce-cms-usage */}
              {pickupLocation} → {dropoffLocation}
            </Text>
          </Stack>

          {lastUpdate && (
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="muted" size="sm" cmsId="traffic-eta-last-updated">{cmsData?.['traffic-etaLastUpdated'] || 'Last Updated'}</Text>
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
              <Text weight="bold" cmsId="traffic-eta-traffic-alert">{cmsData?.['traffic-etaTrafficAlert'] || 'Traffic Alert'}</Text>
              <Text size="sm" cmsId="traffic-eta-high-traffic-message">
                {cmsData?.['traffic-etaHighTraffic'] || 'Heavy traffic detected. Consider allowing extra time for your journey.'}
              </Text>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Container>
  );
} 
