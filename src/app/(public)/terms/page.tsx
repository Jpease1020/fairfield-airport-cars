'use client';

import {
  ToastProvider,
  Container,
  Stack,
  Box,
  H1,
  H4,
  Text
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function TermsPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="terms-title"
              data-cms-id="pages.terms.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.terms.title', '📋 Terms of Service')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-testid="terms-last-updated"
              data-cms-id="pages.terms.lastUpdated"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.terms.lastUpdated', 'Effective Date: January 1, 2024 | Last updated: January 2024')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <Text 
            data-testid="terms-intro"
            data-cms-id="pages.terms.intro"
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.terms.intro', 'Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.')}
          </Text>
          
          <Text 
            data-testid="terms-service-description"
            data-cms-id="pages.terms.serviceDescription"
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.terms.serviceDescription', 'We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.')}
          </Text>
          
          <Stack data-testid="terms-sections-list" spacing="lg">
            <Box data-testid="terms-section-0">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-0" data-cms-id="pages.terms.sections.0.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.0.title', 'Booking')}
                </H4>
                <Text data-testid="terms-section-content-0" data-cms-id="pages.terms.sections.0.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.0.content', 'All bookings must be made through our website or by phone. We require at least 24 hours notice for all reservations.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-1">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-1" data-cms-id="pages.terms.sections.1.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.1.title', 'Payment')}
                </H4>
                <Text data-testid="terms-section-content-1" data-cms-id="pages.terms.sections.1.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.1.content', 'Payment is processed through Square. We accept all major credit cards and digital payments.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-2">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-2" data-cms-id="pages.terms.sections.2.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.2.title', 'Cancellation Policy')}
                </H4>
                <Text data-testid="terms-section-content-2" data-cms-id="pages.terms.sections.2.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.2.content', 'Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-3">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-3" data-cms-id="pages.terms.sections.3.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.3.title', 'Liability')}
                </H4>
                <Text data-testid="terms-section-content-3" data-cms-id="pages.terms.sections.3.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.3.content', 'We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="terms-section-4">
              <Stack spacing="md">
                <H4 data-testid="terms-section-title-4" data-cms-id="pages.terms.sections.4.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.4.title', 'Contact')}
                </H4>
                <Text data-testid="terms-section-content-4" data-cms-id="pages.terms.sections.4.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.terms.sections.4.content', 'For questions about these terms, please contact us at the information provided on our website.')}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default function TermsPage() {
  return (
    <ToastProvider>
      <TermsPageContent />
    </ToastProvider>
  );
}
