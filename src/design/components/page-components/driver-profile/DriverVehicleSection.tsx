import { 
  Container, 
  Text, 
  Badge,
  Stack,
  Card
} from '@/ui';
import { DriverProfile } from '@/lib/services/driver-profile-service';

interface DriverVehicleSectionProps {
  profile: DriverProfile;
}

export function DriverVehicleSection({ profile }: DriverVehicleSectionProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'child-seat': return '👶';
      case 'wheelchair-accessible': return '♿';
      case 'luxury': return '✨';
      case 'extra-luggage': return '🧳';
      default: return '✅';
    }
  };

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case 'child-seat': return 'Child Seat Available';
      case 'wheelchair-accessible': return 'Wheelchair Accessible';
      case 'luxury': return 'Luxury Vehicle';
      case 'extra-luggage': return 'Extra Luggage Space';
      default: return feature;
    }
  };

  return (
    <Container variant="default" padding="md">
      <Text variant="lead" weight="bold" marginBottom="md">
        Vehicle Information
      </Text>
      
      <Stack direction="vertical" spacing="md">
        {/* Vehicle Details */}
        <Card title="🚗 Vehicle Details" variant="default" padding="md">
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="body" weight="medium">
                {profile.vehicle.year} {profile.vehicle.make} {profile.vehicle.model}
              </Text>
              <Badge variant="info">{profile.vehicle.capacity} passengers</Badge>
            </Stack>
            
            <Stack direction="vertical" spacing="sm">
              <Text variant="small">Color: {profile.vehicle.color}</Text>
              <Text variant="small">License Plate: {profile.vehicle.licensePlate}</Text>
              <Text variant="small" color="muted">VIN: {profile.vehicle.vin}</Text>
            </Stack>
          </Stack>
        </Card>

        {/* Vehicle Features */}
        {profile.vehicle.features.length > 0 && (
          <Card title="🎯 Vehicle Features" variant="default" padding="md">
            <Stack direction="horizontal" spacing="sm" align="center" wrap="wrap">
              {profile.vehicle.features.map((feature, index) => (
                <Badge key={index} variant="info">
                  {getFeatureIcon(feature)} {getFeatureLabel(feature)}
                </Badge>
              ))}
            </Stack>
          </Card>
        )}

        {/* Maintenance History */}
        <Card title="🔧 Maintenance History" variant="default" padding="md">
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Last Service:</Text>
              <Text variant="small">{formatDate(profile.vehicle.maintenanceHistory.lastService)}</Text>
            </Stack>
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Next Service:</Text>
              <Text variant="small">{formatDate(profile.vehicle.maintenanceHistory.nextService)}</Text>
            </Stack>
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Current Mileage:</Text>
              <Text variant="small">{profile.vehicle.maintenanceHistory.mileage.toLocaleString()} miles</Text>
            </Stack>
          </Stack>
        </Card>

        {/* Vehicle Status */}
        <Card title="✅ Vehicle Status" variant="default" padding="md">
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Status</Text>
              <Badge variant="success">Well Maintained</Badge>
            </Stack>
            <Text variant="small" color="muted">
              Vehicle is regularly serviced and inspected for safety
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 