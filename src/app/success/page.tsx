'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Booking Confirmed"
        subtitle="Your airport transportation has been successfully booked"
      >
        <section className="content-section">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Booking Confirmed!</h1>
            <p>Thank you for choosing Fairfield Airport Cars. Your booking has been successfully confirmed.</p>
            
            {bookingId && (
              <div className="booking-reference">
                <h2>Your Booking Reference</h2>
                <div className="booking-id">{bookingId}</div>
                <p className="booking-note">Please save this reference number for your records.</p>
              </div>
            )}
            
            <div className="next-steps">
              <h2>What happens next?</h2>
              <ul>
                <li>You'll receive a confirmation email with all booking details</li>
                <li>We'll send you SMS updates about your driver and pickup time</li>
                <li>Our driver will contact you 15 minutes before arrival</li>
                <li>You can manage your booking or contact us if needed</li>
              </ul>
            </div>
            
            <div className="action-buttons">
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
              {bookingId && (
                <Link href={`/booking/${bookingId}`} className="btn btn-outline">
                  View Booking Details
                </Link>
              )}
            </div>
          </div>
        </section>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
