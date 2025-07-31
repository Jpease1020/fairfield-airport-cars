'use client';

import { Layout } from '@/ui';
import { 
  GridSection,
  ToastProvider,
  Container,
  Stack,
  Box,
} from '@/ui';
import { EditableText } from '@/ui';
import { EditableHeading } from '@/ui';

function TermsPageContent() {
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
    <Layout>
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="terms-title" level={3} field="terms.title" defaultValue="📋 Terms of Service">📋 Terms of Service</EditableHeading>
              <EditableText data-testid="terms-last-updated" field="terms.lastUpdated" defaultValue="Effective Date: January 1, 2024 | Last updated: January 2024">
                Effective Date: January 1, 2024 | Last updated: January 2024
              </EditableText>
            </Stack>
            
            <EditableText data-testid="terms-intro" field="terms.intro" defaultValue="Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.">
              Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.
            </EditableText>
            
            <EditableText data-testid="terms-service-description" field="terms.serviceDescription" defaultValue="We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.">
              We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.
            </EditableText>
            
            <Stack data-testid="terms-sections-list" spacing="lg">
              {termsSections.map((section, index) => (
                <Box key={index} data-testid={`terms-section-${index}`}>
                  <Stack spacing="md">
                    <EditableHeading data-testid={`terms-section-title-${index}`} level={4} field={`terms.sections.${index}.title`} defaultValue={section.title}>
                      {section.title}
                    </EditableHeading>
                    <EditableText data-testid={`terms-section-content-${index}`} field={`terms.sections.${index}.content`} defaultValue={section.content}>
                      {section.content}
                    </EditableText>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>
    </Layout>
  );
}

export default function TermsPage() {
  return (
    <ToastProvider>
      <TermsPageContent />
    </ToastProvider>
  );
}
