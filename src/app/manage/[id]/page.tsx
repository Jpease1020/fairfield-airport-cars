'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { Booking } from '@/types/booking';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  LoadingSpinner,
  StatusMessage
} from '@/components/ui';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';
import { User } from 'firebase/auth';
import { EditableInput } from '@/components/forms';
import { useCMS } from '@/hooks/useCMS';
import { cmsService } from '@/lib/services/cms-service';
import { authService } from '@/lib/services/auth-service';
import { ToastProvider, useToast } from '@/components/ui';

function ManageBookingPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  
  const { config: cmsConfig } = useCMS();
  const manageContent = cmsConfig?.pages?.manage;

  // Admin detection and edit mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Admin detection
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && await authService.isAdmin(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Initialize local content when CMS content loads
  useEffect(() => {
    if (manageContent) {
      setLocalContent(manageContent);
    }
  }, [manageContent]);

  // Edit mode handlers
  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await cmsService.updateCMSConfiguration({
        pages: {
          home: cmsConfig?.pages.home || {
            hero: { title: '', subtitle: '', ctaText: '' },
            features: { title: '', items: [] },
            about: { title: '', content: '' },
            contact: { title: '', content: '', phone: '', email: '' },
          },
          help: cmsConfig?.pages.help || {
            faq: [],
            contactInfo: { phone: '', email: '', hours: '' },
          },
          booking: cmsConfig?.pages.booking || {
            title: 'Book Your Ride',
            subtitle: 'Premium airport transportation service',
            description: 'Reserve your luxury airport transportation with our professional drivers.'
          },
          success: cmsConfig?.pages.success || {
            title: 'Payment Successful!',
            subtitle: 'Your booking has been confirmed',
            paymentSuccessTitle: 'Payment Processed',
            paymentSuccessMessage: 'Your payment has been successfully processed.',
            noBookingTitle: 'Payment Successful',
            noBookingMessage: 'Your payment was processed but no booking was found.',
            currentStatusLabel: 'Current Status:',
            viewDetailsButton: 'View Detailed Status',
            loadingMessage: 'Loading your booking...'
          },
          manage: localContent
        }
      });
      setSaveMsg('Changes saved successfully!');
      setEditMode(false);
      addToast('success', 'Changes saved successfully!');
    } catch (error) {
      console.error('Failed to save CMS changes:', error);
      setSaveMsg('Failed to save changes');
      addToast('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalContent(manageContent);
    setEditMode(false);
    setSaveMsg(null);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    const confirmMessage = manageContent?.cancelConfirmMessage || 'Are you sure you want to cancel this booking?';
    if (!confirm(confirmMessage)) return;
    
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      
      if (res.ok) {
        const successMsg = manageContent?.cancelSuccessMessage || 'Booking cancelled successfully';
        setActionMsg(successMsg);
        addToast('success', successMsg);
        // Refresh booking data
        const updatedBooking = await res.json();
        setBooking(updatedBooking);
      } else {
        const errorMsg = 'Failed to cancel booking';
        setActionMsg(errorMsg);
        addToast('error', errorMsg);
      }
    } catch {
      const errorMsg = 'Network error';
      setActionMsg(errorMsg);
      addToast('error', errorMsg);
    }
  };

  const handleResend = async () => {
    if (!booking) return;
    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (res.ok) setActionMsg(manageContent?.resendSuccessMessage || 'Confirmation sent!');
      else setActionMsg(manageContent?.resendErrorMessage || 'Failed to send confirmation');
    } catch {
      setActionMsg('Network error');
    }
  };

  if (loading) {
    return (
      <UnifiedLayout 
        layoutType="standard"
        title="Manage Booking"
        subtitle="Loading booking details..."
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="Loading..." description="Fetching booking details">
            <div className="manage-booking-loading">
              <LoadingSpinner text={manageContent?.loadingMessage || "Loading booking details..."} />
            </div>
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
            <div className="manage-booking-error">
              <p className="manage-booking-error-message">
                {error || manageContent?.notFoundMessage || 'Booking not found'}
              </p>
              <ActionButtonGroup buttons={[
                {
                  label: 'Book a New Ride',
                  onClick: () => window.location.href = '/book',
                  variant: 'primary' as const,
                  icon: '🚗'
                }
              ]} />
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  const actionButtons = [
    {
      label: manageContent?.resendButton || "Re-send Confirmation",
      onClick: handleResend,
      variant: 'outline' as const,
      icon: '📧'
    },
    {
      label: manageContent?.viewStatusButton || "View Status",
      onClick: () => router.push(`/status/${booking.id}`),
      variant: 'outline' as const,
      icon: '📊'
    }
  ];

  // Add cancel button if booking is not cancelled
  if (booking.status !== 'cancelled') {
    actionButtons.push({
      label: manageContent?.cancelButton || "Cancel Ride",
      onClick: handleCancelBooking,
      variant: 'outline' as const,
      icon: '❌'
    });
  }

  // Add pay balance button if there's a balance due
  if (booking.balanceDue > 0 && booking.status === 'completed') {
    actionButtons.push({
      label: `${manageContent?.payBalanceButton || "Pay Balance"} ($${booking.balanceDue.toFixed(2)})`,
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
          const errorMsg = manageContent?.payBalanceErrorMessage || 'Failed to create balance payment link';
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
      title={manageContent?.title || "Manage Your Booking"}
      subtitle={typeof manageContent?.subtitle === 'string' && typeof booking?.id === 'string' ? manageContent.subtitle.replace('{bookingId}', booking.id) : `Reference: ${booking?.id ?? ''}`}
    >
      {/* Admin Edit Mode Toggle */}
      {isAdmin && (
        <GridSection variant="content" columns={1}>
          <InfoCard title="🔧 Admin Controls" description="Edit page content">
            <div className="manage-booking-admin-controls">
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
                <div className="manage-booking-edit-controls">
                                     <ActionButtonGroup buttons={[
                     {
                       label: saving ? 'Saving...' : 'Save',
                       onClick: handleSave,
                       variant: 'primary' as const,
                       icon: '💾',
                       disabled: saving
                     },
                     {
                       label: 'Cancel',
                       onClick: handleCancel,
                       variant: 'outline' as const,
                       icon: '❌',
                       disabled: saving
                     }
                   ]} />
                  {saveMsg && (
                    <div className="manage-booking-save-message">
                      {saveMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </InfoCard>
        </GridSection>
      )}

      {/* Edit Mode Content */}
      {editMode && isAdmin && (
        <GridSection variant="content" columns={1}>
          <InfoCard title="📝 Edit Page Content" description="Modify the text content of this page">
            <div className="manage-booking-edit-form">
              <EditableInput
                label="Page Title"
                value={localContent?.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                size="xl"
                variant="title"
              />
              <EditableInput
                label="Page Subtitle"
                value={localContent?.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                size="lg"
                variant="subtitle"
              />
              <EditableInput
                label="Resend Button Text"
                value={localContent?.resendButton || ''}
                onChange={(e) => handleFieldChange('resendButton', e.target.value)}
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
                label="View Status Button Text"
                value={localContent?.viewStatusButton || ''}
                onChange={(e) => handleFieldChange('viewStatusButton', e.target.value)}
              />
              <EditableInput
                label="Cancel Confirm Message"
                value={localContent?.cancelConfirmMessage || ''}
                onChange={(e) => handleFieldChange('cancelConfirmMessage', e.target.value)}
              />
              <EditableInput
                label="Cancel Success Message"
                value={localContent?.cancelSuccessMessage || ''}
                onChange={(e) => handleFieldChange('cancelSuccessMessage', e.target.value)}
              />
              <EditableInput
                label="Resend Success Message"
                value={localContent?.resendSuccessMessage || ''}
                onChange={(e) => handleFieldChange('resendSuccessMessage', e.target.value)}
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
            </div>
          </InfoCard>
        </GridSection>
      )}

      {/* Booking Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="📋 Booking Information"
          description="Your booking details and current status"
        >
          <div className="manage-booking-details">
            <div className="manage-booking-item">
              <span className="manage-booking-label">Booking ID:</span>
              <span className="manage-booking-value">{booking.id}</span>
            </div>
            <div className="manage-booking-item">
              <span className="manage-booking-label">Status:</span>
              <span className={`manage-booking-status manage-booking-status-${booking.status}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="manage-booking-item">
              <span className="manage-booking-label">Passenger:</span>
              <span className="manage-booking-value">{booking.name}</span>
            </div>
            <div className="manage-booking-item">
              <span className="manage-booking-label">Route:</span>
              <span className="manage-booking-value">{booking.pickupLocation} → {booking.dropoffLocation}</span>
            </div>
            <div className="manage-booking-item">
              <span className="manage-booking-label">Pickup Time:</span>
              <span className="manage-booking-value">{new Date(booking.pickupDateTime).toLocaleString()}</span>
            </div>
            <div className="manage-booking-item">
              <span className="manage-booking-label">Total Fare:</span>
              <span className="manage-booking-value">${booking.fare?.toFixed(2)}</span>
            </div>
            {booking.balanceDue > 0 && (
              <div className="manage-booking-item">
                <span className="manage-booking-label">Balance Due:</span>
                <span className="manage-booking-value manage-booking-balance">${booking.balanceDue.toFixed(2)}</span>
              </div>
            )}
          </div>
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
            <div className="manage-booking-action-message">
              {actionMsg}
            </div>
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
