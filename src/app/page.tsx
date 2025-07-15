'use client';

import Link from 'next/link';
import { Car, Clock, Star, MapPin, Shield, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { FeatureCard, FAQ, ContactSection } from '@/components/marketing';
import { useHomePageContent, useBusinessSettings, useCMS } from '@/hooks/useCMS';
import { LoadingSpinner } from '@/components/data';
import { useEffect, useState } from 'react';
import { cmsService } from '@/lib/cms-service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import './page-editable.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Icon mapping for CMS features
const iconMap = {
  clock: <Clock className="h-6 w-6 text-white" />,
  car: <Car className="h-6 w-6 text-white" />,
  smartphone: <Star className="h-6 w-6 text-white" />,
  star: <Star className="h-6 w-6 text-white" />,
  shield: <Shield className="h-6 w-6 text-white" />,
  users: <Users className="h-6 w-6 text-white" />,
  map: <MapPin className="h-6 w-6 text-white" />
};

export default function HomePage() {
  const { content: homeContent, loading: homeLoading, error: homeError } = useHomePageContent();
  const { settings: businessSettings, loading: businessLoading } = useBusinessSettings();
  const { config: cmsConfig } = useCMS();

  // Admin detection
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      // You can add more robust admin checks here
      if (user && (user.email === 'justin@fairfieldairportcar.com' || user.email === 'gregg@fairfieldairportcar.com')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Inline editing state
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (homeContent) {
      setLocalContent(homeContent);
    }
  }, [homeContent]);

  const handleFieldChange = (section: string, field: string, value: unknown, subfield?: string) => {
    setLocalContent((prev: any) => {
      const updated = { ...prev };
      if (subfield) {
        updated[section][field][subfield] = value;
      } else if (field) {
        updated[section][field] = value;
      } else {
        updated[section] = value;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const user = auth.currentUser;
      console.log('Saving CMS content:', { localContent, user: user?.uid });
      
      const result = await cmsService.updateCMSConfiguration({
        pages: {
          ...cmsConfig?.pages,
          home: localContent,
          help: cmsConfig?.pages.help || { faq: [], contactInfo: { phone: '', email: '', hours: '' } },
        },
      }, user?.uid, user?.email || undefined);
      
      console.log('Save result:', result);
      
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
    setLocalContent(JSON.parse(JSON.stringify(homeContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  if (homeLoading || businessLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </PageContainer>
    );
  }

  if (homeError || !homeContent) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Content Unavailable</h1>
            <p className="text-text-secondary">Please check back later or contact support.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Convert CMS features to component format
  const features = homeContent.features.items.map((feature) => ({
    title: feature.title,
    description: feature.description,
    icon: iconMap[feature.icon as keyof typeof iconMap] || <Star className="h-6 w-6" />,
  }));

  // Default FAQ items (can be moved to CMS later)
  const faqItems = [
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

  const contactMethods = [
    {
      type: 'phone' as const,
      label: 'Call Us',
      value: businessSettings?.company.phone || '+1 (203) 555-0123',
      href: `tel:${businessSettings?.company.phone || '+1-203-555-0123'}`,
    },
    {
      type: 'text' as const,
      label: 'Text Us',
      value: businessSettings?.company.phone || '+1 (203) 555-0123',
      href: `sms:${businessSettings?.company.phone || '+1-203-555-0123'}`,
    },
    {
      type: 'email' as const,
      label: 'Email Us',
      value: businessSettings?.company.email || 'info@fairfieldairportcars.com',
      href: `mailto:${businessSettings?.company.email || 'info@fairfieldairportcars.com'}`,
    },
  ];

  const heroText = homeContent.hero;
  const featuresText = homeContent.features;
  const ctaText = homeContent.finalCta;

  return (
    <PageContainer>
      {/* Floating Edit Mode Toggle for Admins */}
      {isAdmin && (
        <div className="fixed top-20 right-6 z-50">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg"
            >
              Edit Mode
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-success text-text-inverse rounded shadow hover:bg-success-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-error text-text-inverse rounded shadow hover:bg-error-hover"
              >
                Cancel
              </Button>
              {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      {editMode ? (
        <div className="mb-8 bg-white p-6 rounded shadow flex flex-col gap-4">
          <label className="edit-label font-semibold">Hero Title</label>
          <Input
            className="editable-input text-4xl font-bold w-full mb-2 h-14 px-4"
            value={localContent?.hero.title || ''}
            onChange={e => handleFieldChange('hero', 'title', e.target.value)}
          />
          <label className="edit-label font-semibold">Hero Subtitle</label>
          <Input
            className="editable-input text-xl w-full mb-2 h-12 px-4"
            value={localContent?.hero.subtitle || ''}
            onChange={e => handleFieldChange('hero', 'subtitle', e.target.value)}
          />
          <label className="edit-label font-semibold">Hero CTA Text</label>
          <Input
            className="editable-input w-full mb-2 h-12 px-4"
            value={localContent?.hero.ctaText || ''}
            onChange={e => handleFieldChange('hero', 'ctaText', e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-success text-text-inverse rounded shadow hover:bg-success-hover"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="px-4 py-2 bg-error text-text-inverse rounded shadow hover:bg-error-hover"
            >
              Cancel
            </Button>
            {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary-hover to-brand-primary"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-text-inverse mb-4">
                {heroText?.title || 'Premium Airport Transportation'}
              </h1>
              <p className="text-xl md:text-2xl text-text-inverse/90 mb-6 max-w-3xl mx-auto">
                {heroText?.subtitle || 'Reliable, comfortable rides to and from Fairfield Airport. Book your ride today!'}
              </p>
              <div className="flex justify-center items-center">
                <Link href="/book">
                  <Button size="lg" className="bg-brand-primary text-text-inverse hover:bg-brand-primary-hover px-8 py-3 text-lg font-semibold shadow-lg">
                    {heroText?.ctaText || 'Book Now'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-12 bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              {featuresText?.title || 'Why Choose Us?'}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Professional service, reliable transportation, and peace of mind for your airport journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary text-text-inverse rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            {ctaText?.title || 'Ready to Book Your Ride?'}
          </h2>
          <p className="text-lg text-text-secondary mb-6">
            Get a quote and book your airport transportation in minutes.
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-brand-primary text-text-inverse hover:bg-brand-primary-hover">
              {ctaText?.buttonText || 'Get Started'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Fleet Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            {editMode ? (
              <>
                <label className="edit-label">Fleet Title</label>
                <Input
                  className="editable-input text-3xl font-bold w-full mb-2 h-14 px-4"
                  value={localContent?.fleet?.title || 'Our Fleet'}
                  onChange={e => handleFieldChange('fleet', 'title', e.target.value)}
                />
                <label className="edit-label">Fleet Description</label>
                <Textarea
                  className="editable-textarea w-full mb-2 h-24 px-4"
                  value={localContent?.fleet?.description || ''}
                  onChange={e => handleFieldChange('fleet', 'description', e.target.value)}
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-text-primary mb-4">{homeContent.fleet?.title || 'Our Fleet'}</h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  {homeContent.fleet?.description || 'You will ride in a meticulously maintained Chevrolet Suburban or a similar full-size luxury SUV, offering ample space for passengers and luggage.'}
                </p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {editMode ? (
              <>
                <div className="bg-white p-4 rounded shadow">
                  <label className="edit-label">Vehicle 1 Title</label>
                  <Input
                    className="editable-input font-semibold w-full mb-2 h-14 px-4"
                    value={localContent?.fleet?.vehicles?.[0]?.title || 'Luxury SUV'}
                    onChange={e => handleFieldChange('fleet', 'vehicles', [
                      { ...localContent?.fleet?.vehicles?.[0], title: e.target.value },
                      localContent?.fleet?.vehicles?.[1]
                    ])}
                  />
                  <label className="edit-label">Vehicle 1 Description</label>
                  <Textarea
                    className="editable-textarea w-full mb-2 h-24 px-4"
                    value={localContent?.fleet?.vehicles?.[0]?.description || ''}
                    onChange={e => handleFieldChange('fleet', 'vehicles', [
                      { ...localContent?.fleet?.vehicles?.[0], description: e.target.value },
                      localContent?.fleet?.vehicles?.[1]
                    ])}
                  />
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <label className="edit-label">Vehicle 2 Title</label>
                  <Input
                    className="editable-input font-semibold w-full mb-2 h-14 px-4"
                    value={localContent?.fleet?.vehicles?.[1]?.title || 'Professional Service'}
                    onChange={e => handleFieldChange('fleet', 'vehicles', [
                      localContent?.fleet?.vehicles?.[0],
                      { ...localContent?.fleet?.vehicles?.[1], title: e.target.value }
                    ])}
                  />
                  <label className="edit-label">Vehicle 2 Description</label>
                  <Textarea
                    className="editable-textarea w-full mb-2 h-24 px-4"
                    value={localContent?.fleet?.vehicles?.[1]?.description || ''}
                    onChange={e => handleFieldChange('fleet', 'vehicles', [
                      localContent?.fleet?.vehicles?.[0],
                      { ...localContent?.fleet?.vehicles?.[1], description: e.target.value }
                    ])}
                  />
                </div>
              </>
            ) : (
              <>
                <FeatureCard
                  title={homeContent.fleet?.vehicles?.[0]?.title || "Luxury SUV"}
                  description={homeContent.fleet?.vehicles?.[0]?.description || "Spacious Chevrolet Suburban with premium amenities including complimentary water, Wi-Fi, and phone chargers."}
                  variant="highlighted"
                />
                <FeatureCard
                  title={homeContent.fleet?.vehicles?.[1]?.title || "Professional Service"}
                  description={homeContent.fleet?.vehicles?.[1]?.description || "Experienced drivers with background checks, ensuring your safety and comfort throughout your journey."}
                  variant="highlighted"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-white">
        {editMode ? (
          <div className="bg-white p-6 rounded shadow mb-8">
            <label className="edit-label">FAQ Title</label>
            <Input
              className="editable-input text-3xl font-bold w-full mb-2 h-14 px-4"
              value={localContent?.faq?.title || 'Frequently Asked Questions'}
              onChange={e => handleFieldChange('faq', 'title', e.target.value)}
            />
            <label className="edit-label">FAQ Subtitle</label>
              <Input
                className="editable-input text-lg w-full mb-2 h-12 px-4"
                value={localContent?.faq?.subtitle || 'Everything you need to know about our service'}
                onChange={e => handleFieldChange('faq', 'subtitle', e.target.value)}
              />
            <div className="space-y-4">
              {(localContent?.faq?.items || faqItems).map((faq: any, index: number) => (
                <div key={index} className="border rounded p-4">
                  <label className="edit-label">FAQ {index + 1} Question</label>
                  <Input
                    className="editable-input font-semibold w-full mb-2 h-14 px-4"
                    value={faq.question}
                    onChange={e => {
                      const items = [...(localContent?.faq?.items || faqItems)];
                      items[index] = { ...items[index], question: e.target.value };
                      handleFieldChange('faq', 'items', items);
                    }}
                  />
                  <label className="edit-label">FAQ {index + 1} Answer</label>
                  <Textarea
                    className="editable-textarea w-full mb-2 h-24 px-4"
                    value={faq.answer}
                    onChange={e => {
                      const items = [...(localContent?.faq?.items || faqItems)];
                      items[index] = { ...items[index], answer: e.target.value };
                      handleFieldChange('faq', 'items', items);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <FAQ
            title={homeContent.faq?.title || "Frequently Asked Questions"}
            subtitle={homeContent.faq?.subtitle || "Everything you need to know about our service"}
            items={homeContent.faq?.items || faqItems}
            variant="accordion"
          />
        )}
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-white">
        {editMode ? (
          <div className="bg-white p-6 rounded shadow mb-8">
            <label className="edit-label">Contact Title</label>
            <Input
              className="editable-input text-2xl font-bold w-full mb-2 h-14 px-4"
              value={localContent?.contact.title || ''}
              onChange={e => handleFieldChange('contact', 'title', e.target.value)}
            />
            <label className="edit-label">Contact Content</label>
            <Textarea
              className="editable-textarea w-full mb-2 h-24 px-4"
              value={localContent?.contact.content || ''}
              onChange={e => handleFieldChange('contact', 'content', e.target.value)}
            />
          </div>
        ) : (
          <ContactSection
            title={homeContent.contact.title}
            subtitle="Ready to Book?"
            description={homeContent.contact.content}
            contactMethods={contactMethods}
            variant="centered"
          />
        )}
      </div>

      {/* Final CTA Section */}
      <div className="py-12 bg-brand-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {editMode ? (
            <div className="bg-white p-6 rounded shadow mb-8">
              <label className="edit-label">CTA Title</label>
              <Input
                className="editable-input text-3xl font-bold w-full mb-2 h-14 px-4"
                value={localContent?.finalCta?.title || 'Ready for a Stress-Free Ride?'}
                onChange={e => handleFieldChange('finalCta', 'title', e.target.value)}
              />
              <label className="edit-label">CTA Description</label>
              <Textarea
                className="editable-textarea w-full mb-2 h-24 px-4"
                value={localContent?.finalCta?.description || ''}
                onChange={e => handleFieldChange('finalCta', 'description', e.target.value)}
              />
              <label className="edit-label">CTA Button Text</label>
              <Input
                className="editable-input w-full mb-2 h-12 px-4"
                value={localContent?.finalCta?.buttonText || 'Book Now'}
                onChange={e => handleFieldChange('finalCta', 'buttonText', e.target.value)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-text-inverse mb-4">{homeContent.finalCta?.title || 'Ready for a Stress-Free Ride?'}</h2>
              <p className="text-text-inverse mb-8 max-w-2xl mx-auto">
                {homeContent.finalCta?.description || 'Book your airport transportation today and experience the difference of premium service.'}
              </p>
              <Link 
                href="/book"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-text-inverse bg-transparent border border-text-inverse rounded-md shadow-sm hover:bg-text-inverse hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-inverse"
              >
                {homeContent.finalCta?.buttonText || 'Book Now'}
              </Link>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}