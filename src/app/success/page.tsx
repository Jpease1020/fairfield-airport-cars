'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const { config: cmsConfig } = useCMS();
  const successPageContent = cmsConfig?.pages?.success;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(!!bookingId);

  // Admin detection
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
    if (successPageContent) {
      setLocalContent(successPageContent);
    }
  }, [successPageContent]);

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
          success: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(successPageContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  useEffect(() => {
    if (!bookingId) return;

    const docRef = doc(db, 'bookings', bookingId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setBooking({ id: snap.id, ...snap.data() } as Booking);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  if (!bookingId) {
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
            <label className="edit-label font-semibold">No Booking Title</label>
            <input
              className="editable-input text-3xl font-bold w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-14 px-4"
              value={localContent?.noBookingTitle || ''}
              onChange={e => handleFieldChange('noBookingTitle', e.target.value)}
            />
            <label className="edit-label font-semibold">No Booking Message</label>
            <textarea
              className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
              value={localContent?.noBookingMessage || ''}
              onChange={e => handleFieldChange('noBookingMessage', e.target.value)}
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
          <PageHeader title={successPageContent?.noBookingTitle || "Payment Successful"} />
        )}

        <PageContent>
          <Card>
            <CardContent className="p-6 text-center">
              <Alert variant="success" title={successPageContent?.noBookingTitle || "Payment Successful"}>
                {successPageContent?.noBookingMessage || "No booking reference found, but your payment was processed."}
              </Alert>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  if (loading || !booking) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text={successPageContent?.loadingMessage || "Loading your booking..."} />
        </div>
      </PageContainer>
    );
  }

  const statusText = booking.status === 'pending' ? 'Pending Confirmation' : booking.status === 'confirmed' ? 'Confirmed' : booking.status;

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
            className="editable-input text-xl w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
            value={localContent?.subtitle || ''}
            onChange={e => handleFieldChange('subtitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Payment Success Title</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
            value={localContent?.paymentSuccessTitle || ''}
            onChange={e => handleFieldChange('paymentSuccessTitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Payment Success Message</label>
          <textarea
            className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
            value={localContent?.paymentSuccessMessage || ''}
            onChange={e => handleFieldChange('paymentSuccessMessage', e.target.value)}
            rows={3}
          />
          <label className="edit-label font-semibold">Current Status Label</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
            value={localContent?.currentStatusLabel || ''}
            onChange={e => handleFieldChange('currentStatusLabel', e.target.value)}
          />
          <label className="edit-label font-semibold">View Details Button</label>
          <input
            className="editable-input w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
            value={localContent?.viewDetailsButton || ''}
            onChange={e => handleFieldChange('viewDetailsButton', e.target.value)}
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
          title={successPageContent?.title || "Payment Successful!"} 
          subtitle={`${successPageContent?.subtitle || "Your booking has been confirmed"} - Booking reference: ${bookingId}`}
        />
      )}

      <PageContent>
        <Card>
          <CardContent className="p-8 text-center">
            <Alert variant="success" title={successPageContent?.paymentSuccessTitle || "Payment Processed"}>
              {successPageContent?.paymentSuccessMessage || "Your payment has been successfully processed."}
            </Alert>
            
            <div className="mt-6">
              <p className="text-lg font-semibold mb-4">
                {successPageContent?.currentStatusLabel || "Current Status:"} <span className="capitalize">{statusText}</span>
              </p>
              
              <Button 
                onClick={() => router.push(`/status/${bookingId}`)}
                size="lg"
              >
                {successPageContent?.viewDetailsButton || "View Detailed Status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </PageContainer>
    }>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
