import { Suspense } from 'react';
import { 
  Container, 
  Stack, 
  LoadingSpinner,
  GridSection,
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import TrackingPageClient from './TrackingPageClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('tracking');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Main page component (Server Component)
export default async function TrackingPage({ params }: { params: { bookingId: string } }) {
  const cmsData = await getCMSData();
  
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
      <TrackingPageClient cmsData={cmsData} bookingId={params.bookingId} />
    </Suspense>
  );
} 