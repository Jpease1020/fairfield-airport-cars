'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

export default function HelpPage() {
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Help Center"
        subtitle="Get answers to frequently asked questions about our airport transportation service"
      >
        <section className="content-section">
          <div className="help-content">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-section">
              <div className="faq-item">
                <h3>How do I book a ride?</h3>
                <p>You can book a ride through our online booking system. Simply select your pickup and drop-off locations, choose your date and time, and complete the payment process.</p>
              </div>
              
              <div className="faq-item">
                <h3>What areas do you serve?</h3>
                <p>We provide transportation services throughout Fairfield County, CT and surrounding areas to all major airports including JFK, LaGuardia, Newark, and Bradley.</p>
              </div>
              
              <div className="faq-item">
                <h3>How much does it cost?</h3>
                <p>Our rates vary based on distance and destination. You can get an instant quote during the booking process before confirming your reservation.</p>
              </div>
              
              <div className="faq-item">
                <h3>Can I cancel or modify my booking?</h3>
                <p>Yes, you can cancel or modify your booking up to 2 hours before your scheduled pickup time. Contact us directly or use the manage booking feature.</p>
              </div>
              
              <div className="faq-item">
                <h3>What payment methods do you accept?</h3>
                <p>We accept all major credit cards including Visa, MasterCard, American Express, and Discover. Payment is processed securely through our online system.</p>
              </div>
              
              <div className="faq-item">
                <h3>How do I contact customer support?</h3>
                <p>You can reach our customer support team by phone, email, or through our contact form. We're available 24/7 for any questions or assistance.</p>
              </div>
            </div>
          </div>
        </section>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
