'use client';

import { LiveTrackingCard } from '@/ui';
import { 
  Container, 
  GridSection, 
  Text,
  PageLayout,
  Stack
} from '@/ui';
import { useParams } from 'next/navigation';

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  if (!bookingId) {
    return (
      <PageLayout>
        <Container variant="default" padding="none">
          <GridSection variant="content" columns={1}>
            <Container>
              <Text variant="body" color="error">
                Invalid booking ID. Please check your tracking link.
              </Text>
            </Container>
          </GridSection>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack direction="vertical" spacing="xl" align="center">
              <Stack direction="vertical" spacing="md" align="center">
                <Text variant="lead" size="xl" weight="bold">
                  Track Your Ride
                </Text>
                <Text variant="body" color="muted" align="center">
                  Real-time updates on your driver's location and arrival time
                </Text>
              </Stack>

              <LiveTrackingCard 
                bookingId={bookingId}
                showMap={true}
                showETA={true}
                showDriverInfo={true}
              />

              <Text variant="body" color="muted" align="center">
                Need help? Contact us at (203) 555-0123
              </Text>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    </PageLayout>
  );
} 