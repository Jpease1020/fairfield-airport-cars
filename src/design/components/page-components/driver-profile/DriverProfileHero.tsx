import styled from 'styled-components';
import { 
  Container, 
  Text, 
  Stack, 
  Badge
} from '@/ui';
import { DriverProfile } from '@/lib/services/driver-profile-service';

// Styled component for profile image container
const ProfileImageContainer = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-secondary);
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-border);
`;

// Styled component for profile image
const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface DriverProfileHeroProps {
  profile: DriverProfile;
}

export function DriverProfileHero({ profile }: DriverProfileHeroProps) {
  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="lg" align="center">
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="lead" size="xl" weight="bold">
            Meet Your Driver
          </Text>
          <Text variant="body" color="muted" align="center">
            Professional, reliable, and trusted by thousands of customers
          </Text>
        </Stack>

        <Stack direction="horizontal" spacing="md" align="center">
          <ProfileImageContainer>
            {profile.photo ? (
              <ProfileImage 
                src={profile.photo} 
                alt={`${profile.name}`}
              />
            ) : (
              <Text variant="body" size="xl">👤</Text>
            )}
          </ProfileImageContainer>
          
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" size="lg" weight="bold">
              {profile.name}
            </Text>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Badge variant={profile.status === 'available' ? 'success' : 'warning'}>
                {profile.status}
              </Badge>
              <Text variant="small">
                ⭐ {profile.rating} ({profile.totalRides} rides)
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
} 