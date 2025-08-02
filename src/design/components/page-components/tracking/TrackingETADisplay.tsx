'use client';

import { 
  Container, 
  Text, 
  Badge,
  Stack,
  Box
} from '@/ui';
import { TrackingData } from '@/lib/services/real-time-tracking-service';
import { useState, useEffect } from 'react';

interface TrackingETADisplayProps {
  trackingData: TrackingData;
}

export function TrackingETADisplay({ trackingData }: TrackingETADisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!trackingData.estimatedArrival) return;

    const updateCountdown = () => {
      const now = new Date();
      const eta = new Date(trackingData.estimatedArrival!);
      const diffMs = eta.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins <= 0) {
        setTimeRemaining('Arriving now');
      } else if (diffMins === 1) {
        setTimeRemaining('1 minute');
      } else {
        setTimeRemaining(`${diffMins} minutes`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [trackingData.estimatedArrival]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  if (!trackingData.estimatedArrival) {
    return null;
  }

  return (
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="lg" align="center">
        {/* ETA Header */}
        <Text variant="lead" weight="bold" align="center">
          Estimated Arrival
        </Text>

        {/* Countdown Display */}
        <Box variant="filled" padding="lg" rounded="lg">
          <Stack direction="horizontal" spacing="md" align="center">
            <Text variant="body" size="xl">⏰</Text>
            <Stack direction="vertical" spacing="xs" align="center">
              <Text variant="body" size="lg" weight="bold" color="success">
                {timeRemaining}
              </Text>
              <Text variant="small">
                ({formatTime(trackingData.estimatedArrival)})
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* Status Badge */}
        <Badge variant="success">
          🚗 Driver is on the way
        </Badge>

        {/* Additional Info */}
        <Text variant="small" color="muted" align="center">
          ETA is based on current traffic conditions and may vary
        </Text>
      </Stack>
    </Container>
  );
} 