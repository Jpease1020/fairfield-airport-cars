import { 
  Container, 
  Text, 
  Badge,
  Stack,
  Box
} from '@/ui';
import { TrackingData } from '@/lib/services/real-time-tracking-service';

interface TrackingStatusHeaderProps {
  trackingData: TrackingData;
}

export function TrackingStatusHeader({ trackingData }: TrackingStatusHeaderProps) {
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

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Booking Confirmed';
      case 'driver-assigned': return 'Driver Assigned';
      case 'en-route': return 'Driver En Route';
      case 'arrived': return 'Driver Arrived';
      case 'completed': return 'Ride Completed';
      default: return 'Processing';
    }
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
      <Stack direction="vertical" spacing="lg" align="center">
        {/* Status Icon and Badge */}
        <Stack direction="horizontal" spacing="md" align="center">
          <Text variant="body" size="xl">
            {getStatusIcon(trackingData.status)}
          </Text>
          <Badge variant={getStatusColor(trackingData.status)}>
            {getStatusTitle(trackingData.status)}
          </Badge>
        </Stack>

        {/* Status Message */}
        <Text variant="lead" weight="medium" align="center">
          {trackingData.statusMessage}
        </Text>

        {/* Last Updated */}
        <Text variant="small" color="muted" align="center">
          Last updated: {formatTime(trackingData.lastUpdated)}
        </Text>

        {/* Driver Info (if assigned) */}
        {trackingData.driverName && (
          <Box variant="outlined" padding="sm" rounded="md">
            <Stack direction="horizontal" spacing="sm" align="center">
              <Text variant="small">👤</Text>
              <Text variant="body" weight="medium">
                {trackingData.driverName}
              </Text>
              <Text variant="small" color="muted">
                is your driver
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
} 