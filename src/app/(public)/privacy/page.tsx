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
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function PrivacyPageContent() {
  const { cmsData } = useCMSData();
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
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center" data-testid="privacy-title">
              {getCMSField(cmsData, 'privacy.title', '🔒 Privacy Policy')}
            </H1>
            <Text variant="lead" align="center" size="lg" data-testid="privacy-effective-date">
              {getCMSField(cmsData, 'privacy.effectiveDate', 'Effective Date: January 1, 2024 | Last Updated: January 1, 2024')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <Stack data-testid="privacy-sections-list" spacing="lg">
              {privacySections.map((section, index) => (
                <Box key={index} data-testid={`privacy-section-${index}`}>
                  <Stack spacing="md">
                    <H4 data-testid={`privacy-section-title-${index}`}>
                      {getCMSField(cmsData, `privacy.sections.${index}.title`, section.title)}
                    </H4>
                    <Text data-testid={`privacy-section-content-${index}`}>
                      {getCMSField(cmsData, `privacy.sections.${index}.content`, section.content)}
                    </Text>
                    {section.items && (
                      <Stack data-testid={`privacy-section-items-${index}`} spacing="sm">
                         {section.items.map((item, itemIndex) => (
                           <Text key={itemIndex} data-testid={`privacy-section-item-${index}-${itemIndex}`}>
                             {`• ${getCMSField(cmsData, `privacy.sections.${index}.items.${itemIndex}` , item)}`}
                           </Text>
                         ))}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              ))}
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