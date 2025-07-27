'use client';

import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  H3,
  Text
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
            <section>
              <H3>1. Information We Collect</H3>
              <Text>
                We collect information you provide directly to us when you book our services, including:
              </Text>
              <ul>
                <li>Name and contact information (phone, email, address)</li>
                <li>Pickup and destination locations</li>
                <li>Travel dates and times</li>
                <li>Flight information (when applicable)</li>
                <li>Payment information</li>
                <li>Special requests or preferences</li>
              </ul>
            </section>

            <section>
              <H3>2. How We Use Your Information</H3>
              <Text>We use the information we collect to:</Text>
              <ul>
                <li>Provide and coordinate transportation services</li>
                <li>Process payments and send confirmations</li>
                <li>Communicate with you about your bookings</li>
                <li>Send service updates and notifications</li>
                <li>Improve our services and customer experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <H3>3. Information Sharing</H3>
              <Text>
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </Text>
              <ul>
                <li>With our drivers to coordinate your transportation</li>
                <li>With payment processors to handle transactions</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <H3>4. Data Security</H3>
              <Text>
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. This includes:
              </Text>
              <ul>
                <li>Encrypted data transmission</li>
                <li>Secure payment processing</li>
                <li>Limited access to personal information</li>
                <li>Regular security assessments</li>
              </ul>
            </section>

            <section>
              <H3>5. Data Retention</H3>
              <Text>
                We retain your personal information for as long as necessary to provide our services and comply 
                with legal obligations. Booking information is typically retained for accounting and customer 
                service purposes.
              </Text>
            </section>

            <section>
              <H3>6. Your Rights</H3>
              <Text>You have the right to:</Text>
              <ul>
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Opt out of marketing communications</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </section>

            <section>
              <H3>7. Cookies and Tracking</H3>
              <Text>
                Our website may use cookies and similar technologies to improve your browsing experience, 
                remember your preferences, and analyze website traffic. You can control cookie settings 
                through your browser.
              </Text>
            </section>

            <section>
              <H3>8. Third-Party Links</H3>
              <Text>
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices of these external sites. We encourage you to review their privacy policies.
              </Text>
            </section>

            <section>
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
            </section>
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
