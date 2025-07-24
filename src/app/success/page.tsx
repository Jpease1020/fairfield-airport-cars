import { StandardLayout } from '@/components/layout/StandardLayout';

export default function SuccessPage() {
  return (
    <StandardLayout 
      title="Payment Successful"
      subtitle="Your booking has been confirmed"
    >

      <div className="success-content">
        <section className="success-section">
          <div className="success-message">
            <h2>🎉 Payment Successful!</h2>
            <p>Your booking has been confirmed and payment processed successfully.</p>
            
            <div className="success-details">
              <h3>What happens next?</h3>
              <ul>
                <li>You'll receive a confirmation email with booking details</li>
                <li>We'll send you an SMS reminder 24 hours before pickup</li>
                <li>Your driver will contact you 30 minutes before pickup</li>
              </ul>
            </div>
            
            <div className="success-actions">
              <a href="/portal" className="btn btn-primary">View Booking Details</a>
              <a href="/" className="btn btn-outline">Return to Home</a>
            </div>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
