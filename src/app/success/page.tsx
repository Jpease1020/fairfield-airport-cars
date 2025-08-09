'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  GridSection,
  LoadingSpinner,
  Text,
  Container,
  Span,
  Button,
  Stack,
  
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
import { Booking } from '@/types/booking';

function SuccessPageContent() {
  const { cmsData } = useCMSData();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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
    setIsClient(true);
    fetchBookingDetails();
  }, [bookingId, fetchBookingDetails]);

  const successActions = [
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
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

  if (!isClient) {
    return (
      <>
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner size="lg" />
              <Text>Initializing...</Text>
            </Stack>
          </Container>
        </GridSection>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg"   align="center">
              <Text data-testid="success-loading-title" weight="bold">
                {getCMSField(cmsData, 'success.loading.title', 'Loading...')}
              </Text>
              <Text data-testid="success-loading-description">
                {getCMSField(cmsData, 'success.loading.description', 'Loading your booking details...')}
              </Text>
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </>
    );
  }

  return (
    <>
      {error && (
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg"  >
                <Stack spacing="md" align="center">
                  <Text data-testid="success-error-title" weight="bold">
                    {getCMSField(cmsData, 'success.error.title', '⚠️ Error Loading Booking')}
                  </Text>
                  <Text data-testid="success-error-description">
                    {getCMSField(cmsData, 'success.error.description', 'Please try refreshing the page or contact support if the problem persists.')}
                  </Text>
                </Stack>
            </Stack>
          </Container>
        </GridSection>
      )}

      {/* Success Message */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"   align="center">
            <Span data-testid="success-icon" size="xl">🎉</Span>
            <Stack spacing="md" align="center">
              <Text data-testid="success-booking-confirmed-title" weight="bold">
                {getCMSField(cmsData, 'success.bookingConfirmed.title', 'Booking Confirmed!')}
              </Text>
              <Text data-testid="success-booking-confirmed-message">
                {getCMSField(cmsData, 'success.bookingConfirmed.message', 'Your ride has been successfully booked. Check your email for confirmation and details.')}
              </Text>
            </Stack>
            <Button data-testid="success-back-home-button" variant="primary" size="lg" onClick={() => window.location.href = '/'}>
              {getCMSField(cmsData, 'success.actions.back_to_home', 'Back to Home')}
            </Button>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      {booking && (
        <GridSection variant="content" columns={2}>
          <Container>
            <Stack spacing="lg"  >
              <Stack spacing="md" align="center">
                <Text data-testid="success-trip-details-title" weight="bold">
                  {getCMSField(cmsData, 'success.tripDetails.title', 'Trip Details')}
                </Text>
                <Text data-testid="success-trip-details-description">
                  {getCMSField(cmsData, 'success.tripDetails.description', 'Your journey information')}
                </Text>
              </Stack>
              <Stack data-testid="success-trip-details-list" spacing="sm">
                <Text data-testid="success-pickup-location"><strong>From:</strong> {booking.pickupLocation}</Text>
                <Text data-testid="success-dropoff-location"><strong>To:</strong> {booking.dropoffLocation}</Text>
                <Text data-testid="success-pickup-time"><strong>When:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</Text>
                <Text data-testid="success-passengers"><strong>Passengers:</strong> {booking.passengers}</Text>
              </Stack>
            </Stack>
          </Container>
          
          <Container>
            <Stack spacing="lg"  >
              <Stack spacing="md" align="center">
                <Text data-testid="success-payment-status-title" weight="bold">
                  {getCMSField(cmsData, 'success.paymentStatus.title', '💰 Payment Status')}
                </Text>
                <Text data-testid="success-payment-status-description">
                  {getCMSField(cmsData, 'success.paymentStatus.description', 'Your payment information')}
                </Text>
              </Stack>
              <Stack data-testid="success-payment-details" spacing="sm">
                <Text data-testid="success-total-fare"><strong>Total Fare:</strong> ${booking.fare}</Text>
                <Text data-testid="success-deposit"><strong>Deposit:</strong> ${booking.depositAmount} {booking.depositPaid ? '✅ Paid' : '⏳ Pending'}</Text>
                <Text data-testid="success-balance-due"><strong>Balance Due:</strong> ${booking.balanceDue || 0}</Text>
              </Stack>
            </Stack>
          </Container>
        </GridSection>
      )}

      {/* Next Steps */}
      <GridSection variant="content" columns={1}>
        <Container>
            <Stack spacing="lg"  >
              <Stack spacing="md" align="center">
                <Text data-testid="success-next-steps-title" weight="bold">
                  {getCMSField(cmsData, 'success.nextSteps.title', '📋 What Happens Next?')}
                </Text>
                <Text data-testid="success-next-steps-description">
                  {getCMSField(cmsData, 'success.nextSteps.description', "Here's what you can expect from us")}
                </Text>
              </Stack>
            
            <Stack data-testid="success-next-steps-list" spacing="md">
              <Text data-testid="success-next-step-email">{getCMSField(cmsData, 'success.nextSteps.items.0', "📧 You'll receive a confirmation email with all booking details")}</Text>
              <Text data-testid="success-next-step-sms">{getCMSField(cmsData, 'success.nextSteps.items.1', "📱 We'll send you SMS updates about your driver and pickup time")}</Text>
              <Text data-testid="success-next-step-driver">{getCMSField(cmsData, 'success.nextSteps.items.2', '👨‍💼 Your driver will contact you 30 minutes before pickup')}</Text>
              <Text data-testid="success-next-step-flight">{getCMSField(cmsData, 'success.nextSteps.items.3', '✈️ We monitor your flight for any delays or changes')}</Text>
            </Stack>

            <Stack direction="horizontal" spacing="md" align="center" data-testid="success-actions">
              {successActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Emergency Contact */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
              <Stack spacing="md" align="center">
                <Text data-testid="success-emergency-contact-title" weight="bold">
                  {getCMSField(cmsData, 'success.emergencyContact.title', '🆘 Need Help?')}
                </Text>
                <Text data-testid="success-emergency-contact-description">
                  {getCMSField(cmsData, 'success.emergencyContact.description', 'Contact us anytime if you have questions or need to make changes')}
                </Text>
              </Stack>
            
              <Stack spacing="md" align="center">
                <Text data-testid="success-emergency-phone">{getCMSField(cmsData, 'success.emergencyContact.phone', '📞 (203) 555-0123')}</Text>
                <Text data-testid="success-emergency-message">{getCMSField(cmsData, 'success.emergencyContact.message', 'Save this number! Our drivers are available to assist you.')}</Text>
              </Stack>
          </Stack>
        </Container>
      </GridSection>
    </>
  );
}

function SuccessPage() {
  return (
    <Suspense fallback={
      <>
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg"   align="center">
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

const SuccessPageDynamic = dynamic(() => Promise.resolve(SuccessPage), { ssr: false });

export default SuccessPageDynamic;
