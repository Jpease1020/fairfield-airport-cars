'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  LoadingSpinner,
  ToastProvider,
  useToast,
  Text,
  Span,
  Button
} from '@/components/ui';

function BookingStatusPageContent() {
  const params = useParams();
  const { addToast } = useToast();
  const bookingId = params.id as string;
  
  const [status, setStatus] = useState<string>('loading');
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusText = (status: any) => {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmed',
      'en-route': 'En Route',
      'arrived': 'Arrived',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'loading': 'Loading'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusIcon = (status: any) => {
    const iconMap: { [key: string]: string } = {
      'confirmed': '✅',
      'en-route': '🚗',
      'arrived': '📍',
      'completed': '🏁',
      'cancelled': '❌',
      'loading': '⏳'
    };
    return iconMap[status] || '❓';
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setEstimatedArrival(data.estimatedArrival ? new Date(data.estimatedArrival) : null);
        } else {
          setError('Failed to load booking status');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId]);

  const quickActions = [
    {
      label: 'Manage Booking',
      onClick: () => window.location.href = `/manage/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      label: 'Contact Driver',
      onClick: () => addToast('info', 'Driver contact feature coming soon'),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      label: 'Get Support',
      onClick: () => addToast('info', 'Support: (203) 555-0123'),
      variant: 'outline' as const,
      icon: '🆘'
    }
  ];

  if (loading) {
    return (
      <UnifiedLayout 
        layoutType="status"
        title="Booking Status"
        subtitle="Track your ride"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📋 Loading Booking Status"
            description="Retrieving your booking information..."
          >
            <LoadingSpinner />
            <Text>Please wait while we fetch your booking details...</Text>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout 
        layoutType="status"
        title="Booking Status"
        subtitle="Track your ride"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="❌ Unable to Load Booking"
            description="We couldn't retrieve your booking information"
          >
            <Text>This could be due to an invalid booking ID or a temporary system issue.</Text>
            <ActionButtonGroup buttons={[
              {
                label: 'Try Again',
                onClick: () => window.location.reload(),
                variant: 'primary',
                icon: '🔄'
              },
              {
                label: 'Contact Support',
                onClick: () => addToast('info', 'Support: (203) 555-0123'),
                variant: 'outline',
                icon: '📞'
              }
            ]} />
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      layoutType="status"
      title="Booking Status"
      subtitle={`Tracking booking #${bookingId}`}
    >
      {/* Current Status */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={`${getStatusIcon(status)} Current Status: ${getStatusText(status)}`}
          description="Live tracking of your airport transportation"
        >
          <Text>
            {getStatusText(status) === 'confirmed' && 'Your ride is confirmed and driver assigned'}
            {getStatusText(status) === 'en-route' && 'Your driver is on the way to pick you up'}
            {getStatusText(status) === 'arrived' && 'Your driver has arrived at the pickup location'}
            {getStatusText(status) === 'completed' && 'Your ride has been completed successfully'}
            {getStatusText(status) === 'cancelled' && 'This booking has been cancelled'}
            {getStatusText(status) === 'Unknown' && 'We are processing your booking request'}
          </Text>

          {estimatedArrival && (
            <Text>
              <strong>⏰ Estimated Arrival:</strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}
            </Text>
          )}
        </InfoCard>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎯 Quick Actions"
          description="Manage your booking and get assistance"
        >
          <ActionButtonGroup buttons={quickActions} />
        </InfoCard>
      </GridSection>

      {/* Booking Details Toggle */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📋 Booking Information"
          description="View complete booking details and timeline"
        >
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
          >
            {showDetails ? 'Hide' : 'Show'} Booking Details
          </Button>

          {showDetails && (
            <Text>
              <strong>Booking ID:</strong> {bookingId}<br />
              <strong>Status:</strong> {getStatusText(status)}<br />
              {estimatedArrival && (
                <>
                  <strong>Estimated Arrival:</strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}<br />
                </>
              )}
              <strong>Support:</strong> (203) 555-0123
            </Text>
          )}
        </InfoCard>
      </GridSection>

      {/* Status Timeline */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📈 Booking Timeline"
          description="Track the progress of your ride"
        >
          <Text>
            {[
              { status: 'confirmed', label: 'Booking Confirmed', icon: '✅' },
              { status: 'en-route', label: 'Driver En Route', icon: '🚗' },
              { status: 'arrived', label: 'Driver Arrived', icon: '📍' },
              { status: 'completed', label: 'Trip Completed', icon: '🏁' }
            ].map((step) => (
              <Span key={step.status}>
                {step.icon} {step.label}
                {getStatusText(status) === step.status && ' (Current)'}
                <br />
              </Span>
            ))}
          </Text>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function BookingStatusPage() {
  return (
    <ToastProvider>
      <BookingStatusPageContent />
    </ToastProvider>
  );
}
