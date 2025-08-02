import { 
  Container, 
  Text, 
  Badge,
  Stack,
  Card
} from '@/ui';
import { DriverProfile } from '@/lib/services/driver-profile-service';

interface DriverCredentialsSectionProps {
  profile: DriverProfile;
}

export function DriverCredentialsSection({ profile }: DriverCredentialsSectionProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isExpired = (date: Date) => {
    return new Date(date) < new Date();
  };

  const getExpiryStatus = (date: Date) => {
    const daysUntilExpiry = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'warning';
    return 'valid';
  };

  return (
    <Container variant="default" padding="md">
      <Text variant="lead" weight="bold" marginBottom="md">
        Professional Credentials
      </Text>
      
      <Stack direction="vertical" spacing="md">
        {/* Driver License */}
        <Card 
          title="🪪 Driver License"
          variant={getExpiryStatus(profile.credentials.licenseExpiry) === 'expired' ? 'elevated' : 'default'}
          padding="md"
        >
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Status</Text>
              <Badge variant={getExpiryStatus(profile.credentials.licenseExpiry) === 'expired' ? 'error' : 'success'}>
                {getExpiryStatus(profile.credentials.licenseExpiry) === 'expired' ? 'Expired' : 'Valid'}
              </Badge>
            </Stack>
            <Text variant="small">License #: {profile.credentials.licenseNumber}</Text>
            <Text variant="small" color="muted">
              Expires: {formatDate(profile.credentials.licenseExpiry)}
              {isExpired(profile.credentials.licenseExpiry) && ' ⚠️'}
            </Text>
          </Stack>
        </Card>

        {/* Background Check */}
        <Card title="🔍 Background Check" variant="default" padding="md">
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Status</Text>
              <Badge variant="success">Verified</Badge>
            </Stack>
            <Text variant="small">Status: {profile.credentials.backgroundCheckStatus}</Text>
            <Text variant="small" color="muted">
              Completed: {formatDate(profile.credentials.backgroundCheckDate)}
            </Text>
          </Stack>
        </Card>

        {/* Insurance */}
        <Card 
          title="🛡️ Vehicle Insurance"
          variant={getExpiryStatus(profile.credentials.insuranceExpiry) === 'expired' ? 'elevated' : 'default'}
          padding="md"
        >
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Status</Text>
              <Badge variant={getExpiryStatus(profile.credentials.insuranceExpiry) === 'expired' ? 'error' : 'success'}>
                {getExpiryStatus(profile.credentials.insuranceExpiry) === 'expired' ? 'Expired' : 'Active'}
              </Badge>
            </Stack>
            <Text variant="small">Provider: {profile.credentials.insuranceProvider}</Text>
            <Text variant="small">Policy #: {profile.credentials.insurancePolicyNumber}</Text>
            <Text variant="small" color="muted">
              Expires: {formatDate(profile.credentials.insuranceExpiry)}
              {isExpired(profile.credentials.insuranceExpiry) && ' ⚠️'}
            </Text>
          </Stack>
        </Card>

        {/* Vehicle Inspection */}
        <Card 
          title="🚗 Vehicle Inspection"
          variant={getExpiryStatus(profile.credentials.vehicleInspectionDate) === 'expired' ? 'elevated' : 'default'}
          padding="md"
        >
          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
              <Text variant="small">Status</Text>
              <Badge variant={getExpiryStatus(profile.credentials.vehicleInspectionDate) === 'expired' ? 'error' : 'success'}>
                {getExpiryStatus(profile.credentials.vehicleInspectionDate) === 'expired' ? 'Due' : 'Current'}
              </Badge>
            </Stack>
            <Text variant="small" color="muted">
              Last Inspection: {formatDate(profile.credentials.vehicleInspectionDate)}
              {isExpired(profile.credentials.vehicleInspectionDate) && ' ⚠️'}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 