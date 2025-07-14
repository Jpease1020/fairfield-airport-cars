'use client';

import Link from 'next/link';
import { Car, Clock, Star, MapPin, Shield, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { FeatureCard, FAQ, ContactSection } from '@/components/marketing';
import { useHomePageContent, useBusinessSettings, useCMS } from '@/hooks/useCMS';
import { LoadingSpinner } from '@/components/data';
import { useEffect, useState } from 'react';
import { cmsService } from '@/lib/cms-service';
// import { useAuth } from '@/hooks/useAuth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import './page-editable.css';

// Icon mapping for CMS features
const iconMap = {
  clock: <Clock className="h-6 w-6" />,
  car: <Car className="h-6 w-6" />,
  smartphone: <Star className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  map: <MapPin className="h-6 w-6" />
};

export default function HomePage() {
  const { content: homeContent, loading: homeLoading, error: homeError } = useHomePageContent();
  const { settings: businessSettings, loading: businessLoading } = useBusinessSettings();
  const { config: cmsConfig } = useCMS();
  // const { user, isAdmin } = useAuth();

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

  const handleFeatureChange = (idx: number, field: string, value: string) => {
    setLocalContent((prev: any) => {
      const updated = { ...prev };
      updated.features.items[idx][field] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await cmsService.updateCMSConfiguration({
        pages: {
          ...cmsConfig?.pages,
          help: cmsConfig?.pages.help || { faq: [], contactInfo: { phone: '', email: '', hours: '' } },
          home: localContent,
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Unavailable</h1>
            <p className="text-gray-600">Please check back later or contact support.</p>
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

  return (
    <PageContainer>
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

      {/* Hero Section */}
      {editMode ? (
        <div className="mb-8 bg-white p-6 rounded shadow">
          <label className="edit-label">Hero Title</label>
          <input
            className="editable-input text-4xl font-bold w-full mb-2"
            value={localContent?.hero.title || ''}
            onChange={e => handleFieldChange('hero', 'title', e.target.value)}
          />
          <label className="edit-label">Hero Subtitle</label>
          <input
            className="editable-input text-xl w-full mb-2"
            value={localContent?.hero.subtitle || ''}
            onChange={e => handleFieldChange('hero', 'subtitle', e.target.value)}
          />
          <label className="edit-label">Hero CTA Text</label>
          <input
            className="editable-input w-full mb-2"
            value={localContent?.hero.ctaText || ''}
            onChange={e => handleFieldChange('hero', 'ctaText', e.target.value)}
          />
        </div>
      ) : (
        <section className="py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white text-center relative overflow-hidden">
          {/* Background pattern for visual interest */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-blue-300">
              {homeContent.hero.subtitle}
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-white leading-tight">
              {homeContent.hero.title}
            </h1>
            <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/book" className="px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {homeContent.hero.ctaText}
              </a>
              <a href="/help" className="px-10 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <div className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            {editMode ? (
              <>
                <label className="edit-label">Features Title</label>
                <input
                  className="editable-input text-3xl md:text-4xl font-bold w-full mb-2"
                  value={localContent?.features.title || ''}
                  onChange={e => handleFieldChange('features', 'title', e.target.value)}
                />
              </>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{homeContent.features.title}</h2>
            )}
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our premium airport car service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {(editMode ? localContent?.features.items : features).map((feature: any, index: number) => (
              <div key={index} className={editMode ? 'bg-white p-4 rounded shadow' : ''}>
                {editMode ? (
                  <>
                    <label className="edit-label">Feature {index + 1} Title</label>
                    <input
                      className="editable-input font-semibold w-full mb-2"
                      value={feature.title}
                      onChange={e => handleFeatureChange(index, 'title', e.target.value)}
                    />
                    <label className="edit-label">Feature {index + 1} Description</label>
                    <input
                      className="editable-input w-full mb-2"
                      value={feature.description}
                      onChange={e => handleFeatureChange(index, 'description', e.target.value)}
                    />
                  </>
                ) : (
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    variant="default"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Fleet</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You will ride in a meticulously maintained Chevrolet Suburban or a similar full-size luxury SUV, offering ample space for passengers and luggage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="Luxury SUV"
              description="Spacious Chevrolet Suburban with premium amenities including complimentary water, Wi-Fi, and phone chargers."
              variant="highlighted"
            />
            <FeatureCard
              title="Professional Service"
              description="Experienced drivers with background checks, ensuring your safety and comfort throughout your journey."
              variant="highlighted"
            />
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our service"
          items={faqItems}
          variant="accordion"
        />
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-white">
        {editMode ? (
          <div className="bg-white p-6 rounded shadow mb-8">
            <label className="edit-label">Contact Title</label>
            <input
              className="editable-input text-2xl font-bold w-full mb-2"
              value={localContent?.contact.title || ''}
              onChange={e => handleFieldChange('contact', 'title', e.target.value)}
            />
            <label className="edit-label">Contact Content</label>
            <textarea
              className="editable-textarea w-full mb-2"
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

      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for a Stress-Free Ride?</h2>
          <p className="text-white mb-8 max-w-2xl mx-auto">
            Book your airport transportation today and experience the difference of premium service.
          </p>
          <Link 
            href="/book"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-blue-600 bg-white border border-transparent rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Book Now
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}