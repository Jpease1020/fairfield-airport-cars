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
              <H3>
                <EditableText field="privacy.informationWeCollect.title" defaultValue="1. Information We Collect">
                  1. Information We Collect
                </EditableText>
              </H3>
              <Text>
                <EditableText field="privacy.informationWeCollect.description" defaultValue="We collect information you provide directly to us when you book our services, including:">
                  We collect information you provide directly to us when you book our services, including:
                </EditableText>
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>
                  <EditableText field="privacy.informationWeCollect.name" defaultValue="Name and contact information (phone, email, address)">
                    Name and contact information (phone, email, address)
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationWeCollect.locations" defaultValue="Pickup and destination locations">
                    Pickup and destination locations
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationWeCollect.travel" defaultValue="Travel dates and times">
                    Travel dates and times
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationWeCollect.flight" defaultValue="Flight information (when applicable)">
                    Flight information (when applicable)
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationWeCollect.payment" defaultValue="Payment information">
                    Payment information
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationWeCollect.preferences" defaultValue="Special requests or preferences">
                    Special requests or preferences
                  </EditableText>
                </Container>
              </Stack>
            </Container>

            <Container>
              <EditableText field="privacy.howWeUse.title" defaultValue="We use the information we collect to:">
                <Stack spacing="sm" direction="vertical">
                  <Container>
                    <EditableText field="privacy.howWeUse.provide" defaultValue="Provide and coordinate transportation services">
                      Provide and coordinate transportation services
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.howWeUse.process" defaultValue="Process payments and send confirmations">
                      Process payments and send confirmations
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.howWeUse.communicate" defaultValue="Communicate with you about your bookings">
                      Communicate with you about your bookings
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.howWeUse.send" defaultValue="Send service updates and notifications">
                      Send service updates and notifications
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.howWeUse.improve" defaultValue="Improve our services and customer experience">
                      Improve our services and customer experience
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.howWeUse.comply" defaultValue="Comply with legal obligations">
                      Comply with legal obligations
                    </EditableText>
                  </Container>
                </Stack>
              </EditableText>
            </Container>

            <Container>
              <H3>
                <EditableText field="privacy.informationSharing.title" defaultValue="3. Information Sharing">
                  3. Information Sharing
                </EditableText>
              </H3>
              <Text>
                <EditableText field="privacy.informationSharing.description" defaultValue="We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </EditableText>
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>
                  <EditableText field="privacy.informationSharing.drivers" defaultValue="With our drivers to coordinate your transportation">
                    With our drivers to coordinate your transportation
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationSharing.payment" defaultValue="With payment processors to handle transactions">
                    With payment processors to handle transactions
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationSharing.law" defaultValue="When required by law or legal process">
                    When required by law or legal process
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationSharing.protect" defaultValue="To protect our rights, property, or safety">
                    To protect our rights, property, or safety
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.informationSharing.consent" defaultValue="With your explicit consent">
                    With your explicit consent
                  </EditableText>
                </Container>
              </Stack>
            </Container>

            <Container>
              <H3>4. Data Security</H3>
              <Text>
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. This includes:
              </Text>
              <Stack spacing="sm" direction="vertical">
                <Container>
                  <EditableText field="privacy.dataSecurity.encrypted" defaultValue="Encrypted data transmission">
                    Encrypted data transmission
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.dataSecurity.secure" defaultValue="Secure payment processing">
                    Secure payment processing
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.dataSecurity.limited" defaultValue="Limited access to personal information">
                    Limited access to personal information
                  </EditableText>
                </Container>
                <Container>
                  <EditableText field="privacy.dataSecurity.regular" defaultValue="Regular security assessments">
                    Regular security assessments
                  </EditableText>
                </Container>
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
                <Stack spacing="sm" direction="vertical">
                  <Container>
                    <EditableText field="privacy.yourRights.access" defaultValue="Access and review your personal information">
                      Access and review your personal information
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.yourRights.correct" defaultValue="Request corrections to inaccurate information">
                      Request corrections to inaccurate information
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.yourRights.delete" defaultValue="Request deletion of your information (subject to legal requirements)">
                      Request deletion of your information (subject to legal requirements)
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.yourRights.optOut" defaultValue="Opt out of marketing communications">
                      Opt out of marketing communications
                    </EditableText>
                  </Container>
                  <Container>
                    <EditableText field="privacy.yourRights.fileComplaint" defaultValue="File a complaint with relevant authorities">
                      File a complaint with relevant authorities
                    </EditableText>
                  </Container>
                </Stack>
              </EditableText>
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
