import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/design/ui';
import FeedbackClient from './FeedbackClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
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
      <FeedbackClient bookingId={id} />
    </Suspense>
  );
}
