'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { BookingCard } from '@/components/booking';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Button } from '@/components/ui/button';
import { EditableInput } from '@/components/forms';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

export default function ManageBookingPage() {
  const { id } = useParams();
  const router = useRouter();

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
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (user && (user.email === 'justin@fairfieldairportcar.com' || user.email === 'gregg@fairfieldairportcar.com')) {
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
            noBookingMessage: 'No booking reference found, but your payment was processed.',
            currentStatusLabel: 'Current Status:',
            viewDetailsButton: 'View Detailed Status',
            loadingMessage: 'Loading your booking...'
          },
          bookingDetails: cmsConfig?.pages.bookingDetails || {
            title: 'Booking Confirmed!',
            subtitle: 'Your ride is booked successfully',
            successMessage: 'You will receive an SMS confirmation shortly. We will contact you if there are any issues.',
            payDepositButton: 'Pay Deposit',
            editBookingButton: 'Edit Booking',
            cancelBookingButton: 'Cancel Booking',
            cancelConfirmMessage: 'Are you sure you want to cancel this booking?',
            cancelSuccessMessage: 'Booking cancelled successfully.',
            paymentError: 'Failed to create payment link.',
            notFoundMessage: 'No booking found with the provided ID.',
            loadingMessage: 'Loading booking details...'
          },
          feedback: cmsConfig?.pages.feedback || {
            title: 'Leave Feedback',
            subtitle: 'Help us improve our service',
            rateExperienceTitle: 'Rate Your Experience',
            rateExperienceDescription: 'How was your ride?',
            commentsTitle: 'Additional Comments',
            commentsLabel: 'Comments',
            commentsPlaceholder: 'Tell us about your experience...',
            submitButton: 'Submit Feedback',
            successTitle: 'Thank You!',
            successMessage: 'Your feedback is greatly appreciated and helps us improve our service.',
            errorNoRating: 'Please select a star rating.',
            errorSubmission: 'Sorry, there was an issue submitting your feedback. Please try again later.'
          },
          cancel: cmsConfig?.pages.cancel || {
            title: 'Payment Canceled',
            subtitle: 'Your payment was not completed',
            errorTitle: 'Payment Canceled',
            errorMessage: 'Your payment was canceled. Please try again.'
          },
          manage: localContent,
        },
      });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(null), 2000);
      setEditMode(false);
    } catch {
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalContent(JSON.parse(JSON.stringify(manageContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, 'bookings', id as string),
      (snap) => {
        if (snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() } as Booking);
        } else {
          setError(manageContent?.notFoundMessage || 'Booking not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setError('Failed to load booking');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id, manageContent]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmed = window.confirm(manageContent?.cancelConfirmMessage || 'Are you sure you want to cancel this ride? A cancellation fee may apply.');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(manageContent?.cancelSuccessMessage || 'Ride cancelled. You will receive a confirmation shortly.');
      } else {
        setActionMsg(data.error || 'Failed to cancel');
      }
    } catch {
      setActionMsg('Network error');
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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text={manageContent?.loadingMessage || "Loading booking details..."} />
        </div>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <Alert variant="error" title="Error">
          {error || 'Booking not found'}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md" padding="lg">
      {/* Floating Edit Mode Toggle for Admins */}
      {isAdmin && (
        <div style={{ position: 'fixed', top: 88, right: 24, zIndex: 50 }}>
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
            >
              Edit Mode
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="success"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}
          {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
        </div>
      )}

      {/* Page Header */}
      {editMode ? (
        <div className="mb-8 bg-white p-6 rounded shadow flex flex-col gap-4">
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
          <div className="flex gap-2 mt-4">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
          </div>
        </div>
      ) : (
        <PageHeader 
          title={manageContent?.title || "Manage Your Booking"} 
          subtitle={typeof manageContent?.subtitle === 'string' && typeof booking?.id === 'string' ? manageContent.subtitle.replace('{bookingId}', booking.id) : `Reference: ${booking?.id ?? ''}`}
        />
      )}
      
      <PageContent>
        <BookingCard 
          booking={booking} 
          showActions={false}
        />
        
        <div className="space-y-3">
          <Button 
            onClick={handleResend}
            className="w-full"
          >
            {manageContent?.resendButton || "Re-send Confirmation Email/SMS"}
          </Button>

          {booking.status !== 'cancelled' && (
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              className="w-full"
            >
              {manageContent?.cancelButton || "Cancel Ride"}
            </Button>
          )}

          {booking.balanceDue > 0 && booking.status === 'completed' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                const res = await fetch('/api/complete-payment', { 
                  method: 'POST', 
                  headers: { 'Content-Type':'application/json' }, 
                  body: JSON.stringify({ bookingId: booking.id })
                });
                if (res.ok) {
                  const { paymentLinkUrl } = await res.json();
                  window.location.href = paymentLinkUrl;
                } else {
                  setActionMsg(manageContent?.payBalanceErrorMessage || 'Failed to create balance payment link');
                }
              }}
            >
              {manageContent?.payBalanceButton || "Pay Remaining Balance"} (${booking.balanceDue.toFixed(2)})
            </Button>
          )}
        </div>

        {actionMsg && (
          <Alert variant="info" title="Action Result">
            {actionMsg}
          </Alert>
        )}

        <Button 
          variant="outline"
          onClick={() => router.push(`/status/${booking.id}`)}
          className="w-full"
        >
          {manageContent?.viewStatusButton || "View Status Page"}
        </Button>
      </PageContent>
    </PageContainer>
  );
} 