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
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function TermsPageContent() {
  const { cmsData } = useCMSData();
  const termsSections = [
    {
      title: "Booking",
      content: "All bookings must be made through our website or by phone. We require at least 24 hours notice for all reservations."
    },
    {
      title: "Payment",
      content: "Payment is processed through Square. We accept all major credit cards and digital payments."
    },
    {
      title: "Cancellation Policy",
      content: "Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup."
    },
    {
      title: "Liability",
      content: "We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals."
    },
    {
      title: "Contact",
      content: "For questions about these terms, please contact us at the information provided on our website."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center" data-testid="terms-title">
              {getCMSField(cmsData, 'terms.title', '📋 Terms of Service')}
            </H1>
            <Text variant="lead" align="center" size="lg" data-testid="terms-last-updated">
              {getCMSField(cmsData, 'terms.lastUpdated', 'Effective Date: January 1, 2024 | Last updated: January 2024')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
            
            <Text data-testid="terms-intro">
              {getCMSField(cmsData, 'terms.intro', 'Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.')}
            </Text>
            
            <Text data-testid="terms-service-description">
              {getCMSField(cmsData, 'terms.serviceDescription', 'We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.')}
            </Text>
            
            <Stack data-testid="terms-sections-list" spacing="lg">
              {termsSections.map((section, index) => (
                <Box key={index} data-testid={`terms-section-${index}`}>
                  <Stack spacing="md">
                    <H4 data-testid={`terms-section-title-${index}`}>
                      {getCMSField(cmsData, `terms.sections.${index}.title`, section.title)}
                    </H4>
                    <Text data-testid={`terms-section-content-${index}`}>
                      {getCMSField(cmsData, `terms.sections.${index}.content`, section.content)}
                    </Text>
                  </Stack>
                </Box>
              ))}
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
