'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
  ToastProvider,
  useToast,
  ActionButtonGroup
} from '@/components/ui';

function CancelPageContent() {
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
    } catch (err) {
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

  return (
    <LayoutEnforcer>
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
              <div>
                <label 
                  htmlFor="booking-id"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-sm)',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}
                >
                  Booking ID *
                </label>
                <input
                  id="booking-id"
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter your booking reference number"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 'var(--font-size-base)',
                    backgroundColor: 'var(--background-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label 
                  htmlFor="cancellation-reason"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-sm)',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}
                >
                  Reason for Cancellation (Optional)
                </label>
                <select
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 'var(--font-size-base)',
                    backgroundColor: 'var(--background-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Select a reason...</option>
                  {cancellationReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>⏰</div>
                <h4>Reschedule</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Change your pickup time or date instead of cancelling
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📍</div>
                <h4>Modify Location</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Update pickup or dropoff locations if your plans changed
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💬</div>
                <h4>Contact Support</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Speak with our team about flexible options
                </p>
              </div>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function CancelPage() {
  return (
    <ToastProvider>
      <CancelPageContent />
    </ToastProvider>
  );
}
