'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GridSection,
  LoadingSpinner,
  Text,
  Container,
  Span,
  Button,
  Stack,
  // TextComponentChildren,
} from '@/design/ui';
import { Booking } from '@/types/booking';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { isRunningAsPWA } from '@/lib/pwa';

interface SuccessPageClientProps {
  cmsData?: any;
}

export default function SuccessPageClient({ cmsData }: SuccessPageClientProps) {
  // Use CMS data passed from server component
  const pageCmsData = cmsData || {};
  
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') ?? '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

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

    // Show PWA prompt after successful booking load (slight delay for better UX)
    const timer = setTimeout(() => {
      if (!isRunningAsPWA()) {
        setShowPWAPrompt(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
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
              <Text cmsId="successPageInitializing">{pageCmsData?.['successPageInitializing'] || 'Initializing...'}</Text>
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
            <Stack spacing="lg" align="center">
              <Text data-testid="success-loading-title" weight="bold">
                {pageCmsData?.['success-loading-title'] || 'Loading...'}
              </Text>
              <Text data-testid="success-loading-description">
                {pageCmsData?.['success-loading-description'] || 'Loading your booking details...'}
              </Text>
              <LoadingSpinner size="lg" />
            </Stack>
          </Container>
        </GridSection>
      </>
    );
  }

  if (error) {
    return (
      <>
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg">
              <Stack spacing="md" align="center">
                <Text data-testid="success-error-title" weight="bold">
                  {pageCmsData?.['success-error-title'] || '⚠️ Error Loading Booking'}
                </Text>
                <Text data-testid="success-error-description">
                  {pageCmsData?.['success-error-description'] || 'Please try refreshing the page or contact support if the problem persists.'}
                </Text>
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                  text="Try Again"
                />
              </Stack>
            </Stack>
          </Container>
        </GridSection>
      </>
    );
  }

  return (
    <>
      {/* Success Message */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <Span data-testid="success-icon" size="xl" cmsId="success-icon">🎉</Span>
            <Stack spacing="md" align="center">
                              <Text data-testid="success-booking-confirmed-title" weight="bold">
                  {pageCmsData?.['success-bookingConfirmed-title'] || 'Booking Confirmed!'}
                </Text>
                <Text data-testid="success-booking-confirmed-message">
                  {pageCmsData?.['success-bookingConfirmed-message'] || 'Your ride has been successfully booked. Check your email for confirmation and details.'}
                </Text>
            </Stack>
            <Button data-testid="success-back-home-button" variant="primary" size="lg" onClick={() => window.location.href = '/'} cmsId="success-actions-back_to_home"  text={pageCmsData?.['success-actions-back_to_home'] || 'Back to Home'} />
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      {booking && (
        <GridSection variant="content" columns={2}>
          <Container>
            <Stack spacing="lg">
              <Stack spacing="md" align="center">
                <Text data-testid="success-trip-details-title" weight="bold">
                  {pageCmsData?.['success-tripDetails-title'] || 'Trip Details'}
                </Text>
                <Text data-testid="success-trip-details-description">
                  {pageCmsData?.['success-tripDetails-description'] || 'Your journey information'}
                </Text>
              </Stack>
              <Stack data-testid="success-trip-details-list" spacing="sm">
                <Text data-testid="success-pickup-location"><strong>From:</strong> {booking.trip.pickup.address}</Text>
                <Text data-testid="success-dropoff-location"><strong>To:</strong> {booking.trip.dropoff.address}</Text>
                <Text data-testid="success-pickup-time"><strong>When:</strong> {new Date(booking.trip.pickupDateTime).toLocaleString()}</Text>
              </Stack>
            </Stack>
          </Container>
          
          <Container>
            <Stack spacing="lg">
              <Stack spacing="md" align="center">
                <Text data-testid="success-payment-status-title" weight="bold">
                  {pageCmsData?.['success-paymentStatus-title'] || '💰 Payment Status'}
                </Text>
                <Text data-testid="success-payment-status-description">
                  {pageCmsData?.['success-paymentStatus-description'] || 'Your payment information'}
                </Text>
              </Stack>
              <Stack data-testid="success-payment-details" spacing="sm">
                <Text data-testid="success-total-fare" cmsId="ignore"><strong>Total Fare:</strong> ${booking.trip.fare}</Text>
                <Text data-testid="success-deposit" cmsId="ignore"><strong>Deposit:</strong> ${booking.payment.depositAmount} {booking.payment.depositPaid ? '✅ Paid' : '⏳ Pending'}</Text>
                <Text data-testid="success-balance-due" cmsId="ignore"><strong>Balance Due:</strong> ${booking.payment.balanceDue || 0}</Text>
              </Stack>
            </Stack>
          </Container>
        </GridSection>
      )}

      {/* Next Steps */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="md" align="center">
              <Text data-testid="success-next-steps-title" weight="bold">
                {pageCmsData?.['success-nextSteps-title'] || '📋 What Happens Next?'}
              </Text>
              <Text data-testid="success-next-steps-description">
                {pageCmsData?.['success-nextSteps-description'] || "Here's what you can expect from us"}
              </Text>
            </Stack>
          
            <Stack data-testid="success-next-steps-list" spacing="md">
              <Text data-testid="success-next-step-email" cmsId="success-nextSteps-items-0">{pageCmsData?.['success-nextSteps-items-0'] || "📧 You'll receive a confirmation email with all booking details"}</Text>
              <Text data-testid="success-next-step-sms" cmsId="success-nextSteps-items-1">{pageCmsData?.['success-nextSteps-items-1'] || "📱 We'll send you SMS updates about your driver and pickup time"}</Text>
              <Text data-testid="success-next-step-driver" cmsId="success-nextSteps-items-2">{pageCmsData?.['success-nextSteps-items-2'] || '👨‍💼 Your driver will contact you 30 minutes before pickup'}</Text>
              <Text data-testid="success-next-step-flight" cmsId="success-nextSteps-items-3">{pageCmsData?.['success-nextSteps-items-3'] || '✈️ We monitor your flight for any delays or changes'}</Text>
            </Stack>

            <Stack direction="horizontal" spacing="md" align="center" data-testid="success-actions">
              {successActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  cmsId="success-action"
                  
                  text={action.label as string}
                />
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Emergency Contact */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="md" align="center">
              <Text data-testid="success-emergency-contact-title" weight="bold">
                {pageCmsData?.['success-emergencyContact-title'] || '🆘 Need Help?'}
              </Text>
              <Text data-testid="success-emergency-contact-description">
                {pageCmsData?.['success-emergencyContact-description'] || 'Contact us anytime if you have questions or need to make changes'}
              </Text>
            </Stack>

            <Stack spacing="md" align="center">
              <Text data-testid="success-emergency-phone" cmsId="success-emergencyContact-phone">{pageCmsData?.['success-emergencyContact-phone'] || '💬 Text support for phone number'}</Text>
              <Text data-testid="success-emergency-message" cmsId="success-emergencyContact-message">{pageCmsData?.['success-emergencyContact-message'] || 'Save this number! Our driver is available to assist you.'}</Text>
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* PWA Install Prompt - shows after successful booking */}
      {showPWAPrompt && (
        <PWAInstallBanner
          variant="post-booking"
          forceShow={true}
          onDismiss={() => setShowPWAPrompt(false)}
        />
      )}
    </>
  );
}
