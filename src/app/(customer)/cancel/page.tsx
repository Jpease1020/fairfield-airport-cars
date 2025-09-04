import { Suspense } from 'react';
import { 
  GridSection,
  LoadingSpinner,
  Container,
  Stack,
} from '@/ui';
import CancelPageClient from './CancelPageClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Main page component (Server Component)
export default function CancelPage() {
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
      <CancelPageClient />
    </Suspense>
  );
}
