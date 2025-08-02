import { 
  Container, 
  Text,
  Stack,
  Card
} from '@/ui';

interface TrackingMapPlaceholderProps {
  height?: string;
  showComingSoon?: boolean;
}

export function TrackingMapPlaceholder({ 
  height = '200px', 
  showComingSoon = true 
}: TrackingMapPlaceholderProps) {
  return (
    <Container variant="default" padding="md">
      <Card 
        title="Live Tracking Map"
        description="Real-time driver location and route"
        variant="default"
        padding="xl"
      >
        <Stack direction="vertical" spacing="lg" align="center" justify="center">
          {/* Map Icon */}
          <Text variant="body" size="xl">
            🗺️
          </Text>
          
          {/* Map Title */}
          <Text variant="lead" weight="medium" align="center">
            Interactive Map
          </Text>
          
          {/* Coming Soon Message */}
          {showComingSoon && (
            <Text variant="small" color="muted" align="center">
              Coming soon - Real-time driver location
            </Text>
          )}
          
          {/* Map Features Preview */}
          <Stack direction="vertical" spacing="sm" align="center">
            <Text variant="small" color="muted" align="center">
              • Real-time driver location
            </Text>
            <Text variant="small" color="muted" align="center">
              • Live traffic updates
            </Text>
            <Text variant="small" color="muted" align="center">
              • Route optimization
            </Text>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
} 