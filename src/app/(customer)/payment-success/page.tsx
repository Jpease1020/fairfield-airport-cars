import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/design/ui';
import PaymentSuccessClient from './PaymentSuccessClient';

// Enable ISR for dynamic content updates
export const dynamic = 'force-dynamic';

// Main page component (Server Component)
export default async function PaymentSuccessPage() {
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
      <PaymentSuccessClient />
    </Suspense>
  );
}
