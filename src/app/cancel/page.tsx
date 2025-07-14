
'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { Card, CardContent } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

export default function CancelPage() {
  const { config: cmsConfig } = useCMS();
  const cancelContent = cmsConfig?.pages?.cancel;

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
    if (cancelContent) {
      setLocalContent(cancelContent);
    }
  }, [cancelContent]);

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
          cancel: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(cancelContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  return (
    <PageContainer maxWidth="md" padding="lg">
      {/* Floating Edit Mode Toggle for Admins */}
      {isAdmin && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
          {!editMode ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={() => setEditMode(true)}
            >
              Edit Mode
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
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
            className="editable-input text-3xl font-bold w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-14 px-4"
            value={localContent?.title || ''}
            onChange={e => handleFieldChange('title', e.target.value)}
          />
          <label className="edit-label font-semibold">Page Subtitle</label>
          <input
            className="editable-input text-xl text-gray-600 w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
            value={localContent?.subtitle || ''}
            onChange={e => handleFieldChange('subtitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Error Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-10 px-4"
            value={localContent?.errorTitle || ''}
            onChange={e => handleFieldChange('errorTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Error Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
            value={localContent?.errorMessage || ''}
            onChange={e => handleFieldChange('errorMessage', e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition-all"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold shadow hover:bg-gray-500 transition-all"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
          </div>
        </div>
      ) : (
        <PageHeader 
          title={cancelContent?.title || "Payment Canceled"} 
          subtitle={cancelContent?.subtitle}
        />
      )}
      
      <PageContent>
        <Card>
          <CardContent className="p-8 text-center">
            <Alert variant="error" title={cancelContent?.errorTitle || "Payment Canceled"}>
              {cancelContent?.errorMessage || "Your payment was canceled. Please try again."}
            </Alert>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};


