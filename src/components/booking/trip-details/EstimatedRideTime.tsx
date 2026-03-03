'use client';

import React from 'react';
import { Stack, Text, Box } from '@/design/ui';
import { useBooking } from '@/providers/BookingProvider';

interface EstimatedRideTimeProps {
  cmsData?: Record<string, string>;
}

export const EstimatedRideTime: React.FC<EstimatedRideTimeProps> = ({ cmsData }) => {
  const { route, routeLoading, routeError } = useBooking();
  
  // Show loading state
  if (routeLoading) {
    return (
      <Box 
        padding="md" 
        variant="filled"
        rounded="md"
        data-testid="estimated-ride-time-loading"
      >
        <Text size="sm" color="secondary">
          {cmsData?.['tripDetailsPhase-calculatingRoute'] || '⏱️ Calculating route...'}
        </Text>
      </Box>
    );
  }

  // Show error state
  if (routeError) {
    return null; // Silently fail - route info is optional
  }

  // Don't show if no route data yet
  if (!route) {
    return null;
  }

  return (
    <Box 
      padding="md" 
      variant="filled"
      rounded="md"
      data-testid="estimated-ride-time"
    >
      <Stack spacing="sm">
        <Text size="sm" weight="semibold" color="primary">
          {cmsData?.['tripDetailsPhase-estimatedTimeTitle'] || '⏱️ Estimated Ride Time'}
        </Text>
        <Text size="lg" weight="bold" color="success">
          {route.durationInTraffic || route.duration}
        </Text>
        <Text size="xs" color="secondary">
          {cmsData?.['tripDetailsPhase-estimatedTimeNote'] || 'Based on current traffic conditions'}
        </Text>
      </Stack>
      
      <Box padding="md">
        <Stack spacing="sm">
          <Text weight="medium" size="sm">
            {cmsData?.['tripDetailsPhase-routeInfo'] || 'Trip Information'}
          </Text>
        <Text size="sm">
          {/* eslint-disable-next-line fairfield/enforce-cms-usage */}
          {cmsData?.['tripDetailsPhase-distance'] || 'Distance'}: {route.distance}
        </Text>
        {route.durationInTraffic && route.durationInTraffic !== route.duration && (
          <Text size="xs" color="secondary">
            {cmsData?.['tripDetailsPhase-trafficAdjusted'] || '(traffic adjusted)'}
          </Text>
        )}
        {route.trafficLevel && route.trafficLevel !== 'unknown' && (
          <Text size="sm" color={route.trafficLevel === 'high' ? 'error' : route.trafficLevel === 'medium' ? 'warning' : 'success'}>
            {/* eslint-disable-next-line fairfield/enforce-cms-usage */}
            {cmsData?.['tripDetailsPhase-trafficLevel'] || 'Traffic'}: {route.trafficLevel}
          </Text>
        )}
        </Stack>
      </Box>
    </Box>
  );
};
