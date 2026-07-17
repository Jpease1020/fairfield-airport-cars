import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/design/ui';
import ManageBookingClient from './ManageBookingClient';

// Enable ISR for dynamic content updates
export const dynamic = 'force-dynamic';

// Main page component (Server Component)
export default async function ManageBookingPage({ params }: { params: Promise<{ id: string }> }) {
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
      <ManageBookingClient bookingId={id} />
    </Suspense>
  );
}
