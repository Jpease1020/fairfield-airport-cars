'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  LoadingSpinner,
  Text
} from '@/components/ui';
import { Booking } from '@/types/booking';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const successActions = [
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚗'
    },
    {
      label: 'View My Booking',
      onClick: () => window.location.href = `/booking/${bookingId}`,
      variant: 'secondary' as const,
      icon: '📋'
    },
    {
      label: 'Contact Support',
      onClick: () => window.location.href = '/help',
      variant: 'outline' as const,
      icon: '💬'
    }
  ];

  if (loading) {
    return (
      <UnifiedLayout 
        layoutType="status"
        title="Loading..."
        subtitle="Please wait while we load your booking details"
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
            <Text>Please try refreshing the page or contact support if the problem persists.</Text>
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
            <Text><strong>From:</strong> {booking.pickupLocation}</Text>
            <Text><strong>To:</strong> {booking.dropoffLocation}</Text>
            <Text><strong>When:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</Text>
            <Text><strong>Passengers:</strong> {booking.passengers}</Text>
          </InfoCard>
          
          <InfoCard
            title="💰 Payment Status"
            description="Your payment information"
          >
            <Text><strong>Total Fare:</strong> ${booking.fare}</Text>
            <Text><strong>Deposit:</strong> ${booking.depositAmount} {booking.depositPaid ? '✅ Paid' : '⏳ Pending'}</Text>
            <Text><strong>Balance Due:</strong> ${booking.balanceDue || 0}</Text>
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
          <Text>📞 (203) 555-0123</Text>
          <Text>Save this number! Our drivers are available to assist you.</Text>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default SuccessPageContent;
