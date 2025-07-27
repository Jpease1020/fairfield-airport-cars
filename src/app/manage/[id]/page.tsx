'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  Text,
  Span,
  Container
} from '@/components/ui';
import { EditableInput } from '@/components/forms';

function ManageBookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    fetchBooking();
  }, [bookingId]);

  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 'manage',
          content: localContent
        }),
      });

      if (response.ok) {
        addToast('success', 'Content saved successfully');
        setEditMode(false);
      } else {
        addToast('error', 'Failed to save content');
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      addToast('error', 'Failed to save content');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalContent(null);
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cancel-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        setActionMsg('Booking cancelled successfully');
        addToast('success', 'Booking cancelled successfully');
      } else {
        const errorData = await response.json();
        setActionMsg(errorData.message || 'Failed to cancel booking');
        addToast('error', errorData.message || 'Failed to cancel booking');
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setActionMsg('Failed to cancel booking');
      addToast('error', 'Failed to cancel booking');
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (response.ok) {
        setActionMsg('Confirmation email sent successfully');
        addToast('success', 'Confirmation email sent successfully');
      } else {
        setActionMsg('Failed to send confirmation email');
        addToast('error', 'Failed to send confirmation email');
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setActionMsg('Failed to send confirmation email');
      addToast('error', 'Failed to send confirmation email');
    }
  };

  if (loading) {
    return (
      <UnifiedLayout 
        layoutType="standard"
        title="Loading..."
        subtitle="Please wait while we load your booking details"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="⏳ Loading" description="Loading your booking information">
            <Container className="manage-booking-loading">
              Loading...
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  if (error || !booking) {
    return (
      <UnifiedLayout 
        layoutType="standard"
        title="Manage Booking"
        subtitle="Booking not found"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Error" description="Booking could not be found">
            <Container className="manage-booking-error">
              <Text className="manage-booking-error-message">
                {error || localContent?.notFoundMessage || 'Booking not found'}
              </Text>
              <ActionButtonGroup buttons={[
                {
                  label: 'Book a New Ride',
                  onClick: () => window.location.href = '/book',
                  variant: 'primary' as const,
                  icon: '🚗'
                }
              ]} />
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  const actionButtons = [
    {
      label: localContent?.resendButton || "Re-send Confirmation",
      onClick: handleResend,
      variant: 'outline' as const,
      icon: '📧'
    },
    {
      label: localContent?.viewStatusButton || "View Status",
      onClick: () => router.push(`/status/${booking.id}`),
      variant: 'outline' as const,
      icon: '📊'
    }
  ];

  // Add cancel button if booking is not cancelled
  if (booking.status !== 'cancelled') {
    actionButtons.push({
      label: localContent?.cancelButton || "Cancel Ride",
      onClick: handleCancelBooking,
      variant: 'outline' as const,
      icon: '❌'
    });
  }

  // Add pay balance button if there's a balance due
  if (booking.balanceDue > 0 && booking.status === 'completed') {
    actionButtons.push({
      label: `${localContent?.payBalanceButton || "Pay Balance"} ($${booking.balanceDue.toFixed(2)})`,
      onClick: async () => {
        const res = await fetch('/api/complete-payment', { 
          method: 'POST', 
          headers: { 'Content-Type':'application/json' }, 
          body: JSON.stringify({ bookingId: booking.id })
        });
        if (res.ok) {
          const { paymentLinkUrl } = await res.json();
          window.location.href = paymentLinkUrl;
        } else {
          const errorMsg = localContent?.payBalanceErrorMessage || 'Failed to create balance payment link';
          setActionMsg(errorMsg);
          addToast('error', errorMsg);
        }
      },
      variant: 'outline' as const,
      icon: '💳'
    });
  }

  return (
    <UnifiedLayout 
      layoutType="standard"
      title={localContent?.title || "Manage Your Booking"}
      subtitle={typeof localContent?.subtitle === 'string' && typeof booking?.id === 'string' ? localContent.subtitle.replace('{bookingId}', booking.id) : `Reference: ${booking?.id ?? ''}`}
    >
      {/* Admin Edit Mode Toggle */}
      {isAdmin && (
        <GridSection variant="content" columns={1}>
          <InfoCard title="🔧 Admin Controls" description="Edit page content">
            <Container className="manage-booking-admin-controls">
              {!editMode ? (
                <ActionButtonGroup buttons={[
                  {
                    label: 'Edit Mode',
                    onClick: () => setEditMode(true),
                    variant: 'primary' as const,
                    icon: '✏️'
                  }
                ]} />
              ) : (
                <Container className="manage-booking-edit-controls">
                  <ActionButtonGroup buttons={[
                    {
                      label: 'Save Changes',
                      onClick: handleSave,
                      variant: 'primary' as const,
                      icon: '💾'
                    },
                    {
                      label: 'Cancel',
                      onClick: handleCancel,
                      variant: 'outline' as const,
                      icon: '❌'
                    }
                  ]} />
                  <Container className="manage-booking-edit-fields">
                    <EditableInput
                      label="Page Title"
                      value={localContent?.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                    />
                    <EditableInput
                      label="Page Subtitle"
                      value={localContent?.subtitle || ''}
                      onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                    />
                    <EditableInput
                      label="Resend Button Text"
                      value={localContent?.resendButton || ''}
                      onChange={(e) => handleFieldChange('resendButton', e.target.value)}
                    />
                    <EditableInput
                      label="View Status Button Text"
                      value={localContent?.viewStatusButton || ''}
                      onChange={(e) => handleFieldChange('viewStatusButton', e.target.value)}
                    />
                    <EditableInput
                      label="Cancel Button Text"
                      value={localContent?.cancelButton || ''}
                      onChange={(e) => handleFieldChange('cancelButton', e.target.value)}
                    />
                    <EditableInput
                      label="Pay Balance Button Text"
                      value={localContent?.payBalanceButton || ''}
                      onChange={(e) => handleFieldChange('payBalanceButton', e.target.value)}
                    />
                    <EditableInput
                      label="Resend Error Message"
                      value={localContent?.resendErrorMessage || ''}
                      onChange={(e) => handleFieldChange('resendErrorMessage', e.target.value)}
                    />
                    <EditableInput
                      label="Pay Balance Error Message"
                      value={localContent?.payBalanceErrorMessage || ''}
                      onChange={(e) => handleFieldChange('payBalanceErrorMessage', e.target.value)}
                    />
                    <EditableInput
                      label="Not Found Message"
                      value={localContent?.notFoundMessage || ''}
                      onChange={(e) => handleFieldChange('notFoundMessage', e.target.value)}
                    />
                    <EditableInput
                      label="Loading Message"
                      value={localContent?.loadingMessage || ''}
                      onChange={(e) => handleFieldChange('loadingMessage', e.target.value)}
                    />
                  </Container>
                </Container>
              )}
            </Container>
          </InfoCard>
        </GridSection>
      )}

      {/* Booking Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="📋 Booking Information"
          description="Your booking details and current status"
        >
          <Container className="manage-booking-details">
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Booking ID:</Span>
              <Span className="manage-booking-value">{booking.id}</Span>
            </Container>
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Status:</Span>
              <Span className={`manage-booking-status manage-booking-status-${booking.status}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Span>
            </Container>
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Passenger:</Span>
              <Span className="manage-booking-value">{booking.name}</Span>
            </Container>
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Route:</Span>
              <Span className="manage-booking-value">{booking.pickupLocation} → {booking.dropoffLocation}</Span>
            </Container>
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Pickup Time:</Span>
              <Span className="manage-booking-value">{new Date(booking.pickupDateTime).toLocaleString()}</Span>
            </Container>
            <Container className="manage-booking-item">
              <Span className="manage-booking-label">Total Fare:</Span>
              <Span className="manage-booking-value">${booking.fare?.toFixed(2)}</Span>
            </Container>
            {booking.balanceDue > 0 && (
              <Container className="manage-booking-item">
                <Span className="manage-booking-label">Balance Due:</Span>
                <Span className="manage-booking-value manage-booking-balance">${booking.balanceDue.toFixed(2)}</Span>
              </Container>
            )}
          </Container>
        </InfoCard>
      </GridSection>

      {/* Action Buttons */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="🎯 Quick Actions"
          description="Manage your booking or view status"
        >
          <ActionButtonGroup buttons={actionButtons} />
        </InfoCard>
      </GridSection>

      {/* Action Messages */}
      {actionMsg && (
        <GridSection variant="content" columns={1}>
          <InfoCard title="📢 Action Result" description="Result of your recent action">
            <Container className="manage-booking-action-message">
              {actionMsg}
            </Container>
          </InfoCard>
        </GridSection>
      )}
    </UnifiedLayout>
  );
}

export default function ManageBookingPage() {
  return (
    <ToastProvider>
      <ManageBookingPageContent />
    </ToastProvider>
  );
}
