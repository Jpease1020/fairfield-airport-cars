'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StandardLayout } from '@/components/layout/StandardLayout';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="success-content">
      <section className="success-section">
        <div className="success-message">
          <h2>🎉 Booking Confirmed!</h2>
          <p>Your airport transportation has been successfully booked.</p>
          
          {bookingId && (
            <div className="booking-id">
              <h3>Booking Reference</h3>
              <p className="booking-id-display">{bookingId}</p>
              <p className="booking-id-note">Please save this reference number for your records.</p>
            </div>
          )}
          
          <div className="success-details">
            <h3>What happens next?</h3>
            <ul>
              <li>You&apos;ll receive a confirmation email with booking details</li>
              <li>We&apos;ll send you an SMS reminder 24 hours before pickup</li>
              <li>Your driver will contact you 30 minutes before pickup</li>
              <li>Payment will be processed securely</li>
            </ul>
          </div>
          
          <div className="success-actions">
            {bookingId && (
              <Link href={`/portal?bookingId=${bookingId}`} className="btn btn-primary">
                View Booking Details
              </Link>
            )}
            <Link href="/" className="btn btn-outline">Return to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <StandardLayout 
      title="Payment Successful"
      subtitle="Your booking has been confirmed"
    >
      <Suspense fallback={
        <div className="success-content">
          <section className="success-section">
            <div className="success-message">
              <h2>🎉 Booking Confirmed!</h2>
              <p>Your airport transportation has been successfully booked.</p>
              <div className="success-actions">
                <Link href="/" className="btn btn-outline">Return to Home</Link>
              </div>
            </div>
          </section>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </StandardLayout>
  );
}
