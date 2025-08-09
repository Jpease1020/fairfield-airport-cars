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
  Button
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function CancelPageContent() {
  const { addToast } = useToast();
  const { cmsData } = useCMSData();
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
      title: "Free Cancellation",
      description: "Cancel up to 2 hours before pickup time with no charge"
    },
    {
      title: "Late Cancellation",
      description: "Cancellations within 2 hours may incur a fee"
    },
    {
      title: "Emergency Cancellations",
      description: "Contact us directly for special circumstances"
    },
    {
      title: "Refund Processing",
      description: "Refunds typically process within 3-5 business days"
    },
    {
      title: "Weather/Flight Delays",
      description: "No charge for cancellations due to circumstances beyond your control"
    }
  ];

  return (
    <>
      {/* Cancellation Form */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-form-title" weight="bold">{getCMSField(cmsData, 'cancel.form.title', '📝 Cancel Your Booking')}</Text>
              <Text data-testid="cancel-form-description">{getCMSField(cmsData, 'cancel.form.description', 'Please provide your booking details to process the cancellation')}</Text>
            </Stack>
            
            <Stack data-testid="cancel-form-fields" spacing="md">
              <Text data-testid="cancel-booking-id-field">
                <strong>Booking ID:</strong> Enter your booking reference number
              </Text>
              <Text data-testid="cancel-reason-field">
                <strong>Reason:</strong> Select a reason for cancellation (optional)
              </Text>
            </Stack>
            
            <Stack direction="horizontal" spacing="md" align="center" data-testid="cancel-form-actions">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Cancellation Policy */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-policy-title" weight="bold">{getCMSField(cmsData, 'cancel.policy.title', '📋 Cancellation Policy')}</Text>
              <Text data-testid="cancel-policy-description">{getCMSField(cmsData, 'cancel.policy.description', 'Important information about our cancellation terms')}</Text>
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
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <Text data-testid="cancel-alternatives-title" weight="bold">{getCMSField(cmsData, 'cancel.alternatives.title', '🔄 Alternative Options')}</Text>
              <Text data-testid="cancel-alternatives-description">{getCMSField(cmsData, 'cancel.alternatives.description', 'Consider these alternatives before cancelling')}</Text>
            </Stack>
            
            <FeatureGrid data-testid="cancel-alternatives-grid" features={alternativeOptions} columns={3} />
          </Stack>
        </Container>
      </GridSection>
    </>
  );
}

export default function CancelPage() {
  return (
    <ToastProvider>
      <CancelPageContent />
    </ToastProvider>
  );
}
