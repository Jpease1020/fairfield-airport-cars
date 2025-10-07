import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/design/ui';
import CustomerPaymentsClient from './CustomerPaymentsClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default function CustomerPaymentsPage() {
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
      <CustomerPaymentsClient />
    </Suspense>
  );
} 