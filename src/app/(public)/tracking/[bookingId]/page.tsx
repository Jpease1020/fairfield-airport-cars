import { Suspense } from 'react';
import { 
  Container, 
  Stack, 
  LoadingSpinner,
  GridSection,
} from '@/ui';
import TrackingPageClient from './TrackingPageClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default async function TrackingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
  return (
    <Suspense fallback={
      <>
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </>
    }>
      <TrackingPageClient bookingId={bookingId} />
    </Suspense>
  );
} 