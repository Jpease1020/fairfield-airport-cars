import { StandardLayout } from '@/components/layout/StandardLayout';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <StandardLayout 
      title="Booking Cancelled"
      subtitle="Your booking has been cancelled"
    >

      <div className="cancel-content">
        <section className="cancel-section">
          <div className="cancel-message">
            <h2>Booking Cancelled</h2>
            <p>Your booking has been successfully cancelled.</p>
            
            <div className="cancel-details">
              <h3>Cancellation Details</h3>
              <ul>
                <li>Your payment has been refunded (if applicable)</li>
                <li>You&apos;ll receive a confirmation email</li>
                <li>No further charges will be made</li>
              </ul>
            </div>
            
            <div className="cancel-actions">
              <a href="/book" className="btn btn-primary">Book a New Ride</a>
              <Link href="/" className="btn btn-outline">Return to Home</Link>
            </div>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
