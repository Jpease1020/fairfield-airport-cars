'use client';

import { useEffect, useState, Suspense } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';
import { Booking } from '@/types/booking';

import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useCMS } from '@/hooks/useCMS';


import { cmsService } from '@/lib/services/cms-service';
import { Layout, Container, Stack, Section } from '@/components/ui/containers';

import { authService } from '@/lib/services/auth-service';
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
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && await authService.isAdmin(user.uid)) {
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
    if (!localContent) return;
    
    setSaving(true);
    setSaveMsg(null);
    
    try {
      const currentConfig = await cmsService.getCMSConfiguration();
      if (!currentConfig) {
        setSaveMsg('Error: Could not load current configuration');
        return;
      }
      
      const updatedConfig = {
        ...currentConfig,
        pages: {
          ...currentConfig.pages,
          success: localContent
        }
      };
      
      await cmsService.updateCMSConfiguration(updatedConfig);
      setSaveMsg('Content saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveMsg('Error saving content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (successPageContent) {
      setLocalContent(successPageContent);
    }
    setSaveMsg(null);
  };

  const content = localContent || successPageContent || {
    title: 'Payment Successful!',
    subtitle: 'Your booking has been confirmed',
    paymentSuccessTitle: 'Payment Processed',
    paymentSuccessMessage: 'Your payment has been successfully processed.',
    noBookingTitle: 'Payment Successful',
    noBookingMessage: 'No booking reference found, but your payment was processed.',
    currentStatusLabel: 'Current Status:',
    viewDetailsButton: 'View Detailed Status',
    loadingMessage: 'Loading your booking...'
  };

  useEffect(() => {
    if (bookingId) {
      const unsubscribe = onSnapshot(
        doc(db, 'bookings', bookingId),
        (doc) => {
          if (doc.exists()) {
            setBooking({ id: doc.id, ...doc.data() } as Booking);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching booking:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Layout spacing="none" container maxWidth="xl">
          <Container padding="lg" margin="none">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner text={content.loadingMessage} />
            </div>
          </Container>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Layout spacing="lg" container maxWidth="xl">
        {/* Admin Edit Controls */}
        {isAdmin && (
          <Card>
            <CardContent className="p-4">
              <Stack spacing="md">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {editMode ? 'Exit Edit Mode' : 'Edit Content'}
                  </Button>
                  {editMode && (
                    <>
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                {saveMsg && (
                  <div className={`p-2 rounded text-sm ${
                    saveMsg.includes('Error') ? 'bg-error text-text-inverse' : 'bg-success text-text-inverse'
                  }`}>
                    {saveMsg}
                  </div>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Success Content */}
        <Section variant="brand" padding="lg" margin="none">
          <Container maxWidth="xl" padding="none">
            <Stack spacing="lg" align="center">
              {editMode ? (
                <Stack spacing="md" align="center">
                  <div>
                    <label className="edit-label font-semibold">Page Title</label>
                    <input
                      className="editable-input text-4xl font-bold text-center w-full mb-2 h-14 px-4"
                      value={content.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="edit-label font-semibold">Page Subtitle</label>
                    <input
                      className="editable-input text-xl text-center w-full mb-2 h-12 px-4"
                      value={content.subtitle}
                      onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                    />
                  </div>
                </Stack>
              ) : (
                <Stack spacing="md" align="center">
                  <h1 className="text-4xl font-bold text-text-inverse">
                    {content.title}
                  </h1>
                  <p className="text-xl text-text-inverse">
                    {content.subtitle}
                  </p>
                </Stack>
              )}

              {booking ? (
                <Card>
                  <CardContent className="p-6">
                    <Stack spacing="md">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                          {editMode ? (
                            <input
                              className="editable-input text-2xl font-bold text-center w-full mb-2 h-12 px-4"
                              value={content.paymentSuccessTitle}
                              onChange={(e) => handleFieldChange('paymentSuccessTitle', e.target.value)}
                            />
                          ) : (
                            content.paymentSuccessTitle
                          )}
                        </h2>
                        <p className="text-text-secondary">
                          {editMode ? (
                            <textarea
                              className="editable-textarea text-center w-full mb-2 p-4"
                              value={content.paymentSuccessMessage}
                              onChange={(e) => handleFieldChange('paymentSuccessMessage', e.target.value)}
                              rows={3}
                            />
                          ) : (
                            content.paymentSuccessMessage
                          )}
                        </p>
                      </div>

                      <div className="border-t border-border-primary pt-4">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          {editMode ? (
                            <input
                              className="editable-input text-lg font-semibold w-full mb-2 h-10 px-4"
                              value={content.currentStatusLabel}
                              onChange={(e) => handleFieldChange('currentStatusLabel', e.target.value)}
                            />
                          ) : (
                            content.currentStatusLabel
                          )}
                        </h3>
                        <p className="text-text-secondary mb-4">{booking.status}</p>
                        <Button 
                          onClick={() => router.push(`/booking/${booking.id}`)}
                          className="w-full"
                        >
                          {editMode ? (
                            <input
                              className="editable-input text-center w-full"
                              value={content.viewDetailsButton}
                              onChange={(e) => handleFieldChange('viewDetailsButton', e.target.value)}
                            />
                          ) : (
                            content.viewDetailsButton
                          )}
                        </Button>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <Stack spacing="md" align="center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                          {editMode ? (
                            <input
                              className="editable-input text-2xl font-bold text-center w-full mb-2 h-12 px-4"
                              value={content.noBookingTitle}
                              onChange={(e) => handleFieldChange('noBookingTitle', e.target.value)}
                            />
                          ) : (
                            content.noBookingTitle
                          )}
                        </h2>
                        <p className="text-text-secondary">
                          {editMode ? (
                            <textarea
                              className="editable-textarea text-center w-full mb-2 p-4"
                              value={content.noBookingMessage}
                              onChange={(e) => handleFieldChange('noBookingMessage', e.target.value)}
                              rows={3}
                            />
                          ) : (
                            content.noBookingMessage
                          )}
                        </p>
                      </div>
                      <Button 
                        onClick={() => router.push('/')}
                        className="w-full"
                      >
                        Return to Home
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Container>
        </Section>
      </Layout>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary">
        <Layout spacing="none" container maxWidth="xl">
          <Container padding="lg" margin="none">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner text="Loading..." />
            </div>
          </Container>
        </Layout>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
