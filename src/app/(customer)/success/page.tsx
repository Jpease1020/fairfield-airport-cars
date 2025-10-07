import { Suspense } from 'react';
import SuccessPageClient from './SuccessPageClient';
import { LoadingSpinner, Container, Stack, Text } from '@/design/ui';

// Main page component
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text cmsId="loading-text">Loading...</Text>
        </Stack>
      </Container>
    }>
      <SuccessPageClient />
    </Suspense>
  );
}
