import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import FeedbackClient from './FeedbackClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('customer-feedback');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Main page component (Server Component)
export default async function FeedbackPage({ params }: { params: { id: string } }) {
  const cmsData = await getCMSData();
  
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
      <FeedbackClient cmsData={cmsData} bookingId={params.id} />
    </Suspense>
  );
}
