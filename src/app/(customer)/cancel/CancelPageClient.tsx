'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GridSection,
  FeatureGrid,
  ToastProvider,
  useToast,
  Text,
  Container,
  Stack,
  Box,
  Button,
  Input,
  Label,
  Select,
  LoadingSpinner
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

function CancelPageContent() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.cancel || {};
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');
  const [bookingInfo, setBookingInfo] = useState<{ pickupDateTime?: string; fare?: number } | null>(null);

  const handleCancel = async () => {
    if (!bookingId.trim()) {
      addToast('error', 'Please enter your booking ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/booking/cancel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId.trim(),
          reason: reason || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      const refundMessage = data.refundAmount > 0 
        ? `Booking cancelled successfully. You will receive a refund of $${data.refundAmount.toFixed(2)}.`
        : 'Booking cancelled successfully. Your deposit is non-refundable at this time.';
      
      addToast('success', refundMessage);
      
      // Redirect to home after successful cancellation
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Cancellation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel booking. Please contact customer support.';
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupBooking = async () => {
    if (!bookingId.trim()) {
      addToast('error', 'Please enter your booking ID');
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId.trim()}`);
      if (response.ok) {
        const booking = await response.json();
        const pickupDateTime = booking.trip?.pickupDateTime || booking.pickupDateTime;
        const fare = booking.trip?.fare || booking.fare;
        setBookingInfo({ pickupDateTime, fare });
        
        // Calculate refund info
        if (pickupDateTime) {
          const now = new Date();
          const pickupTime = new Date(pickupDateTime);
          const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          let refundPercent = 0;
          if (hoursUntilPickup > 24) {
            refundPercent = 100;
          } else if (hoursUntilPickup > 3) {
            refundPercent = 50;
          }
          
          const depositAmount = booking.payment?.depositAmount || booking.depositAmount || (fare || 0) / 2;
          const refundAmount = (depositAmount * refundPercent) / 100;
          
          if (refundAmount > 0) {
            addToast('info', `If cancelled now, you would receive a refund of $${refundAmount.toFixed(2)} (${refundPercent}% of deposit)`);
          } else {
            addToast('warning', 'Cancellation within 3 hours of pickup time is non-refundable.');
          }
        }
      } else {
        addToast('error', 'Booking not found. Please check your booking ID.');
        setBookingInfo(null);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      addToast('error', 'Failed to lookup booking. Please try again.');
      setBookingInfo(null);
    }
  };

  const _quickActions = [
    {
      label: 'Cancel Booking',
      onClick: handleCancel,
      variant: 'primary' as const,
      disabled: loading || !bookingId.trim(),
      icon: '❌'
    },
    {
      label: 'Text Support',
      onClick: () => addToast('info', 'Text Support: (646) 221-6370'),
      variant: 'outline' as const,
      icon: '💬'
    },
    {
      label: 'Back to Home',
      onClick: () => router.push('/'),
      variant: 'outline' as const,
      icon: '🏠'
    }
  ];

  const alternativeOptions = [
    {
      icon: "⏰",
      title: "Reschedule",
      description: "Change your pickup time or date instead of cancelling"
    },
    {
      icon: "📍",
      title: "Modify Location",
      description: "Update pickup or dropoff locations if your plans changed"
    },
    {
      icon: "💬",
      title: "Contact Support",
      description: "Speak with our team about flexible options"
    }
  ];

  const cancellationPolicy = [
    {
      title: "24+ Hours Before Pickup",
      description: "No cancellation fee"
    },
    {
      title: "12–24 Hours Before",
      description: "25% cancellation fee"
    },
    {
      title: "6–12 Hours Before",
      description: "50% cancellation fee"
    },
    {
      title: "Under 6 Hours",
      description: "75% cancellation fee"
    },
    {
      title: "Refund Processing",
      description: "Refunds typically process within 3-5 business days"
    },
    {
      title: "Emergency Cancellations",
      description: "Contact us directly for special circumstances"
    }
  ];

  return (
    <>
      {/* Cancellation Form */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-form-title" weight="bold" cmsId="cancel-form-title">{cmsData?.['cancel-form-title'] || '📝 Cancel Your Booking'}</Text>
              <Text data-testid="cancel-form-description" cmsId="cancel-form-description">{cmsData?.['cancel-form-description'] || 'Please provide your booking details to process the cancellation'}</Text>
            </Stack>
            
            <Stack data-testid="cancel-form-fields" spacing="md">
              <Container>
                <Label htmlFor="booking-id" cmsId="booking-id-label">{cmsData?.['booking-id-label'] || 'Booking ID'}</Label>
                <Input
                  id="booking-id"
                  value={bookingId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingId(e.target.value)}
                  placeholder="Enter your booking ID"
                  disabled={loading}
                />
                <Text size="sm" color="secondary" cmsId="booking-id-hint">{cmsData?.['booking-id-hint'] || 'Enter your booking reference number'}</Text>
              </Container>
              
              <Stack direction="horizontal" spacing="md">
                <Button
                  variant="outline"
                  onClick={handleLookupBooking}
                  disabled={loading || !bookingId.trim()}
                  text="Lookup Booking"
                />
              </Stack>

              {bookingInfo && (
                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold" cmsId="booking-found">{cmsData?.['booking-found'] || 'Booking Found'}</Text>
                    {bookingInfo.pickupDateTime && (
                      <Text size="sm" cmsId="pickup-time">Pickup: {new Date(bookingInfo.pickupDateTime).toLocaleString()}</Text>
                    )}
                    {bookingInfo.fare && (
                      <Text size="sm" cmsId="fare-amount">Fare: ${bookingInfo.fare.toFixed(2)}</Text>
                    )}
                  </Stack>
                </Box>
              )}

              <Container>
                <Label htmlFor="cancel-reason" cmsId="cancel-reason-label">{cmsData?.['cancel-reason-label'] || 'Cancellation Reason (Optional)'}</Label>
                <Select
                  id="cancel-reason"
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReason(e.target.value)}
                  disabled={loading}
                  options={[
                    { value: '', label: 'Select a reason (optional)' },
                    { value: 'change-of-plans', label: 'Change of Plans' },
                    { value: 'found-alternative', label: 'Found Alternative Transportation' },
                    { value: 'flight-cancelled', label: 'Flight Cancelled' },
                    { value: 'flight-delayed', label: 'Flight Delayed' },
                    { value: 'emergency', label: 'Emergency' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </Container>
            </Stack>
            
            <Stack direction="horizontal" spacing="md" align="center" data-testid="cancel-form-actions">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleCancel}
                    disabled={!bookingId.trim()}
                    text="Cancel Booking"
                  />
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={loading}
                    text="Back to Home"
                  />
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Cancellation Policy */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-policy-title" weight="bold" cmsId="cancel-policy-title">{cmsData?.['cancel-policy-title'] || '📋 Cancellation Policy'}</Text>
              <Text data-testid="cancel-policy-description" cmsId="cancel-policy-description">{cmsData?.['cancel-policy-description'] || 'Important information about our cancellation terms'}</Text>
            </Stack>
            
            <Stack data-testid="cancel-policy-list" spacing="md">
              {cancellationPolicy.map((policy, index) => (
                <Box key={index} data-testid={`cancel-policy-item-${index}`} padding="md">
                  <Stack spacing="sm">
                    <Text data-testid={`cancel-policy-title-${index}`}><strong>{policy.title}:</strong></Text>
                    <Text data-testid={`cancel-policy-description-${index}`}>{policy.description}</Text>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Alternative Options */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-alternatives-title" weight="bold" cmsId="alternatives-title">{cmsData?.['cancel-alternatives-title'] || '🔄 Alternative Options'}</Text>
              <Text data-testid="cancel-alternatives-description" cmsId="cancel-alternatives-description">{cmsData?.['cancel-alternatives-description'] || 'Consider these alternatives before cancelling'}</Text>
            </Stack>
            
            <FeatureGrid data-testid="cancel-alternatives-grid" features={alternativeOptions} columns={3} />
          </Stack>
        </Container>
      </GridSection>
    </>
  );
}

export default function CancelPageClient() {
  return (
    <ToastProvider>
      <CancelPageContent />
    </ToastProvider>
  );
}
