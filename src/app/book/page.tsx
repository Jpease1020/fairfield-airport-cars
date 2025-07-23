
"use client";

import type { NextPage } from 'next';
import Image from 'next/image';
import BookingForm from './booking-form';
import { useCMS } from '@/hooks/useCMS';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';
import { Button } from '@/components/ui/button';
import { EditableInput, EditableTextarea } from '@/components/forms';
import { Layout, Container, Stack, Card, Section } from '@/components/ui/containers';

const BookPage: NextPage = () => {
  const { config: cmsConfig, loading: cmsLoading } = useCMS();
  const bookingPageContent = cmsConfig?.pages?.booking;

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
    if (bookingPageContent) {
      setLocalContent(bookingPageContent);
    }
  }, [bookingPageContent]);

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
          booking: localContent
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
    if (bookingPageContent) {
      setLocalContent(bookingPageContent);
    }
    setSaveMsg(null);
  };

  const content = localContent || bookingPageContent || {
    title: 'Book Your Ride',
    subtitle: 'Premium airport transportation service',
    description: 'Reserve your luxury airport transportation with our professional drivers.'
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Layout spacing="none" container maxWidth="full">
        <Section variant="default" padding="lg" margin="none">
          <Container maxWidth="xl" padding="none">
            <Stack spacing="lg" align="center">
              {/* Admin Edit Controls */}
              {isAdmin && (
                <Card padding="md" margin="none">
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
                </Card>
              )}

              {/* Page Header */}
              <div className="text-center">
                {editMode ? (
                  <Stack spacing="md" align="center">
                    <EditableInput
                      value={content.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="text-4xl font-bold text-text-primary"
                      placeholder="Page Title"
                    />
                    <EditableInput
                      value={content.subtitle}
                      onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                      className="text-xl text-text-secondary"
                      placeholder="Page Subtitle"
                    />
                    <EditableTextarea
                      value={content.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="text-lg text-text-secondary max-w-2xl"
                      placeholder="Page Description"
                      rows={3}
                    />
                  </Stack>
                ) : (
                  <Stack spacing="md" align="center">
                    <h1 className="text-4xl font-bold text-text-primary">
                      {content.title}
                    </h1>
                    <p className="text-xl text-text-secondary">
                      {content.subtitle}
                    </p>
                    <p className="text-lg text-text-secondary max-w-2xl">
                      {content.description}
                    </p>
                  </Stack>
                )}
              </div>

              {/* Booking Form */}
              <BookingForm />
            </Stack>
          </Container>
        </Section>
      </Layout>
    </div>
  );
};

export default BookPage;
