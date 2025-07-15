'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc as fsDoc, onSnapshot as fsSnap } from 'firebase/firestore';
import { doc as fsDocDriver } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

// Status step calculation removed as it's handled by ProgressIndicator component

export default function RideStatusPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLoc, setDriverLoc] = useState<{ lat:number; lng:number; updatedAt: Date } | null>(null);

  const { config: cmsConfig } = useCMS();
  const statusContent = cmsConfig?.pages?.status;

  // Admin detection and edit mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (statusContent) {
      setLocalContent(statusContent);
    }
  }, [statusContent]);

  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({ ...prev, [field]: value }));
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
          manage: cmsConfig?.pages.manage || {
            title: 'Manage Your Booking',
            subtitle: 'Reference: {bookingId}',
            resendButton: 'Re-send Confirmation Email/SMS',
            cancelButton: 'Cancel Ride',
            payBalanceButton: 'Pay Remaining Balance',
            viewStatusButton: 'View Status Page',
            cancelConfirmMessage: 'Are you sure you want to cancel this ride? A cancellation fee may apply.',
            cancelSuccessMessage: 'Ride cancelled. You will receive a confirmation shortly.',
            resendSuccessMessage: 'Confirmation sent!',
            resendErrorMessage: 'Failed to send confirmation',
            payBalanceErrorMessage: 'Failed to create balance payment link',
            notFoundMessage: 'Booking not found',
            loadingMessage: 'Loading booking details...'
          },
          status: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(statusContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  useEffect(() => {
    if (!id) return;

    const docRef = fsDoc(db, 'bookings', id as string);
    
    const unsubscribe = fsSnap(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
      } else {
        setError('Booking not found.');
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to listen for booking updates:", err);
      setError('Failed to load booking status.');
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const driverDoc = fsDocDriver(db, 'drivers', 'gregg');
    const unsubDriver = fsSnap(driverDoc, (snap)=>{
      if(snap.exists()){
        const d = snap.data() as any;
        if(d.lat && d.lng && d.updatedAt){
          setDriverLoc({ lat:d.lat, lng:d.lng, updatedAt: d.updatedAt.toDate() });
        }
      }
    });
    return () => unsubDriver();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text={statusContent?.loadingMessage || "Loading ride status..."} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" title={statusContent?.alertErrorTitle || "Error"}>
          {statusContent?.alertErrorMessage || error}
        </Alert>
      </PageContainer>
    );
  }

  if (!booking) {
    return (
      <PageContainer>
        <Alert variant="error" title={statusContent?.alertNotFoundTitle || "Booking Not Found"}>
          {statusContent?.alertNotFoundMessage || "No booking found with the provided ID."}
        </Alert>
      </PageContainer>
    );
  }

  const isDriverFresh = driverLoc && (Date.now() - driverLoc.updatedAt.getTime() < 2*60*1000);

  // Remove the object array, use string array for steps
  const stepLabels = [
    statusContent?.stepPending || 'Pending',
    statusContent?.stepConfirmed || 'Confirmed',
    statusContent?.stepCompleted || 'Completed',
  ];

  // Map booking.status to step index (1-based for ProgressIndicator)
  const statusToStepIndex: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    completed: 3,
  };
  const currentStep = statusToStepIndex[booking.status] || 1;

  return (
    <PageContainer maxWidth="md" padding="lg">
      {/* Floating Edit Mode Toggle for Admins */}
      {isAdmin && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
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
          <label className="edit-label font-semibold">Page Title</label>
          <input
            className="editable-input text-3xl font-bold w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-14 px-4"
            value={localContent?.title || ''}
            onChange={e => handleFieldChange('title', e.target.value)}
          />
          <label className="edit-label font-semibold">Subtitle Label</label>
          <input
            className="editable-input text-xl text-text-secondary w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-12 px-4"
            value={localContent?.subtitleLabel || ''}
            onChange={e => handleFieldChange('subtitleLabel', e.target.value)}
          />
          <label className="edit-label font-semibold">Step: Pending</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.stepPending || ''}
            onChange={e => handleFieldChange('stepPending', e.target.value)}
          />
          <label className="edit-label font-semibold">Step: Confirmed</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.stepConfirmed || ''}
            onChange={e => handleFieldChange('stepConfirmed', e.target.value)}
          />
          <label className="edit-label font-semibold">Step: Completed</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.stepCompleted || ''}
            onChange={e => handleFieldChange('stepCompleted', e.target.value)}
          />
          <label className="edit-label font-semibold">Status Description: Pending</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.statusPending || ''}
            onChange={e => handleFieldChange('statusPending', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Status Description: Confirmed</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.statusConfirmed || ''}
            onChange={e => handleFieldChange('statusConfirmed', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Status Description: Completed</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.statusCompleted || ''}
            onChange={e => handleFieldChange('statusCompleted', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Status Description: Cancelled</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.statusCancelled || ''}
            onChange={e => handleFieldChange('statusCancelled', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Alert: Cancelled Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.alertCancelledTitle || ''}
            onChange={e => handleFieldChange('alertCancelledTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Alert: Cancelled Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.alertCancelledMessage || ''}
            onChange={e => handleFieldChange('alertCancelledMessage', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Alert: Not Found Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.alertNotFoundTitle || ''}
            onChange={e => handleFieldChange('alertNotFoundTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Alert: Not Found Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.alertNotFoundMessage || ''}
            onChange={e => handleFieldChange('alertNotFoundMessage', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Alert: Error Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.alertErrorTitle || ''}
            onChange={e => handleFieldChange('alertErrorTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Alert: Error Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.alertErrorMessage || ''}
            onChange={e => handleFieldChange('alertErrorMessage', e.target.value)}
            rows={2}
          />
          <label className="edit-label font-semibold">Loading Message</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.loadingMessage || ''}
            onChange={e => handleFieldChange('loadingMessage', e.target.value)}
          />
          <label className="edit-label font-semibold">Live Driver Location Header</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.liveDriverHeader || ''}
            onChange={e => handleFieldChange('liveDriverHeader', e.target.value)}
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
          title={statusContent?.title || "Your Ride Status"}
          subtitle={statusContent?.subtitleLabel ? `${statusContent.subtitleLabel} ${new Date(booking.pickupDateTime).toLocaleString()}` : new Date(booking.pickupDateTime).toLocaleString()}
        />
      )}
      <PageContent>
        <Card>
          <CardContent className="p-6">
            {booking.status === 'cancelled' ? (
              <Alert variant="error" title={statusContent?.alertCancelledTitle || "Booking Cancelled"}>
                {statusContent?.alertCancelledMessage || statusContent?.statusCancelled || "This booking has been cancelled."}
              </Alert>
            ) : (
              <div className="space-y-6">
                <ProgressIndicator
                  steps={stepLabels}
                  currentStep={currentStep}
                  totalSteps={stepLabels.length}
                />
                <div className="text-center p-4 bg-bg-secondary rounded-md">
                  <p className="text-text-secondary">
                    {booking.status === 'pending' && (statusContent?.statusPending || "We've received your booking and will confirm it shortly.")}
                    {booking.status === 'confirmed' && (statusContent?.statusConfirmed || "Your ride is confirmed! We'll notify you when your driver is on the way.")}
                    {booking.status === 'completed' && (statusContent?.statusCompleted || "Your ride is complete. Thank you for choosing us!")}
                  </p>
                </div>
                {isDriverFresh && (
                  <div className="mt-6">
                    <h2 className="text-lg font-medium mb-2 text-center">{statusContent?.liveDriverHeader || "Live Driver Location"}</h2>
                    <iframe
                      title="Driver live location map"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${driverLoc!.lat},${driverLoc!.lng}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
