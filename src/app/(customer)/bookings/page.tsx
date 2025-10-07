import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/design/ui';
import CustomerBookingsClient from './CustomerBookingsClient';

// Main page component (Server Component)
export default function CustomerBookingsPage() {
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
      <CustomerBookingsClient />
    </Suspense>
  );
} 