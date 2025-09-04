import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import PayBalanceClient from './PayBalanceClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default async function PayBalancePage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
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
      <PayBalanceClient bookingId={bookingId} />
    </Suspense>
  );
} 