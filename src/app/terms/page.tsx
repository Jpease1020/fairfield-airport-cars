'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { GridSection, InfoCard } from '@/components/ui';

export default function TermsPage() {
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our transportation services"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📋 Terms of Service"
            description="Effective Date: [Current Date] | Last Updated: [Current Date]"
          >
            <div style={{
              fontSize: 'var(--font-size-sm)',
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}>
              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By using Fairfield Airport Cars transportation services, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>2. Service Description</h3>
                <p>
                  Fairfield Airport Cars provides professional transportation services to and from airports and other destinations 
                  in the Fairfield County, Connecticut area. Our services include scheduled pickups, airport transfers, and 
                  ground transportation.
                </p>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>3. Booking and Payment</h3>
                <ul>
                  <li>All bookings must be made through our official booking system or authorized representatives</li>
                  <li>Payment is required at the time of booking unless otherwise arranged</li>
                  <li>Cancellations must be made at least 2 hours prior to scheduled pickup time</li>
                  <li>Late cancellations may result in charges as outlined in our cancellation policy</li>
                </ul>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>4. Customer Responsibilities</h3>
                <ul>
                  <li>Provide accurate pickup and destination information</li>
                  <li>Be ready at the designated pickup time and location</li>
                  <li>Respect our vehicles and drivers</li>
                  <li>Follow all safety instructions provided by our drivers</li>
                  <li>Pay all fees and charges in accordance with our pricing</li>
                </ul>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>5. Service Standards</h3>
                <p>
                  We strive to provide reliable, professional, and safe transportation services. While we make every effort 
                  to meet scheduled pickup times, we cannot guarantee exact timing due to factors beyond our control such 
                  as traffic, weather, or flight delays.
                </p>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>6. Liability and Insurance</h3>
                <p>
                  Fairfield Airport Cars maintains appropriate commercial insurance coverage. Our liability is limited to 
                  the extent permitted by law. Customers are responsible for their personal belongings during transportation.
                </p>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>7. Privacy Policy</h3>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, 
                  and protect your personal information.
                </p>
              </section>

              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>8. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of our services following 
                  any changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3>9. Contact Information</h3>
                <p>
                  If you have questions about these Terms of Service, please contact us at:
                  <br />
                  <strong>Fairfield Airport Cars</strong>
                  <br />
                  Phone: (203) 555-0123
                  <br />
                  Email: info@fairfieldairportcars.com
                </p>
              </section>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
