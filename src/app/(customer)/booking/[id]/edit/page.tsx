import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import EditBookingClient from './EditBookingClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <>
        <Container>
          <Stack spacing="lg" align="center">
            <LoadingSpinner size="lg" />
          </Stack>
        </Container>
      </>
    }>
      <EditBookingClient bookingId={id} />
    </Suspense>
  );
}
