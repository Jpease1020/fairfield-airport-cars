'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  GridSection,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  Text,
  Span,
  Container,
  CustomerLayout
} from '@/ui';
import { Stack } from '@/ui';
import { EditableText } from '@/ui';
import { Input } from '@/ui';

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
        console.error('Error fetching booking:', error);
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
        // Assuming addToast is available from ToastProvider or similar
        // addToast('success', 'Content saved successfully'); 
        setEditMode(false);
      } else {
        // Assuming addToast is available from ToastProvider or similar
        // addToast('error', 'Failed to save content');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      // Assuming addToast is available from ToastProvider or similar
      // addToast('error', 'Failed to save content');
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
        // Assuming addToast is available from ToastProvider or similar
        // addToast('success', 'Booking cancelled successfully');
      } else {
        const errorData = await response.json();
        setActionMsg(errorData.message || 'Failed to cancel booking');
        // Assuming addToast is available from ToastProvider or similar
        // addToast('error', errorData.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setActionMsg('Failed to cancel booking');
      // Assuming addToast is available from ToastProvider or similar
      // addToast('error', 'Failed to cancel booking');
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
        // Assuming addToast is available from ToastProvider or similar
        // addToast('success', 'Confirmation email sent successfully');
      } else {
        setActionMsg('Failed to send confirmation email');
        // Assuming addToast is available from ToastProvider or similar
        // addToast('error', 'Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      setActionMsg('Failed to send confirmation email');
      // Assuming addToast is available from ToastProvider or similar
      // addToast('error', 'Failed to send confirmation email');
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <GridSection variant="content" columns={1}>
          <Container>
            <EditableText field="manage.loading" defaultValue="Loading...">
              Loading...
            </EditableText>
          </Container>
        </GridSection>
      </CustomerLayout>
    );
  }

  if (error || !booking) {
    return (
      <CustomerLayout>
        <GridSection variant="content" columns={1}>
          <Container>
            <Text>
              <EditableText field="manage.notFound" defaultValue={error || localContent?.notFoundMessage || 'Booking not found'}>
                {error || localContent?.notFoundMessage || 'Booking not found'}
              </EditableText>
            </Text>
            <ActionButtonGroup buttons={[
              {
                label: 'Book a New Ride',
                onClick: () => window.location.href = '/book',
                variant: 'primary' as const,
                icon: '📅'
              }
            ]} />
          </Container>
        </GridSection>
      </CustomerLayout>
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
          // Assuming addToast is available from ToastProvider or similar
          // addToast('error', errorMsg);
        }
      },
      variant: 'outline' as const,
      icon: '💳'
    });
  }

  return (
    <CustomerLayout>
      {/* Admin Edit Mode Toggle */}
      {isAdmin && (
        <GridSection variant="content" columns={1}>
          <Container>
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
              <Container>
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
                <Stack direction="vertical" spacing="md">
                  <Input
                    placeholder="Page Title"
                    value={localContent?.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  />
                  <Input
                    placeholder="Page Subtitle"
                    value={localContent?.subtitle || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('subtitle', e.target.value)}
                  />
                  <Input
                    placeholder="Resend Button Text"
                    value={localContent?.resendButton || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('resendButton', e.target.value)}
                  />
                  <Input
                    placeholder="View Status Button Text"
                    value={localContent?.viewStatusButton || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('viewStatusButton', e.target.value)}
                  />
                  <Input
                    placeholder="Cancel Button Text"
                    value={localContent?.cancelButton || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('cancelButton', e.target.value)}
                  />
                  <Input
                    placeholder="Pay Balance Button Text"
                    value={localContent?.payBalanceButton || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('payBalanceButton', e.target.value)}
                  />
                  <Input
                    placeholder="Resend Error Message"
                    value={localContent?.resendErrorMessage || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('resendErrorMessage', e.target.value)}
                  />
                  <Input
                    placeholder="Pay Balance Error Message"
                    value={localContent?.payBalanceErrorMessage || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('payBalanceErrorMessage', e.target.value)}
                  />
                  <Input
                    placeholder="Not Found Message"
                    value={localContent?.notFoundMessage || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('notFoundMessage', e.target.value)}
                  />
                  <Input
                    placeholder="Loading Message"
                    value={localContent?.loadingMessage || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('loadingMessage', e.target.value)}
                  />
                </Stack>
              </Container>
            )}
          </Container>
        </GridSection>
      )}

      {/* Booking Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack direction="vertical" spacing="md">
            <Container>
              <Span>
                <EditableText field="manage.bookingId" defaultValue="Booking ID:">
                  Booking ID:
                </EditableText>
              </Span>
              <Span>{booking.id}</Span>
            </Container>
            <Container>
              <Span>
                <EditableText field="manage.status" defaultValue="Status:">
                  Status:
                </EditableText>
              </Span>
              <Span>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Span>
            </Container>
            <Container>
              <Span>
                <EditableText field="manage.passenger" defaultValue="Passenger:">
                  Passenger:
                </EditableText>
              </Span>
              <Span>{booking.name}</Span>
            </Container>
            <Container>
              <Span>
                <EditableText field="manage.route" defaultValue="Route:">
                  Route:
                </EditableText>
              </Span>
              <Span>{booking.pickupLocation} → {booking.dropoffLocation}</Span>
            </Container>
            <Container>
              <Span>
                <EditableText field="manage.pickupTime" defaultValue="Pickup Time:">
                  Pickup Time:
                </EditableText>
              </Span>
              <Span>{new Date(booking.pickupDateTime).toLocaleString()}</Span>
            </Container>
            <Container>
              <Span>
                <EditableText field="manage.totalFare" defaultValue="Total Fare:">
                  Total Fare:
                </EditableText>
              </Span>
              <Span>${booking.fare?.toFixed(2)}</Span>
            </Container>
            {booking.balanceDue > 0 && (
              <Container>
                <Span>
                  <EditableText field="manage.balanceDue" defaultValue="Balance Due:">
                    Balance Due:
                  </EditableText>
                </Span>
                <Span>${booking.balanceDue.toFixed(2)}</Span>
              </Container>
            )}
          </Stack>
        </Container>
      </GridSection>

      {/* Action Buttons */}
      <GridSection variant="content" columns={1}>
        <Container>
          <ActionButtonGroup buttons={actionButtons} />
        </Container>
      </GridSection>

      {/* Action Messages */}
      {actionMsg && (
        <GridSection variant="content" columns={1}>
          <Container>
            <EditableText field="manage.actionMessage" defaultValue={actionMsg}>
              {actionMsg}
            </EditableText>
          </Container>
        </GridSection>
      )}
    </CustomerLayout>
  );
}

export default function ManageBookingPage() {
  return (
    <ToastProvider>
      <ManageBookingPageContent />
    </ToastProvider>
  );
}
