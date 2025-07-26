'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  LoadingSpinner
} from '@/components/ui';
import { useBookingStatus, useEstimatedArrival } from '@/hooks/useBookingStatus';

function BookingStatusPageContent() {
  const { addToast } = useToast();
  const params = useParams();
  const bookingId = params.id as string;
  
  const { status, loading, error } = useBookingStatus(bookingId);
  const { estimatedArrival } = useEstimatedArrival(bookingId);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusText = (status: any) => {
    if (!status) return 'Unknown';
    return typeof status === 'string' ? status : status.status || 'Unknown';
  };

  const getStatusIcon = (status: any) => {
    const statusText = getStatusText(status);
    switch (statusText.toLowerCase()) {
      case 'confirmed': return '✅';
      case 'en-route': return '🚗';
      case 'arrived': return '📍';
      case 'completed': return '🏁';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };



  const quickActions = [
    {
      label: 'Refresh Status',
      onClick: () => {
        window.location.reload();
        addToast('info', 'Refreshing booking status...');
      },
      variant: 'outline' as const,
      icon: '🔄'
    },
    {
      label: 'Contact Driver',
      onClick: () => addToast('info', 'Driver contact feature coming soon'),
      variant: 'primary' as const,
      icon: '📞'
    },
    {
      label: 'Get Directions',
      onClick: () => addToast('info', 'Opening directions in maps app...'),
      variant: 'outline' as const,
      icon: '🗺️'
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
            <p>Please wait while we fetch your booking details...</p>
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
            <p>This could be due to an invalid booking ID or a temporary system issue.</p>
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
          <p>
            {getStatusText(status) === 'confirmed' && 'Your ride is confirmed and driver assigned'}
            {getStatusText(status) === 'en-route' && 'Your driver is on the way to pick you up'}
            {getStatusText(status) === 'arrived' && 'Your driver has arrived at the pickup location'}
            {getStatusText(status) === 'completed' && 'Your ride has been completed successfully'}
            {getStatusText(status) === 'cancelled' && 'This booking has been cancelled'}
            {getStatusText(status) === 'Unknown' && 'We are processing your booking request'}
          </p>

          {estimatedArrival && (
            <p>
              <strong>⏰ Estimated Arrival:</strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}
            </p>
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
          <p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="status-toggle-button"
            >
              {showDetails ? 'Hide' : 'Show'} Booking Details
            </button>
          </p>

          {showDetails && (
            <p>
              <strong>Booking ID:</strong> {bookingId}<br />
              <strong>Status:</strong> {getStatusText(status)}<br />
              {estimatedArrival && (
                <>
                  <strong>Estimated Arrival:</strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}<br />
                </>
              )}
              <strong>Support:</strong> (203) 555-0123
            </p>
          )}
        </InfoCard>
      </GridSection>

      {/* Status Timeline */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📈 Booking Timeline"
          description="Track the progress of your ride"
        >
          <p>
            {[
              { status: 'confirmed', label: 'Booking Confirmed', icon: '✅' },
              { status: 'en-route', label: 'Driver En Route', icon: '🚗' },
              { status: 'arrived', label: 'Driver Arrived', icon: '📍' },
              { status: 'completed', label: 'Trip Completed', icon: '🏁' }
            ].map((step) => (
              <span key={step.status}>
                {step.icon} {step.label}
                {getStatusText(status) === step.status && ' (Current)'}
                <br />
              </span>
            ))}
          </p>
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
