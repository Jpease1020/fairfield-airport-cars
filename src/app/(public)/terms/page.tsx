import {
  Container,
  Stack,
  Box,
  H1,
  H4,
  Text
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'terms' }];
}

export async function generateMetadata() {
  const termsData = await cmsFlattenedService.getPageContent('terms');
  
  return {
    title: termsData?.title || 'Terms of Service - Fairfield Airport Cars',
    description: termsData?.metaDescription || 'Terms of service for Fairfield Airport Car Service.',
    keywords: 'terms of service, airport transportation, Fairfield, cancellation policy, liability',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('terms');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Helper function to get field value with fallback
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const directParts = fieldPath.split('.');
  let value = resolvePath(cmsData, directParts);

  if (value === undefined && directParts[0] !== 'pages') {
    const fallbackParts = ['pages', ...directParts];
    value = resolvePath(cmsData, fallbackParts);
  }

  return typeof value === 'string' ? (value as string) : defaultValue;
}

function TermsPageContent({ cmsData }: { cmsData: CMSConfiguration | null }) {
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="terms-title"
              data-cms-id="title"
            >
              {getCMSField(cmsData, 'terms-title', 'Terms of Service')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-testid="terms-last-updated"
              data-cms-id="last-updated"
            >
              {getCMSField(cmsData, 'terms-last-updated', 'Last Updated: January 2025')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <Text 
            data-testid="terms-intro"
            data-cms-id="intro"
          >
            {getCMSField(cmsData, 'terms-intro', 'By using our services, you agree to our terms of service. We reserve the right to modify these terms at any time. Please review them periodically.')}
          </Text>
          
          <Text 
            data-testid="terms-service-description"
            data-cms-id="service-description"
          >
            {getCMSField(cmsData, 'terms-service-description', 'Our airport transportation service is designed to provide reliable, comfortable rides to and from major airports in the New York and Connecticut area.')}
          </Text>
          
          <Stack data-testid="terms-sections-list" spacing="lg">
            <Box data-testid="terms-section-0">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-0" data-cms-id="sections-0-title">
                  {getCMSField(cmsData, 'terms-sections-0-title', 'Service Description')}
                </H4>
                <Text data-testid="terms-section-content-0" data-cms-id="sections-0-content">
                                      {getCMSField(cmsData, 'terms-sections-0-content', 'We provide professional airport transportation services with licensed drivers and well-maintained vehicles. Our service includes flight monitoring and flexible pickup times.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-1">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-1" data-cms-id="sections-1-title">
                  {getCMSField(cmsData, 'terms-sections-1-title', 'Booking and Payment')}
                </H4>
                <Text data-testid="terms-section-content-1" data-cms-id="sections-1-content">
                                      {getCMSField(cmsData, 'terms-sections-1-content', 'Bookings must be made in advance through our website or phone system. Payment is required at the time of booking. We accept all major credit cards and cash payments.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-2">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-2" data-cms-id="sections-2-title">
                  {getCMSField(cmsData, 'terms-sections-2-title', 'Cancellation Policy')}
                </H4>
                <Text data-testid="terms-section-content-2" data-cms-id="sections-2-content">
                  {getCMSField(cmsData, 'terms-sections-2-content', 'Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-3">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-3" data-cms-id="sections-3-title">
                  {getCMSField(cmsData, 'terms-sections-3-title', 'Liability')}
                </H4>
                <Text data-testid="terms-section-content-3" data-cms-id="sections-3-content">
                  {getCMSField(cmsData, 'terms-sections-3-content', 'We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-4">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-4" data-cms-id="sections-4-title">
                  {getCMSField(cmsData, 'terms-sections-4-title', 'Contact')}
                </H4>
                <Text data-testid="terms-section-content-4" data-cms-id="sections-4-content">
                  {getCMSField(cmsData, 'terms-sections-4-content', 'For questions about these terms, please contact us at the information provided on our website.')}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default async function TermsPage() {
  // Load CMS data at build time for instant page loads
  const cmsData = await getCMSData();
  
  return <TermsPageContent cmsData={cmsData} />;
}
