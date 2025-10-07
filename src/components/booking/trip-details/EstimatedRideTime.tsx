'use client';

import React from 'react';
import { Stack, Text, Box } from '@/design/ui';
import { useBooking } from '@/providers/BookingProvider';

interface EstimatedRideTimeProps {
  cmsData: any;
}

export const EstimatedRideTime: React.FC<EstimatedRideTimeProps> = ({ cmsData }) => {
  const { formData } = useBooking();
  
  // Check if we have both pickup and dropoff coordinates
  const hasCoordinates = formData.trip.pickup.coordinates && formData.trip.dropoff.coordinates;
  
  // For now, we'll show a simple estimated time based on distance
  // In a real implementation, this would use Google Maps API to get actual travel time
  const getEstimatedTime = () => {
    if (!hasCoordinates) return null;
    
    // Simple estimation based on coordinates
    const pickup = formData.trip.pickup.coordinates!;
    const dropoff = formData.trip.dropoff.coordinates!;
    
    // Calculate approximate distance (simplified)
    const latDiff = Math.abs(pickup.lat - dropoff.lat);
    const lngDiff = Math.abs(pickup.lng - dropoff.lng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles
    
    // Estimate time based on distance (assuming average speed of 30 mph in traffic)
    const estimatedMinutes = Math.round(distance * 2); // 2 minutes per mile average
    
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const estimatedTime = getEstimatedTime();

  if (!estimatedTime) {
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
          {estimatedTime}
        </Text>
        <Text size="xs" color="secondary">
          {cmsData?.['tripDetailsPhase-estimatedTimeNote'] || 'Based on current traffic conditions'}
        </Text>
      </Stack>
    </Box>
  );
};
