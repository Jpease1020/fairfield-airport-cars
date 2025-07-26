'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  FeatureGrid,
  ToastProvider,
  useToast
} from '@/components/ui';

function CancelPageContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookingId] = useState('');

  const handleCancel = async () => {
    if (!bookingId.trim()) {
      addToast('error', 'Please enter your booking ID');
      return;
    }

    setLoading(true);
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

  return (
    <UnifiedLayout 
      layoutType="content"
      title="Cancel Booking"
      subtitle="We're sorry to see you need to cancel your ride"
      description="Please provide your booking details to process the cancellation"
    >
      {/* Cancellation Form */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📝 Cancel Your Booking"
          description="Please provide your booking details to process the cancellation"
        >
          <p>
            <strong>Booking ID:</strong> Enter your booking reference number
          </p>
          <p>
            <strong>Reason:</strong> Select a reason for cancellation (optional)
          </p>
          
          <ActionButtonGroup buttons={quickActions} />
        </InfoCard>
      </GridSection>

      {/* Cancellation Policy */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📋 Cancellation Policy"
          description="Important information about our cancellation terms"
        >
          <ul>
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
  );
}

export default function CancelPage() {
  return (
    <ToastProvider>
      <CancelPageContent />
    </ToastProvider>
  );
}
