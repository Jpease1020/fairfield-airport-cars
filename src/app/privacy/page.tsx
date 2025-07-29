'use client';

import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  ToastProvider,
  Text,
  Container,
  Stack,
  EditableText,
  EditableHeading,
  Card,
  CardBody
} from '@/components/ui';

function PrivacyPageContent() {
  const privacySections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you book our services, including:",
      items: [
        "Name and contact information (phone, email, address)",
        "Pickup and destination locations",
        "Travel dates and times",
        "Flight information (when applicable)",
        "Payment information",
        "Special requests or preferences"
      ]
    },
    {
      title: "2. How We Use Information",
      content: "We use the information we collect to:",
      items: [
        "Provide and coordinate transportation services",
        "Process payments and send confirmations",
        "Communicate with you about your bookings",
        "Send service updates and notifications",
        "Improve our services and customer experience",
        "Comply with legal obligations"
      ]
    },
    {
      title: "3. Information Sharing",
      content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:",
      items: [
        "With our drivers to coordinate your transportation",
        "With payment processors to handle transactions",
        "When required by law or legal process",
        "To protect our rights, property, or safety",
        "With your explicit consent"
      ]
    },
    {
      title: "4. Data Security",
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:",
      items: [
        "Encrypted data transmission",
        "Secure payment processing",
        "Limited access to personal information",
        "Regular security assessments"
      ]
    },
    {
      title: "5. Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking information is typically retained for accounting and customer service purposes."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to:",
      items: [
        "Access and review your personal information",
        "Request corrections to inaccurate information",
        "Request deletion of your information (subject to legal requirements)",
        "Opt out of marketing communications",
        "File a complaint with relevant authorities"
      ]
    },
    {
      title: "7. Cookies and Tracking",
      content: "Our website may use cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser."
    },
    {
      title: "8. Third-Party Links",
      content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies."
    },
    {
      title: "9. Contact Us",
      content: "If you have questions about this Privacy Policy or how we handle your information, please contact us: Fairfield Airport Cars, Phone: (203) 555-0123, Email: privacy@fairfieldairportcars.com"
    }
  ];

  return (
    <UnifiedLayout 
      layoutType="content"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information"
      description="Your privacy is important to us. Learn how we protect your information."
    >
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" gap="xl">
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="privacy-title" level={3} field="privacy.title" defaultValue="🔒 Privacy Policy">🔒 Privacy Policy</EditableHeading>
              <EditableText data-testid="privacy-effective-date" field="privacy.effectiveDate" defaultValue="Effective Date: January 1, 2024 | Last Updated: January 1, 2024">
                Effective Date: January 1, 2024 | Last Updated: January 1, 2024
              </EditableText>
            </Stack>
            
            <Stack data-testid="privacy-sections-list" spacing="lg">
              {privacySections.map((section, index) => (
                <Card key={index} data-testid={`privacy-section-${index}`}>
                  <CardBody>
                    <Stack spacing="md">
                      <EditableHeading data-testid={`privacy-section-title-${index}`} level={4} field={`privacy.sections.${index}.title`} defaultValue={section.title}>
                        {section.title}
                      </EditableHeading>
                      <EditableText data-testid={`privacy-section-content-${index}`} field={`privacy.sections.${index}.content`} defaultValue={section.content}>
                        {section.content}
                      </EditableText>
                      {section.items && (
                        <Stack data-testid={`privacy-section-items-${index}`} spacing="sm">
                          {section.items.map((item, itemIndex) => (
                            <Text key={itemIndex} data-testid={`privacy-section-item-${index}-${itemIndex}`}>
                              <EditableText field={`privacy.sections.${index}.items.${itemIndex}`} defaultValue={item}>
                                • {item}
                              </EditableText>
                            </Text>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
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