'use client';

import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  H3,
  Text,
  Container,
  Stack,
  EditableText
} from '@/components/ui';

function PrivacyPageContent() {
  return (
    <UnifiedLayout 
      layoutType="content"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information"
      description="Your privacy is important to us. Learn how we protect your information."
    >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🔒 Privacy Policy"
            description="Effective Date: January 1, 2024 | Last Updated: January 1, 2024"
          >
            <Container>
              <H3>1. Information We Collect</H3>
              <Text>
                We collect information you provide directly to us when you book our services, including:
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>Name and contact information (phone, email, address)</Container>
                <Container>Pickup and destination locations</Container>
                <Container>Travel dates and times</Container>
                <Container>Flight information (when applicable)</Container>
                <Container>Payment information</Container>
                <Container>Special requests or preferences</Container>
              </Stack>
            </Container>

            <Container>
              <EditableText field="privacy.howWeUse.title" defaultValue="We use the information we collect to:">
                We use the information we collect to:
              </EditableText>
              <Stack spacing="sm" direction="vertical">
                <Container>Provide and coordinate transportation services</Container>
                <Container>Process payments and send confirmations</Container>
                <Container>Communicate with you about your bookings</Container>
                <Container>Send service updates and notifications</Container>
                <Container>Improve our services and customer experience</Container>
                <Container>Comply with legal obligations</Container>
              </Stack>
            </Container>

            <Container>
              <H3>3. Information Sharing</H3>
              <Text>
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>With our drivers to coordinate your transportation</Container>
                <Container>With payment processors to handle transactions</Container>
                <Container>When required by law or legal process</Container>
                <Container>To protect our rights, property, or safety</Container>
                <Container>With your explicit consent</Container>
              </Stack>
            </Container>

            <Container>
              <H3>4. Data Security</H3>
              <Text>
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. This includes:
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>Encrypted data transmission</Container>
                <Container>Secure payment processing</Container>
                <Container>Limited access to personal information</Container>
                <Container>Regular security assessments</Container>
              </Stack>
            </Container>

            <Container>
              <H3>5. Data Retention</H3>
              <Text>
                We retain your personal information for as long as necessary to provide our services and comply 
                with legal obligations. Booking information is typically retained for accounting and customer 
                service purposes.
              </Text>
            </Container>

            <Container>
              <EditableText field="privacy.yourRights.title" defaultValue="You have the right to:">
                You have the right to:
              </EditableText>
              <Stack spacing="sm" direction="vertical">
                <Container>Access and review your personal information</Container>
                <Container>Request corrections to inaccurate information</Container>
                <Container>Request deletion of your information (subject to legal requirements)</Container>
                <Container>Opt out of marketing communications</Container>
                <Container>File a complaint with relevant authorities</Container>
              </Stack>
            </Container>

            <Container>
              <H3>7. Cookies and Tracking</H3>
              <Text>
                Our website may use cookies and similar technologies to improve your browsing experience, 
                remember your preferences, and analyze website traffic. You can control cookie settings 
                through your browser.
              </Text>
            </Container>

            <Container>
              <H3>8. Third-Party Links</H3>
              <Text>
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices of these external sites. We encourage you to review their privacy policies.
              </Text>
            </Container>

            <Container>
              <H3>9. Contact Us</H3>
              <Text>
                If you have questions about this Privacy Policy or how we handle your information, please contact us:
                <br />
                <strong>Fairfield Airport Cars</strong>
                <br />
                Phone: (203) 555-0123
                <br />
                Email: privacy@fairfieldairportcars.com
                <br />
                Address: [Business Address]
              </Text>
            </Container>
          </InfoCard>
        </GridSection>
    </UnifiedLayout>
  );
}

export default function PrivacyPage() {
  return (
    <ToastProvider>
      <PrivacyPageContent />
    </ToastProvider>
  );
}
