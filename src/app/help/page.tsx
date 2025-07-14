'use client';

import type { NextPage } from 'next';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { useHelpPageContent, useBusinessSettings, useCMS } from '@/hooks/useCMS';
import { LoadingSpinner } from '@/components/data';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';

const HelpPage: NextPage = () => {
  const { content: helpContent, loading: helpLoading, error: helpError } = useHelpPageContent();
  const { settings: businessSettings, loading: businessLoading } = useBusinessSettings();
  const { config: cmsConfig } = useCMS();

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
    if (helpContent) {
      setLocalContent(helpContent);
    }
  }, [helpContent]);

  const handleFieldChange = (field: string, value: unknown, subfield?: string) => {
    setLocalContent((prev: any) => {
      const updated = { ...prev };
      if (subfield) {
        updated[field][subfield] = value;
      } else {
        updated[field] = value;
      }
      return updated;
    });
  };

  const handleFAQChange = (idx: number, field: string, value: string) => {
    setLocalContent((prev: any) => {
      const updated = { ...prev };
      updated.faq[idx][field] = value;
      return updated;
    });
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
          help: localContent,
          booking: cmsConfig?.pages.booking || {
            title: 'Book Your Ride',
            subtitle: 'Premium airport transportation service',
            description: 'Reserve your luxury airport transportation with our professional drivers.'
          },
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
    setLocalContent(JSON.parse(JSON.stringify(helpContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  if (helpLoading || businessLoading) {
    return (
      <PageContainer maxWidth="xl" padding="lg">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </PageContainer>
    );
  }

  if (helpError || !helpContent) {
    return (
      <PageContainer maxWidth="xl" padding="lg">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Unavailable</h1>
            <p className="text-gray-600">Please check back later or contact support.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Use CMS FAQ items if available, otherwise fall back to defaults
  const faqItems = helpContent.faq.length > 0 ? helpContent.faq : [
    {
      question: 'Which airports do you serve?',
      answer: 'We provide service to and from all major airports in the New York and Connecticut area, including JFK, LaGuardia (LGA), Newark (EWR), Westchester (HPN), and Bradley (BDL).',
    },
    {
      question: 'How far in advance should I book my ride?',
      answer: 'We recommend booking at least 24 hours in advance to ensure availability. However, we will always do our best to accommodate last-minute requests.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'You can cancel for a full refund up to 12 hours before your scheduled pickup time. Cancellations within 12 hours of pickup are non-refundable.',
    },
    {
      question: 'What kind of vehicle will I be riding in?',
      answer: 'You will be riding in a modern, clean, and comfortable black SUV, typically a Chevrolet Suburban or similar, equipped with complimentary water, Wi-Fi, and phone chargers.',
    },
  ];

  const contactPhone = businessSettings?.company.phone || helpContent.contactInfo.phone || '+1 (203) 555-0123';

  return (
    <PageContainer maxWidth="xl" padding="lg">
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
        </div>
      ) : (
        <PageHeader 
          title={helpContent.title || "Help & FAQs"} 
          subtitle={helpContent.subtitle || "Find answers to common questions about our service"}
        />
      )}

      <PageContent>
        <Card>
          <CardContent className="p-8">
            {editMode ? (
              <div className="mb-8 bg-white p-6 rounded shadow flex flex-col gap-4">
                <label className="edit-label font-semibold">FAQ Section Title</label>
                <input
                  className="editable-input text-2xl font-bold w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
                  value={localContent?.faqTitle || 'Frequently Asked Questions'}
                  onChange={e => handleFieldChange('faqTitle', e.target.value)}
                />
                <div className="space-y-4">
                  {(localContent?.faq || faqItems).map((faq: any, index: number) => (
                    <div key={index} className="border rounded p-4">
                      <label className="edit-label">FAQ {index + 1} Question</label>
                      <input
                        className="editable-input font-semibold w-full mb-2"
                        value={faq.question}
                        onChange={e => handleFAQChange(index, 'question', e.target.value)}
                      />
                      <label className="edit-label">FAQ {index + 1} Answer</label>
                      <textarea
                        className="editable-textarea w-full mb-2"
                        value={faq.answer}
                        onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {helpContent.faqTitle || 'Frequently Asked Questions'}
                </h2>
                <div className="space-y-6">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-base text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-10 pt-8 border-t border-gray-200">
              {editMode ? (
                <div className="bg-white p-6 rounded shadow flex flex-col gap-4">
                  <label className="edit-label font-semibold">Contact Section Title</label>
                  <input
                    className="editable-input text-2xl font-bold w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
                    value={localContent?.contactSection?.title || 'Contact Us'}
                    onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, title: e.target.value })}
                  />
                  <label className="edit-label font-semibold">Contact Description</label>
                  <textarea
                    className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
                    value={localContent?.contactSection?.description || ''}
                    onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, description: e.target.value })}
                    rows={3}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="edit-label">Call Button Text</label>
                      <input
                        className="editable-input w-full mb-2"
                        value={localContent?.contactSection?.callButtonText || 'Click to Call'}
                        onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, callButtonText: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="edit-label">Text Button Text</label>
                      <input
                        className="editable-input w-full mb-2"
                        value={localContent?.contactSection?.textButtonText || 'Click to Text'}
                        onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, textButtonText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {helpContent.contactSection?.title || 'Contact Us'}
                  </h2>
                  <p className="text-base text-gray-600 mb-6">
                    {helpContent.contactSection?.description || "If you can't find the answer you're looking for, please don't hesitate to reach out."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={`tel:${contactPhone}`}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center font-medium"
                    >
                      {helpContent.contactSection?.callButtonText || 'Click to Call'}
                    </a>
                    <a 
                      href={`sms:${contactPhone}`}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center font-medium"
                    >
                      {helpContent.contactSection?.textButtonText || 'Click to Text'}
                    </a>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default HelpPage;
