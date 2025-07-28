'use client';

import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  Container,
  EditableText
} from '@/components/ui';

function TermsPageContent() {
  return (
    <UnifiedLayout 
      layoutType="content"
      title="Terms of Service"
      subtitle="Our terms and conditions"
      description="Please review our terms of service for using Fairfield Airport Cars transportation services."
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📋 Terms of Service"
          description="Effective Date: January 1, 2024"
        >
          <Container>
            <EditableText field="terms.title" defaultValue="Terms of Service">
              Terms of Service
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.lastUpdated" defaultValue="Last updated: January 2024">
              Last updated: January 2024
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.intro" defaultValue="Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.">
              Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.serviceDescription" defaultValue="We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.">
              We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.booking" defaultValue="Booking">
              Booking
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.bookingDesc" defaultValue="All bookings must be made through our website or by phone. We require at least 24 hours notice for all reservations.">
              All bookings must be made through our website or by phone. We require at least 24 hours notice for all reservations.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.payment" defaultValue="Payment">
              Payment
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.paymentDesc" defaultValue="Payment is processed through Square. We accept all major credit cards and digital payments.">
              Payment is processed through Square. We accept all major credit cards and digital payments.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.cancellation" defaultValue="Cancellation Policy">
              Cancellation Policy
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.cancellationDesc" defaultValue="Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup.">
              Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.liability" defaultValue="Liability">
              Liability
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.liabilityDesc" defaultValue="We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals.">
              We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals.
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.contact" defaultValue="Contact">
              Contact
            </EditableText>
          </Container>

          <Container>
            <EditableText field="terms.contactDesc" defaultValue="For questions about these terms, please contact us at the information provided on our website.">
              For questions about these terms, please contact us at the information provided on our website.
            </EditableText>
          </Container>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function TermsPage() {
  return (
    <ToastProvider>
      <TermsPageContent />
    </ToastProvider>
  );
}
