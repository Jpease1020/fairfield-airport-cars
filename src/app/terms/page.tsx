'use client';

import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  InfoCard,
  ToastProvider,
  useToast
} from '@/components/ui';

function TermsPageContent() {
  const { addToast } = useToast();

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
          <div style={{
            fontSize: 'var(--font-size-base)',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            padding: 'var(--spacing-lg) 0'
          }}>
            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-md)' }}>
                1. Service Agreement
              </h3>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                By using Fairfield Airport Cars transportation services, you agree to be bound by these terms of service. 
                Our services are provided subject to your acceptance of and compliance with these terms.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-md)' }}>
                2. Booking and Payment
              </h3>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                All bookings must be made through our official booking system. Payment is required at the time of booking. 
                We accept major credit cards and process payments securely through our payment partners.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-md)' }}>
                3. Cancellation Policy
              </h3>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                Bookings may be cancelled up to 4 hours before the scheduled pickup time for a full refund. 
                Cancellations made within 4 hours of pickup time may be subject to a cancellation fee.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-md)' }}>
                4. Liability and Insurance
              </h3>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                Fairfield Airport Cars maintains comprehensive commercial insurance coverage. 
                Our liability is limited to the extent permitted by law. Passengers are responsible for their personal belongings.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-md)' }}>
                5. Contact Information
              </h3>
              <p style={{ margin: 0 }}>
                For questions about these terms, please contact us at (203) 555-0123 or 
                email support@fairfieldairportcars.com.
              </p>
            </section>
          </div>
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
