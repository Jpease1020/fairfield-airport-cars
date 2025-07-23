'use client';

import type { NextPage } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { useHelpPageContent, useBusinessSettings, useCMS } from '@/hooks/useCMS';
import { LoadingSpinner } from '@/components/data';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cmsService } from '@/lib/cms-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Layout, Container, Stack, Section, Grid } from '@/components/ui/containers';

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
      const user = auth.currentUser;
      const result = await cmsService.updateCMSConfiguration({
        pages: {
          ...cmsConfig?.pages,
          help: localContent,
          home: cmsConfig?.pages.home || {
            hero: { title: '', subtitle: '', ctaText: '' },
            features: { title: '', items: [] },
            about: { title: '', content: '' },
            contact: { title: '', content: '', phone: '', email: '' },
          },
        },
      }, user?.uid, user?.email || undefined);
      
      if (result.success) {
        setSaveMsg('Saved!');
        setTimeout(() => setSaveMsg(null), 2000);
        setEditMode(false);
      } else {
        setSaveMsg(`Failed to save: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Save error:', error);
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
      <div className="min-h-screen bg-bg-primary">
        <Layout spacing="none" container maxWidth="xl">
          <Container padding="lg" margin="none">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner text="Loading..." />
            </div>
          </Container>
        </Layout>
      </div>
    );
  }

  if (helpError || !helpContent) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Layout spacing="none" container maxWidth="xl">
          <Container padding="lg" margin="none">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary mb-4">Content Unavailable</h1>
                <p className="text-text-secondary">Please check back later or contact support.</p>
              </div>
            </div>
          </Container>
        </Layout>
      </div>
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
                    saveMsg.includes('Failed') ? 'bg-error text-text-inverse' : 'bg-success text-text-inverse'
                  }`}>
                    {saveMsg}
                  </div>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Page Header */}
        <Section variant="default" padding="lg" margin="none">
          <Container maxWidth="xl" padding="none">
            {editMode ? (
              <Stack spacing="md">
                <div>
                  <label className="edit-label font-semibold">Page Title</label>
                  <Input
                    className="editable-input text-3xl font-bold w-full mb-2 h-14 px-4"
                    value={localContent?.title || ''}
                    onChange={e => handleFieldChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="edit-label font-semibold">Page Subtitle</label>
                  <Input
                    className="editable-input text-xl w-full mb-2 h-12 px-4"
                    value={localContent?.subtitle || ''}
                    onChange={e => handleFieldChange('subtitle', e.target.value)}
                  />
                </div>
              </Stack>
            ) : (
              <Stack spacing="md" align="center">
                <h1 className="text-3xl font-bold text-text-primary">
                  {helpContent.title || "Help & FAQs"}
                </h1>
                <p className="text-xl text-text-secondary">
                  {helpContent.subtitle || "Find answers to common questions about our service"}
                </p>
              </Stack>
            )}
          </Container>
        </Section>

        {/* FAQ Section */}
        <Section variant="alternate" padding="lg" margin="none">
          <Container maxWidth="xl" padding="none">
            <Card>
              <CardContent className="p-6">
                <Stack spacing="lg">
                  {editMode ? (
                    <Stack spacing="md">
                      <div>
                        <label className="edit-label font-semibold">FAQ Section Title</label>
                        <Input
                          className="editable-input text-2xl font-bold w-full mb-2 h-12 px-4"
                          value={localContent?.faqTitle || 'Frequently Asked Questions'}
                          onChange={e => handleFieldChange('faqTitle', e.target.value)}
                        />
                      </div>
                      <Stack spacing="md">
                        {(localContent?.faq || faqItems).map((faq: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <Stack spacing="md">
                                <div>
                                  <label className="edit-label">FAQ {index + 1} Question</label>
                                  <Input
                                    className="editable-input font-semibold w-full mb-2"
                                    value={faq.question}
                                    onChange={e => handleFAQChange(index, 'question', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="edit-label">FAQ {index + 1} Answer</label>
                                  <Textarea
                                    className="editable-textarea w-full mb-2"
                                    value={faq.answer}
                                    onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing="lg">
                      <h2 className="text-2xl font-bold text-text-primary">
                        {helpContent.faqTitle || 'Frequently Asked Questions'}
                      </h2>
                      <Stack spacing="lg">
                        {faqItems.map((faq, index) => (
                          <div key={index} className="border-b border-border-primary pb-6 last:border-b-0">
                            <h3 className="text-lg font-medium text-text-primary mb-2">{faq.question}</h3>
                            <p className="text-base text-text-secondary">{faq.answer}</p>
                          </div>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Section>

        {/* Contact Section */}
        <Section variant="default" padding="lg" margin="none">
          <Container maxWidth="xl" padding="none">
            <Card>
              <CardContent className="p-6">
                <Stack spacing="lg">
                  {editMode ? (
                    <Stack spacing="md">
                      <div>
                        <label className="edit-label font-semibold">Contact Section Title</label>
                        <Input
                          className="editable-input text-2xl font-bold w-full mb-2 h-12 px-4"
                          value={localContent?.contactSection?.title || 'Contact Us'}
                          onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="edit-label font-semibold">Contact Description</label>
                        <Textarea
                          className="editable-textarea w-full mb-2 p-4"
                          value={localContent?.contactSection?.description || ''}
                          onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <Grid cols={2} gap="md" margin="none">
                        <div>
                          <label className="edit-label">Call Button Text</label>
                          <Input
                            className="editable-input w-full mb-2"
                            value={localContent?.contactSection?.callButtonText || 'Click to Call'}
                            onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, callButtonText: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="edit-label">Text Button Text</label>
                          <Input
                            className="editable-input w-full mb-2"
                            value={localContent?.contactSection?.textButtonText || 'Click to Text'}
                            onChange={e => handleFieldChange('contactSection', { ...localContent?.contactSection, textButtonText: e.target.value })}
                          />
                        </div>
                      </Grid>
                    </Stack>
                  ) : (
                    <Stack spacing="lg">
                      <h2 className="text-2xl font-bold text-text-primary">
                        {helpContent.contactSection?.title || 'Contact Us'}
                      </h2>
                      <p className="text-base text-text-secondary">
                        {helpContent.contactSection?.description || "If you can't find the answer you're looking for, please don't hesitate to reach out."}
                      </p>
                      <Grid cols={2} gap="md" margin="none">
                        <a 
                          href={`tel:${contactPhone}`}
                          className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover text-center font-medium"
                        >
                          {helpContent.contactSection?.callButtonText || 'Click to Call'}
                        </a>
                        <a 
                          href={`sms:${contactPhone}`}
                          className="flex-1 px-4 py-3 border border-border-primary text-text-primary rounded-md hover:bg-bg-secondary text-center font-medium"
                        >
                          {helpContent.contactSection?.textButtonText || 'Click to Text'}
                        </a>
                      </Grid>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </Layout>
    </div>
  );
};

export default HelpPage;
