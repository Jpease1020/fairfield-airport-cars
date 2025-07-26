'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { UnifiedLayout } from '@/lib/design-system/UnifiedLayout';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  FeatureGrid
} from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const handleCancel = async () => {
    if (!bookingId.trim()) {
      addToast('error', 'Please enter your booking ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate cancellation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast('success', 'Booking cancelled successfully. You will receive a confirmation email.');
      
      // Redirect to home after successful cancellation
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Cancellation error:', error);
      const errorMsg = 'Failed to cancel booking. Please contact customer support.';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'Cancel Booking',
      onClick: handleCancel,
      variant: 'primary' as const,
      disabled: loading || !bookingId.trim(),
      icon: '❌'
    },
    {
      label: 'Contact Support',
      onClick: () => addToast('info', 'Support: (203) 555-0123'),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      label: 'Back to Home',
      onClick: () => router.push('/'),
      variant: 'outline' as const,
      icon: '🏠'
    }
  ];

  const cancellationReasons = [
    'Flight cancelled or delayed',
    'Plans changed',
    'Found alternative transportation',
    'Emergency situation',
    'Booking made in error',
    'Other'
  ];

  // REFACTORED: Using structured feature data for FeatureGrid
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

  return (<UnifiedLayout 
      layoutType="standard"
      title="Cancel Booking"
      subtitle="Cancel your reservation"
    >
      <UniversalLayout 
        layoutType="standard"
        title="Cancel Booking"
        subtitle="We're sorry to see you need to cancel your ride"
      >
        {/* Error Display */}
        {error && (
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="error" 
              message={error} 
              onDismiss={() => setError(null)}
            />
          </GridSection>
        )}

        {/* Cancellation Form */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📝 Cancel Your Booking"
            description="Please provide your booking details to process the cancellation"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)'
            }}>
              {/* REFACTORED: Using FormField instead of manual input */}
              <FormField
                label="Booking ID"
                id="booking-id"
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter your booking reference number"
                required
              />

              {/* REFACTORED: Using proper select component */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Reason for Cancellation (Optional)
                </label>
                <Select value={cancellationReason} onValueChange={setCancellationReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cancellationReasons.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ActionButtonGroup buttons={quickActions} />
            </div>
          </InfoCard>
        </GridSection>

        {/* Cancellation Policy */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📋 Cancellation Policy"
            description="Important information about our cancellation terms"
          >
            <div style={{
              fontSize: 'var(--font-size-sm)',
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                <li>
                  <strong>Free Cancellation:</strong> Cancel up to 2 hours before pickup time with no charge
                </li>
                <li>
                  <strong>Late Cancellation:</strong> Cancellations within 2 hours may incur a fee
                </li>
                <li>
                  <strong>Emergency Cancellations:</strong> Contact us directly for special circumstances
                </li>
                <li>
                  <strong>Refund Processing:</strong> Refunds typically process within 3-5 business days
                </li>
                <li>
                  <strong>Weather/Flight Delays:</strong> No charge for cancellations due to circumstances beyond your control
                </li>
              </ul>
            </div>
          </InfoCard>
        </GridSection>

        {/* Alternative Options */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🔄 Alternative Options"
            description="Consider these alternatives before cancelling"
          >
            {/* REFACTORED: Using FeatureGrid instead of manual grid */}
            <FeatureGrid features={alternativeOptions} columns={3} />
          </InfoCard>
        </GridSection>
    </UnifiedLayout>
    </LayoutEnforcer>
  );
}

export default function CancelPage() {
  return (
    <ToastProvider>
      <CancelPageContent />
    </ToastProvider>
  );
