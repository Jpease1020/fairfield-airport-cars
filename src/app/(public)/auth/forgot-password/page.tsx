import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import ForgotPasswordClient from './ForgotPasswordClient';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

// Main page component (Server Component)
export default async function ForgotPasswordPage() {
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
      <ForgotPasswordClient />
    </Suspense>
  );
} 