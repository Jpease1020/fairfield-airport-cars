'use client';

import {
  ToastProvider,
  Text,
  Container,
  Stack,
  Box,
  H1,
  H4
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function PrivacyPageContent() {
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
              data-testid="privacy-title"
              data-cms-id="pages.privacy.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.privacy.title', '🔒 Privacy Policy')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-testid="privacy-effective-date"
              data-cms-id="pages.privacy.effectiveDate"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.privacy.effectiveDate', 'Effective Date: January 1, 2024 | Last Updated: January 1, 2024')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <Stack data-testid="privacy-sections-list" spacing="lg">
            <Box data-testid="privacy-section-0">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-0" data-cms-id="pages.privacy.sections.0.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.0.title', '1. Information We Collect')}
                </H4>
                <Text data-testid="privacy-section-content-0" data-cms-id="pages.privacy.sections.0.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.0.content', 'We collect information you provide directly to us when you book our services, including:')}
                </Text>
                <Stack data-testid="privacy-section-items-0" spacing="sm">
                  <Text data-testid="privacy-section-item-0-0" data-cms-id="pages.privacy.sections.0.items.0" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.0', 'Name and contact information (phone, email, address)')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-0-1" data-cms-id="pages.privacy.sections.0.items.1" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.1', 'Pickup and destination locations')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-0-2" data-cms-id="pages.privacy.sections.0.items.2" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.2', 'Travel dates and times')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-0-3" data-cms-id="pages.privacy.sections.0.items.3" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.3', 'Flight information (when applicable)')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-0-4" data-cms-id="pages.privacy.sections.0.items.4" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.4', 'Payment information')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-0-5" data-cms-id="pages.privacy.sections.0.items.5" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.0.items.5', 'Special requests or preferences')}`}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-1">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-1" data-cms-id="pages.privacy.sections.1.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.1.title', '2. How We Use Information')}
                </H4>
                <Text data-testid="privacy-section-content-1" data-cms-id="pages.privacy.sections.1.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.1.content', 'We use the information we collect to:')}
                </Text>
                <Stack data-testid="privacy-section-items-1" spacing="sm">
                  <Text data-testid="privacy-section-item-1-0" data-cms-id="pages.privacy.sections.1.items.0" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.0', 'Provide and coordinate transportation services')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-1-1" data-cms-id="pages.privacy.sections.1.items.1" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.1', 'Process payments and send confirmations')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-1-2" data-cms-id="pages.privacy.sections.1.items.2" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.2', 'Communicate with you about your bookings')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-1-3" data-cms-id="pages.privacy.sections.1.items.3" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.3', 'Send service updates and notifications')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-1-4" data-cms-id="pages.privacy.sections.1.items.4" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.4', 'Improve our services and customer experience')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-1-5" data-cms-id="pages.privacy.sections.1.items.5" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.1.items.5', 'Comply with legal obligations')}`}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-2">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-2" data-cms-id="pages.privacy.sections.2.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.2.title', '3. Information Sharing')}
                </H4>
                <Text data-testid="privacy-section-content-2" data-cms-id="pages.privacy.sections.2.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.2.content', 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:')}
                </Text>
                <Stack data-testid="privacy-section-items-2" spacing="sm">
                  <Text data-testid="privacy-section-item-2-0" data-cms-id="pages.privacy.sections.2.items.0" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.2.items.0', 'With our driver to coordinate your transportation')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-2-1" data-cms-id="pages.privacy.sections.2.items.1" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.2.items.1', 'With payment processors to handle transactions')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-2-2" data-cms-id="pages.privacy.sections.2.items.2" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.2.items.2', 'When required by law or legal process')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-2-3" data-cms-id="pages.privacy.sections.2.items.3" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.2.items.3', 'To protect our rights, property, or safety')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-2-4" data-cms-id="pages.privacy.sections.2.items.4" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.2.items.4', 'With your explicit consent')}`}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-3">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-3" data-cms-id="pages.privacy.sections.3.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.3.title', '4. Data Security')}
                </H4>
                <Text data-testid="privacy-section-content-3" data-cms-id="pages.privacy.sections.3.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.3.content', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:')}
                </Text>
                <Stack data-testid="privacy-section-items-3" spacing="sm">
                  <Text data-testid="privacy-section-item-3-0" data-cms-id="pages.privacy.sections.3.items.0" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.3.items.0', 'Encrypted data transmission')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-3-1" data-cms-id="pages.privacy.sections.3.items.1" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.3.items.1', 'Secure payment processing')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-3-2" data-cms-id="pages.privacy.sections.3.items.2" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.3.items.2', 'Limited access to personal information')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-3-3" data-cms-id="pages.privacy.sections.3.items.3" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.3.items.3', 'Regular security assessments')}`}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-4">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-4" data-cms-id="pages.privacy.sections.4.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.4.title', '5. Data Retention')}
                </H4>
                <Text data-testid="privacy-section-content-4" data-cms-id="pages.privacy.sections.4.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.4.content', 'We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking information is typically retained for accounting and customer service purposes.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-5">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-5" data-cms-id="pages.privacy.sections.5.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.5.title', '6. Your Rights')}
                </H4>
                <Text data-testid="privacy-section-content-5" data-cms-id="pages.privacy.sections.5.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.5.content', 'You have the right to:')}
                </Text>
                <Stack data-testid="privacy-section-items-5" spacing="sm">
                  <Text data-testid="privacy-section-item-5-0" data-cms-id="pages.privacy.sections.5.items.0" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.5.items.0', 'Access and review your personal information')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-5-1" data-cms-id="pages.privacy.sections.5.items.1" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.5.items.1', 'Request corrections to inaccurate information')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-5-2" data-cms-id="pages.privacy.sections.5.items.2" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.5.items.2', 'Request deletion of your information (subject to legal requirements)')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-5-3" data-cms-id="pages.privacy.sections.5.items.3" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.5.items.3', 'Opt out of marketing communications')}`}
                  </Text>
                  <Text data-testid="privacy-section-item-5-4" data-cms-id="pages.privacy.sections.5.items.4" mode={mode}>
                    {`• ${getCMSField(cmsData, 'pages.privacy.sections.5.items.4', 'File a complaint with relevant authorities')}`}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-6">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-6" data-cms-id="pages.privacy.sections.6.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.6.title', '7. Cookies and Tracking')}
                </H4>
                <Text data-testid="privacy-section-content-6" data-cms-id="pages.privacy.sections.6.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.6.content', 'Our website may use cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-7">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-7" data-cms-id="pages.privacy.sections.7.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.7.title', '8. Third-Party Links')}
                </H4>
                <Text data-testid="privacy-section-content-7" data-cms-id="pages.privacy.sections.7.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.7.content', 'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.')}
                </Text>
              </Stack>
            </Box>

            <Box data-testid="privacy-section-8">
              <Stack spacing="md">
                <H4 data-testid="privacy-section-title-8" data-cms-id="pages.privacy.sections.8.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.8.title', '9. Contact Us')}
                </H4>
                <Text data-testid="privacy-section-content-8" data-cms-id="pages.privacy.sections.8.content" mode={mode}>
                  {getCMSField(cmsData, 'pages.privacy.sections.8.content', 'If you have questions about this Privacy Policy or how we handle your information, please contact us: Fairfield Airport Cars, Phone: (203) 555-0123, Email: privacy@fairfieldairportcars.com')}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default function PrivacyPage() {
  return (
    <ToastProvider>
      <PrivacyPageContent />
    </ToastProvider>
  );
}