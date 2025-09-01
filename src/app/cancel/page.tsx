import { Suspense } from 'react';
import { 
  GridSection,
  LoadingSpinner,
  Container,
  Stack,
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import CancelPageClient from './CancelPageClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('cancel');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Main page component (Server Component)
export default async function CancelPage() {
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
      <CancelPageClient cmsData={cmsData} />
    </Suspense>
  );
}
