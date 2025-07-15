'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createFeedback } from '@/lib/feedback-service';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { StarRating } from '@/components/feedback';
import { Alert } from '@/components/feedback';
import { FormSection } from '@/components/forms';
import { Card, CardContent } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  const params = useParams();
  const { id: bookingId } = params;
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { config: cmsConfig } = useCMS();
  const feedbackContent = cmsConfig?.pages?.feedback;

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
    if (feedbackContent) {
      setLocalContent(feedbackContent);
    }
  }, [feedbackContent]);

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
          feedback: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(feedbackContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(feedbackContent?.errorNoRating || 'Please select a star rating.');
      return;
    }
    setError(null);

    try {
      await createFeedback({
        bookingId: bookingId as string,
        rating,
        comments,
      });
      setSubmitted(true);
    } catch {
      setError(feedbackContent?.errorSubmission || 'Sorry, there was an issue submitting your feedback. Please try again later.');
    }
  };

  if (submitted) {
    return (
      <PageContainer maxWidth="md" padding="lg">
        <div className="text-center">
          <Alert variant="success" title={feedbackContent?.successTitle || "Thank You!"}>
            {feedbackContent?.successMessage || "Your feedback is greatly appreciated and helps us improve our service."}
          </Alert>
        </div>
      </PageContainer>
    );
  }

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
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-primary text-text-inverse hover:bg-brand-primary-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={saving}
                variant="outline"
                className="bg-bg-secondary text-text-primary hover:bg-bg-muted"
              >
                Cancel
              </Button>
              {saveMsg && <div className="mt-2 text-sm text-success">{saveMsg}</div>}
            </div>
          )}
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
          <label className="edit-label font-semibold">Page Subtitle</label>
          <input
            className="editable-input text-xl text-text-secondary w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-12 px-4"
            value={localContent?.subtitle || ''}
            onChange={e => handleFieldChange('subtitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Rate Experience Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.rateExperienceTitle || ''}
            onChange={e => handleFieldChange('rateExperienceTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Rate Experience Description</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.rateExperienceDescription || ''}
            onChange={e => handleFieldChange('rateExperienceDescription', e.target.value)}
          />
          <label className="edit-label font-semibold">Comments Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.commentsTitle || ''}
            onChange={e => handleFieldChange('commentsTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Comments Label</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.commentsLabel || ''}
            onChange={e => handleFieldChange('commentsLabel', e.target.value)}
          />
          <label className="edit-label font-semibold">Comments Placeholder</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.commentsPlaceholder || ''}
            onChange={e => handleFieldChange('commentsPlaceholder', e.target.value)}
          />
          <label className="edit-label font-semibold">Submit Button Text</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.submitButton || ''}
            onChange={e => handleFieldChange('submitButton', e.target.value)}
          />
          <label className="edit-label font-semibold">Success Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.successTitle || ''}
            onChange={e => handleFieldChange('successTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Success Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
            value={localContent?.successMessage || ''}
            onChange={e => handleFieldChange('successMessage', e.target.value)}
            rows={3}
          />
          <label className="edit-label font-semibold">Error - No Rating</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.errorNoRating || ''}
            onChange={e => handleFieldChange('errorNoRating', e.target.value)}
          />
          <label className="edit-label font-semibold">Error - Submission Failed</label>
          <input
            className="editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-10 px-4"
            value={localContent?.errorSubmission || ''}
            onChange={e => handleFieldChange('errorSubmission', e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-primary text-text-inverse hover:bg-brand-primary-hover"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="bg-bg-secondary text-text-primary hover:bg-bg-muted"
            >
              Cancel
            </Button>
            {saveMsg && <div className="mt-2 text-sm text-success">{saveMsg}</div>}
          </div>
        </div>
      ) : (
        <PageHeader 
          title={feedbackContent?.title || "Leave Feedback"} 
          subtitle={feedbackContent?.subtitle}
        />
      )}
      
      <PageContent>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <FormSection 
                title={feedbackContent?.rateExperienceTitle || "Rate Your Experience"} 
                description={feedbackContent?.rateExperienceDescription || "How was your ride?"}
              >
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    onRatingChange={handleRating}
                    interactive={true}
                    size="lg"
                  />
                </div>
              </FormSection>

              <FormSection title={feedbackContent?.commentsTitle || "Additional Comments"}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {feedbackContent?.commentsLabel || "Comments"}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={feedbackContent?.commentsPlaceholder || "Tell us about your experience..."}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </FormSection>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={rating === 0}
                >
                  {feedbackContent?.submitButton || "Submit Feedback"}
                </Button>
              </div>
            </form>
            
            {error && (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
