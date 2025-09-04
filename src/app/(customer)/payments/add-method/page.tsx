import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import AddPaymentMethodClient from './AddPaymentMethodClient';

// Main page component (Server Component)
export default function AddPaymentMethodPage() {
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
      <AddPaymentMethodClient />
    </Suspense>
  );
} 