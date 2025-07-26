'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
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

  const getStatusColor = (status: any) => {
    const statusText = getStatusText(status);
    switch (statusText.toLowerCase()) {
      case 'confirmed': return 'var(--success-color)';
      case 'en-route': return 'var(--warning-color)';
      case 'arrived': return 'var(--primary-color)';
      case 'completed': return 'var(--success-color)';
      case 'cancelled': return 'var(--error-color)';
      default: return 'var(--text-secondary)';
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
      <LayoutEnforcer>
        <UniversalLayout 
          layoutType="standard"
          title="Booking Status"
          subtitle="Track your airport transportation"
        >
          <GridSection variant="content" columns={1}>
            <InfoCard
              title="📋 Loading Booking Status"
              description="Retrieving your booking information..."
            >
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <LoadingSpinner />
                <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                  Please wait while we fetch your booking details...
                </p>
              </div>
            </InfoCard>
          </GridSection>
        </UniversalLayout>
      </LayoutEnforcer>
    );
  }

  if (error) {
    return (
      <LayoutEnforcer>
        <UniversalLayout 
          layoutType="standard"
          title="Booking Status"
          subtitle="Track your airport transportation"
        >
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="error" 
              message={error}
              onDismiss={() => window.location.reload()}
            />
          </GridSection>

          <GridSection variant="content" columns={1}>
            <InfoCard
              title="❌ Unable to Load Booking"
              description="We couldn't retrieve your booking information"
            >
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                  This could be due to an invalid booking ID or a temporary system issue.
                </p>
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
              </div>
            </InfoCard>
          </GridSection>
        </UniversalLayout>
      </LayoutEnforcer>
    );
  }

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Booking Status"
        subtitle={`Tracking booking #${bookingId}`}
      >
        {/* Current Status */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title={`${getStatusIcon(status)} Current Status: ${getStatusText(status)}`}
            description="Live tracking of your airport transportation"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg)'
            }}>
              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: `2px solid ${getStatusColor(status)}`
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
                  {getStatusIcon(status)}
                </div>
                <h2 style={{ 
                  margin: '0 0 var(--spacing-sm) 0', 
                  color: getStatusColor(status),
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}                >
                  {getStatusText(status)}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {getStatusText(status) === 'confirmed' && 'Your ride is confirmed and driver assigned'}
                  {getStatusText(status) === 'en-route' && 'Your driver is on the way to pick you up'}
                  {getStatusText(status) === 'arrived' && 'Your driver has arrived at the pickup location'}
                  {getStatusText(status) === 'completed' && 'Your ride has been completed successfully'}
                  {getStatusText(status) === 'cancelled' && 'This booking has been cancelled'}
                  {getStatusText(status) === 'Unknown' && 'We are processing your booking request'}
                </p>
              </div>

              {estimatedArrival && (
                <div style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--background-primary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>⏰ Estimated Arrival</h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: '600',
                    color: 'var(--primary-color)'
                  }}>
                                         {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}
                  </p>
                </div>
              )}
            </div>
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
            <div style={{ padding: 'var(--spacing-md)' }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{showDetails ? 'Hide' : 'Show'} Booking Details</span>
                <span>{showDetails ? '▲' : '▼'}</span>
              </button>

              {showDetails && (
                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--background-primary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    <div>
                      <strong>Booking ID:</strong> {bookingId}
                    </div>
                                         <div>
                       <strong>Status:</strong> <span style={{ color: getStatusColor(status) }}>{getStatusText(status)}</span>
                     </div>
                    {estimatedArrival && (
                      <div>
                                                 <strong>Estimated Arrival:</strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}
                      </div>
                    )}
                    <div>
                      <strong>Support:</strong> (203) 555-0123
                    </div>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </GridSection>

        {/* Status Timeline */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📈 Booking Timeline"
            description="Track the progress of your ride"
          >
            <div style={{
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              {[
                { status: 'confirmed', label: 'Booking Confirmed', icon: '✅' },
                { status: 'en-route', label: 'Driver En Route', icon: '🚗' },
                { status: 'arrived', label: 'Driver Arrived', icon: '📍' },
                { status: 'completed', label: 'Trip Completed', icon: '🏁' }
              ].map((step, index) => (
                <div 
                  key={step.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                                         opacity: getStatusText(status) === step.status ? 1 : 0.5
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                                         backgroundColor: getStatusText(status) === step.status ? 'var(--primary-color)' : 'var(--background-secondary)',
                     color: getStatusText(status) === step.status ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                                         fontWeight: getStatusText(status) === step.status ? '600' : 'normal',
                     color: getStatusText(status) === step.status ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function BookingStatusPage() {
  return (
    <ToastProvider>
      <BookingStatusPageContent />
    </ToastProvider>
  );
}
