import { Suspense } from 'react';
import { 
  Container,
  LoadingSpinner,
  Stack,
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import CustomerPaymentsClient from './CustomerPaymentsClient';

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('customer-payments');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Main page component (Server Component)
export default async function CustomerPaymentsPage() {
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
      <CustomerPaymentsClient cmsData={cmsData} />
    </Suspense>
  );
} 