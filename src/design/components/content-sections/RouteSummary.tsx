'use client';

import React from 'react';
import styled from 'styled-components';
import { Box } from '../../layout/content/Box';
import { Stack } from '../../layout/framing/Stack';
import { Text } from '../base-components/text/Text';
import { colors, spacing } from '../../foundation/tokens/tokens';

const RouteCard = styled(Box)`
  background-color: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: ${spacing.lg};
`;

const RouteItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm} 0;
  border-bottom: 1px solid var(--border-light);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TrafficIndicator = styled.div<{ $level: 'low' | 'medium' | 'high' | 'unknown' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${({ $level }) => {
    switch ($level) {
      case 'low':
        return `
          background-color: ${colors.success[100]};
          color: ${colors.success[700]};
        `;
      case 'medium':
        return `
          background-color: ${colors.warning[100]};
          color: ${colors.warning[700]};
        `;
      case 'high':
        return `
          background-color: ${colors.danger[100]};
          color: ${colors.danger[700]};
        `;
      default:
        return `
          background-color: ${colors.gray[100]};
          color: ${colors.gray[700]};
        `;
    }
  }}
`;

interface RouteSummaryProps {
  route: {
    distance: string;
    duration: string;
    durationInTraffic: string | null;
    trafficLevel: 'low' | 'medium' | 'high' | 'unknown';
  } | null;
  loading: boolean;
  error: string | null;
  estimatedFare?: number | null;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({
  route,
  loading,
  error,
  estimatedFare
}) => {
  if (loading) {
    return (
      <RouteCard>
        <Stack spacing="md" align="center">
          <Text size="lg" weight="semibold">Calculating route...</Text>
          <Text size="md" color="secondary">Please wait while we find the best route</Text>
        </Stack>
      </RouteCard>
    );
  }

  if (error) {
    return (
      <RouteCard>
        <Stack spacing="md" align="center">
          <Text size="lg" weight="semibold" color="error">Route calculation failed</Text>
          <Text size="md" color="secondary">{error}</Text>
        </Stack>
      </RouteCard>
    );
  }

  if (!route) {
    return null;
  }

  const getTrafficIcon = (level: string) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getTrafficText = (level: string) => {
    switch (level) {
      case 'low': return 'Light Traffic';
      case 'medium': return 'Moderate Traffic';
      case 'high': return 'Heavy Traffic';
      default: return 'Traffic Unknown';
    }
  };

  return (
    <RouteCard>
      <Stack spacing="md">
        <Text size="lg" weight="bold">Route Summary</Text>
        
        <RouteItem>
          <Text weight="medium">Distance:</Text>
          <Text>{route.distance}</Text>
        </RouteItem>
        
        <RouteItem>
          <Text weight="medium">Base Travel Time:</Text>
          <Text>{route.duration}</Text>
        </RouteItem>
        
        {route.durationInTraffic && (
          <RouteItem>
            <Text weight="medium">ETA with Traffic:</Text>
            <Text weight="semibold">{route.durationInTraffic}</Text>
          </RouteItem>
        )}
        
        <RouteItem>
          <Text weight="medium">Traffic Conditions:</Text>
          <TrafficIndicator $level={route.trafficLevel}>
            {getTrafficIcon(route.trafficLevel)} {getTrafficText(route.trafficLevel)}
          </TrafficIndicator>
        </RouteItem>
        
        {estimatedFare && (
          <RouteItem>
            <Text weight="medium">Estimated Fare:</Text>
            <Text size="lg" weight="bold" color="primary">
              ${estimatedFare}
            </Text>
          </RouteItem>
        )}
      </Stack>
    </RouteCard>
  );
};
