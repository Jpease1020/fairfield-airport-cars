'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBooking, deleteBooking } from '@/lib/booking-service';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { BookingCard } from '@/components/booking';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { config: cmsConfig } = useCMS();
  const bookingDetailsContent = cmsConfig?.pages?.bookingDetails;

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
    if (bookingDetailsContent) {
      setLocalContent(bookingDetailsContent);
    }
  }, [bookingDetailsContent]);

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
          bookingDetails: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(bookingDetailsContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          const bookingData = await getBooking(id as string);
          if (bookingData) {
            setBooking(bookingData);
          } else {
            setError('Booking not found.');
          }
        } catch {
          setError('Failed to fetch booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id]);

  const handleCancelBooking = async () => {
    if (window.confirm(bookingDetailsContent?.cancelConfirmMessage || 'Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(id as string);
        alert(bookingDetailsContent?.cancelSuccessMessage || 'Booking cancelled successfully.');
        router.push('/');
      } catch {
        setError('Failed to cancel booking.');
      }
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Math.ceil((booking.depositAmount ?? booking.fare / 2) * 100),
          currency: 'USD',
          description: `Deposit for ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
        }),
      });

      if (response.ok) {
        const { paymentLinkUrl } = await response.json();
        window.location.href = paymentLinkUrl;
      } else {
        setError(bookingDetailsContent?.paymentError || 'Failed to create payment link.');
      }
    } catch {
      setError('Failed to initiate payment.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text={bookingDetailsContent?.loadingMessage || "Loading booking details..."} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </PageContainer>
    );
  }

  if (!booking) {
    return (
      <PageContainer>
        <Alert variant="error" title="Booking Not Found">
          {bookingDetailsContent?.notFoundMessage || "No booking found with the provided ID."}
        </Alert>
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
                variant="success"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="secondary"
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
          <label className="edit-label font-semibold">Success Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
            value={localContent?.successMessage || ''}
            onChange={e => handleFieldChange('successMessage', e.target.value)}
            rows={3}
          />
          <label className="edit-label font-semibold">Pay Deposit Button Text</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-10 px-4"
            value={localContent?.payDepositButton || ''}
            onChange={e => handleFieldChange('payDepositButton', e.target.value)}
          />
          <label className="edit-label font-semibold">Edit Booking Button Text</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-10 px-4"
            value={localContent?.editBookingButton || ''}
            onChange={e => handleFieldChange('editBookingButton', e.target.value)}
          />
          <label className="edit-label font-semibold">Cancel Booking Button Text</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-10 px-4"
            value={localContent?.cancelBookingButton || ''}
            onChange={e => handleFieldChange('cancelBookingButton', e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
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
          title={bookingDetailsContent?.title || "Booking Confirmed!"} 
          subtitle={bookingDetailsContent?.subtitle || "Your ride is booked successfully"}
        />
      )}
      
      <PageContent>
        <Alert variant="success" title="Success">
          {bookingDetailsContent?.successMessage || "You will receive an SMS confirmation shortly. We will contact you if there are any issues."}
        </Alert>
        
        <BookingCard 
          booking={booking} 
          showActions={false}
        />
        
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            className="w-full"
            size="lg"
          >
            {bookingDetailsContent?.payDepositButton || "Pay Deposit"} (${(booking.depositAmount ?? booking.fare / 2).toFixed(2)})
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/booking/${booking.id}/edit`)}
          >
            {bookingDetailsContent?.editBookingButton || "Edit Booking"}
          </Button>
          
          <Button 
            variant="destructive"
            className="w-full"
            onClick={handleCancelBooking}
          >
            {bookingDetailsContent?.cancelBookingButton || "Cancel Booking"}
          </Button>
        </div>
      </PageContent>
    </PageContainer>
  );
}
