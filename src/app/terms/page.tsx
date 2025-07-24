import { StandardLayout } from '@/components/layout/StandardLayout';

export default function TermsPage() {
  return (
    <StandardLayout 
      title="Terms of Service"
      subtitle="Our terms and conditions"
    >

      <div className="legal-content">
        <section className="legal-section">
          <h2>Terms and Conditions</h2>
          <p>By using our service, you agree to the following terms and conditions:</p>
          
          <div className="legal-content">
            <h3>1. Booking and Cancellation</h3>
            <p>Bookings must be made at least 24 hours in advance. Cancellations within 12 hours of pickup time are non-refundable.</p>
            
            <h3>2. Service Standards</h3>
            <p>We strive to provide reliable, professional service. Drivers will arrive on time and maintain clean, well-maintained vehicles.</p>
            
            <h3>3. Payment</h3>
            <p>Payment is due at the time of booking. We accept all major credit cards and cash payments.</p>
            
            <h3>4. Liability</h3>
            <p>We are fully insured and licensed. However, we are not responsible for delays due to weather, traffic, or other circumstances beyond our control.</p>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
