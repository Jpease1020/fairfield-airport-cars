'use client';

import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  H3,
  Text
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
          <section>
            <H3>1. Service Agreement</H3>
            <Text>
              By using Fairfield Airport Cars transportation services, you agree to be bound by these terms of service. 
              Our services are provided subject to your acceptance of and compliance with these terms.
            </Text>
          </section>

          <section>
            <H3>2. Booking and Payment</H3>
            <Text>
              All bookings must be made through our official booking system. Payment is required at the time of booking. 
              We accept major credit cards and process payments securely through our payment partners.
            </Text>
          </section>

          <section>
            <H3>3. Cancellation Policy</H3>
            <Text>
              Bookings may be cancelled up to 4 hours before the scheduled pickup time for a full refund. 
              Cancellations made within 4 hours of pickup time may be subject to a cancellation fee.
            </Text>
          </section>

          <section>
            <H3>4. Liability and Insurance</H3>
            <Text>
              Fairfield Airport Cars maintains comprehensive commercial insurance coverage. 
              Our liability is limited to the extent permitted by law. Passengers are responsible for their personal belongings.
            </Text>
          </section>

          <section>
            <H3>5. Contact Information</H3>
            <Text>
              For questions about these terms, please contact us at (203) 555-0123 or 
              email support@fairfieldairportcars.com.
            </Text>
          </section>
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
