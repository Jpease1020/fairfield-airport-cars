'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  ActionButtonGroup,
  LoadingSpinner,
  Text,
  EditableText,
  EditableHeading,
  Container,
  Span,
  Button
} from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { Booking } from '@/types/booking';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingDetails = useCallback(async () => {
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
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId, fetchBookingDetails]);

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
          <Container>
            <Stack spacing="md">
              <EditableHeading level={2} field="success.loading.title" defaultValue="Loading...">Loading...</EditableHeading>
              <EditableText field="success.loading.cardDescription" defaultValue="Loading your booking details...">Loading your booking details...</EditableText>
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      layoutType="status"
      title="🎉 Booking Confirmed!"
      subtitle="Your booking is confirmed"
    >
      {error && (
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="md">
              <EditableHeading level={3} field="success.error.title" defaultValue="⚠️ Error Loading Booking">⚠️ Error Loading Booking</EditableHeading>
              <EditableText field="success.error.description" defaultValue="Please try refreshing the page or contact support if the problem persists.">Please try refreshing the page or contact support if the problem persists.</EditableText>
            </Stack>
          </Container>
        </GridSection>
      )}

      {/* Success Message */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <Span size="xl">🎉</Span>
            <EditableHeading level={3} field="success.bookingConfirmed.title" defaultValue="Booking Confirmed!">Booking Confirmed!</EditableHeading>
            <EditableText field="success.bookingConfirmed.message" defaultValue="Your ride has been successfully booked. Check your email for confirmation and details.">
              Your ride has been successfully booked. Check your email for confirmation and details.
            </EditableText>
            <Button variant="primary" size="lg" onClick={() => window.location.href = '/'}>
              <EditableText field="success.actions.back_to_home" defaultValue="Back to Home">
                Back to Home
              </EditableText>
            </Button>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      {booking && (
        <GridSection variant="content" columns={2}>
          <Container>
            <Stack spacing="md">
              <EditableHeading level={3} field="success.tripDetails.title" defaultValue="Trip Details">Trip Details</EditableHeading>
              <EditableText field="success.tripDetails.description" defaultValue="Your journey information">Your journey information</EditableText>
              <Text><strong>From:</strong> {booking.pickupLocation}</Text>
              <Text><strong>To:</strong> {booking.dropoffLocation}</Text>
              <Text><strong>When:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</Text>
              <Text><strong>Passengers:</strong> {booking.passengers}</Text>
            </Stack>
          </Container>
          
          <Container>
            <Stack spacing="md">
              <EditableHeading level={3} field="success.paymentStatus.title" defaultValue="💰 Payment Status">💰 Payment Status</EditableHeading>
              <EditableText field="success.paymentStatus.description" defaultValue="Your payment information">Your payment information</EditableText>
              <Text><strong>Total Fare:</strong> ${booking.fare}</Text>
              <Text><strong>Deposit:</strong> ${booking.depositAmount} {booking.depositPaid ? '✅ Paid' : '⏳ Pending'}</Text>
              <Text><strong>Balance Due:</strong> ${booking.balanceDue || 0}</Text>
            </Stack>
          </Container>
        </GridSection>
      )}

      {/* Next Steps */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md">
            <EditableHeading level={3} field="success.nextSteps.title" defaultValue="📋 What Happens Next?">📋 What Happens Next?</EditableHeading>
            <EditableText field="success.nextSteps.description" defaultValue="Here's what you can expect from us">Here's what you can expect from us</EditableText>
            <Stack spacing="sm">
              <EditableText field="success.nextSteps.items.0" defaultValue="📧 You&apos;ll receive a confirmation email with all booking details">📧 You&apos;ll receive a confirmation email with all booking details</EditableText>
              <EditableText field="success.nextSteps.items.1" defaultValue="📱 We'll send you SMS updates about your driver and pickup time">📱 We&apos;ll send you SMS updates about your driver and pickup time</EditableText>
              <EditableText field="success.nextSteps.items.2" defaultValue="👨‍💼 Your driver will contact you 30 minutes before pickup">👨‍💼 Your driver will contact you 30 minutes before pickup</EditableText>
              <EditableText field="success.nextSteps.items.3" defaultValue="✈️ We monitor your flight for any delays or changes">✈️ We monitor your flight for any delays or changes</EditableText>
            </Stack>

            <ActionButtonGroup buttons={successActions} />
          </Stack>
        </Container>
      </GridSection>

      {/* Emergency Contact */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md">
            <EditableHeading level={3} field="success.emergencyContact.title" defaultValue="🆘 Need Help?">🆘 Need Help?</EditableHeading>
            <EditableText field="success.emergencyContact.description" defaultValue="Contact us anytime if you have questions or need to make changes">Contact us anytime if you have questions or need to make changes</EditableText>
            <EditableText field="success.emergencyContact.phone" defaultValue="📞 (203) 555-0123">📞 (203) 555-0123</EditableText>
            <EditableText field="success.emergencyContact.message" defaultValue="Save this number! Our drivers are available to assist you.">Save this number! Our drivers are available to assist you.</EditableText>
          </Stack>
        </Container>
      </GridSection>
    </UnifiedLayout>
  );
}

function SuccessPage() {
  return (
    <Suspense fallback={
      <UnifiedLayout 
        layoutType="status"
        title="Loading..."
        subtitle="Please wait"
      >
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="md">
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </UnifiedLayout>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

export default SuccessPage;
