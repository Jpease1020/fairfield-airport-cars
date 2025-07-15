
"use client";

import type { NextPage } from 'next';
import BookingForm from './booking-form';
import { useCMS } from '@/hooks/useCMS';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';
import { Button } from '@/components/ui/button';

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
          help: cmsConfig?.pages.help || { faq: [], contactInfo: { phone: '', email: '', hours: '' } },
          booking: localContent,
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
    setLocalContent(JSON.parse(JSON.stringify(bookingPageContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  if (cmsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B1F3A] to-[#1E2C4C]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-6 h-6 text-gray-600 mx-auto mb-4"></div>
            <span className="text-sm text-gray-200">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1F3A] to-[#1E2C4C] flex items-center justify-center p-6">
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
          {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
        </div>
      )}

      <div className="bg-white text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-3xl max-w-xl w-full p-8 md:p-12 flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
          {/* Replace with your car logo SVG, e.g.: */}
          {/* <img src="/car.svg" alt="Fairfield Car Service Logo" className="h-12 w-auto" /> */}
          <svg width="48" height="48" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#0B1F3A" fill-rule="evenodd"/></svg>
        </div>
        {/* Page Header */}
        {editMode ? (
          <div className="text-center mb-8 flex flex-col gap-4">
            <label className="edit-label font-semibold">Page Title</label>
            <input
              className="editable-input text-3xl md:text-4xl font-serif font-bold w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-14 px-4"
              value={localContent?.title || ''}
              onChange={e => handleFieldChange('title', e.target.value)}
            />
            <label className="edit-label font-semibold">Page Subtitle</label>
            <input
              className="editable-input text-lg md:text-xl w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg h-12 px-4"
              value={localContent?.subtitle || ''}
              onChange={e => handleFieldChange('subtitle', e.target.value)}
            />
            <label className="edit-label font-semibold">Page Description</label>
            <textarea
              className="editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4"
              value={localContent?.description || ''}
              onChange={e => handleFieldChange('description', e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 mt-4 justify-center">
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
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              {bookingPageContent?.title || "Book Your Ride"}
            </h1>
            <p className="text-gray-900 text-lg mb-2">
              {bookingPageContent?.subtitle || "Premium airport transportation service"}
            </p>
            {bookingPageContent?.description && (
              <p className="text-gray-600 text-base max-w-2xl mx-auto mt-2">
                {bookingPageContent.description}
              </p>
            )}
          </div>
        )}
        <BookingForm />
      </div>
    </div>
  );
};

export default BookPage;
