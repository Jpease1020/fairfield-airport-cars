'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  LoadingSpinner
} from '@/components/ui';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/get-booking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        setError('Could not load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  const successActions = [
    {
      label: 'View Booking Details',
      onClick: () => window.location.href = `/booking/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'outline' as const,
      icon: '🚗'
    },
    {
      label: 'Contact Support',
      onClick: () => window.location.href = '/help',
      variant: 'outline' as const,
      icon: '📞'
    }
  ];

  if (loading) {
    return (
      <UnifiedLayout 
        layoutType="status"
        title="Processing..."
        subtitle="Loading your booking confirmation"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="Loading..."
            description="Loading your booking details..."
          >
            <LoadingSpinner size="lg" />
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      layoutType="status"
      title="🎉 Booking Confirmed!"
      subtitle={booking?.depositPaid ? "Payment successful - You're all set!" : "Your booking is confirmed"}
    >
      {error && (
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="⚠️ Error Loading Booking"
            description={error}
          >
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </InfoCard>
        </GridSection>
      )}

      {/* Success Message */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={booking?.depositPaid ? "✅ Payment Successful!" : "📝 Booking Created!"}
          description={booking?.depositPaid 
            ? "Your deposit has been processed and your ride is confirmed"
            : "Your booking has been created. Payment can be completed before your ride"
          }
        >
          <ActionButtonGroup buttons={successActions} />
        </InfoCard>
      </GridSection>

      {/* Booking Details */}
      {booking && (
        <GridSection variant="content" columns={2}>
          <InfoCard
            title="🚗 Trip Details"
            description="Your journey information"
          >
            <p><strong>From:</strong> {booking.pickupLocation}</p>
            <p><strong>To:</strong> {booking.dropoffLocation}</p>
            <p><strong>When:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</p>
            <p><strong>Passengers:</strong> {booking.passengers}</p>
          </InfoCard>
          
          <InfoCard
            title="💰 Payment Status"
            description="Your payment information"
          >
            <p><strong>Total Fare:</strong> ${booking.fare}</p>
            <p><strong>Deposit:</strong> ${booking.depositAmount} {booking.depositPaid ? '✅ Paid' : '⏳ Pending'}</p>
            <p><strong>Balance Due:</strong> ${booking.balanceDue || 0}</p>
          </InfoCard>
        </GridSection>
      )}

      {/* Next Steps */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📋 What Happens Next?"
          description="Here's what you can expect from us"
        >
          <ul>
            <li>📧 You&apos;ll receive a confirmation email with all booking details</li>
            <li>📱 We&apos;ll send you SMS updates about your driver and pickup time</li>
            <li>👨‍💼 Your driver will contact you 30 minutes before pickup</li>
            <li>✈️ We monitor your flight for any delays or changes</li>
          </ul>

          <ActionButtonGroup buttons={successActions} />
        </InfoCard>
      </GridSection>

      {/* Emergency Contact */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🆘 Need Help?"
          description="Contact us anytime if you have questions or need to make changes"
        >
          <p>📞 (203) 555-0123</p>
          <p>Save this number! Our drivers are available to assist you.</p>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default SuccessPageContent;
