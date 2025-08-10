'use client';

import React, { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';
// Avoid importing from types directory per architecture rule; define minimal local type
type CMSConfiguration = any;

interface CMSContextType {
  cmsData: CMSConfiguration | null;
  loading: boolean;
  error: string | null;
  updateField: (fieldPath: string, value: string) => Promise<void>;
  refresh: () => Promise<void>;
  reloadPage: () => void;
}

const CMSContext = createContext<CMSContextType | null>(null);

interface CMSDesignProviderProps {
  children: ReactNode;
}

// Simple cache per-page to avoid repeated Firebase calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cachedCMSDataByPage: Record<string, { data: CMSConfiguration; ts: number }> = {};

function derivePageIdFromPath(pathname: string): string {
  const clean = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return 'home';
  const [first, ...rest] = clean.split('/');
  if (first === 'booking' && rest.length > 0) return 'booking';
  if (first === 'book') return 'booking';
  if (first === 'payments' && rest[0] === 'pay-balance') return 'payments';
  return first;
}

export function CMSDesignProvider({ children }: CMSDesignProviderProps) {
  const [cmsData, setCmsData] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCMSConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const pageId = derivePageIdFromPath(pathname);

      // Check cache for this page first
      const cacheEntry = cachedCMSDataByPage[pageId];
      if (cacheEntry && (Date.now() - cacheEntry.ts) < CACHE_DURATION) {
        // console.log('Using cached CMS data for page:', pageId);
        setCmsData(cacheEntry.data);
        setLoading(false);
        return;
      }

      // console.log('Loading CMS data from Firebase for page:', pageId);
      
      // Try to load from Firebase (page-scoped to also seed defaults as needed)
      const response = await fetch(`/api/admin/cms/pages?page=${encodeURIComponent(pageId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const cmsConfig = await response.json();
      
      // Cache the result for this page
      cachedCMSDataByPage[pageId] = { data: cmsConfig, ts: Date.now() };
      
      setCmsData(cmsConfig);
      // console.log('CMS data loaded successfully');
    } catch (err) {
       // console.error('Failed to load CMS config:', err);
      setError('Failed to load content');
      
      // Fallback to mock data if Firebase fails
      const mockData = getMockCMSData();
      setCmsData(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback(async (fieldPath: string, value: string) => {
    try {
      // Updating a CMS field; avoid console logs to keep lint clean
      
      // Update in Firebase
      const response = await fetch('/api/admin/cms/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fieldPath, value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update field: ${response.status}`);
      }

      // Clear cache for current page to force fresh load
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const pageId = derivePageIdFromPath(pathname);
      delete cachedCMSDataByPage[pageId];
      
      // console.log('Field updated successfully, reloading page...');
      
      // Reload the page to get fresh data
      window.location.reload();
      
    } catch (err) {
      setError('Failed to update field');
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    // Clear cache for current page and reload
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageId = derivePageIdFromPath(pathname);
    delete cachedCMSDataByPage[pageId];
    await loadCMSConfig();
  }, [loadCMSConfig]);

  const reloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    loadCMSConfig();
  }, [loadCMSConfig]);

  const contextValue: CMSContextType = {
    cmsData,
    loading,
    error,
    updateField,
    refresh,
    reloadPage
  };

  return (
    <CMSContext.Provider value={contextValue}>
      {children}
    </CMSContext.Provider>
  );
}

// Hook to use CMS data
export function useCMSData() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSData must be used within CMSDesignProvider');
  }
  return context;
}

// Helper function to get field value from CMS data
export function getCMSField(cmsData: CMSConfiguration | null, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  // Try direct path first
  const directParts = fieldPath.split('.');
  let value = resolvePath(cmsData as any, directParts);

  // Fallback: if not found and the path is not already under pages.*, try pages.<first>...
  if (value === undefined && directParts[0] !== 'pages') {
    const fallbackParts = ['pages', ...directParts];
    value = resolvePath(cmsData as any, fallbackParts);
  }

  return typeof value === 'string' ? (value as string) : defaultValue;
}

// Mock data fallback
function getMockCMSData(): CMSConfiguration {
  return {
    pages: {
      home: {
        title: 'Fairfield Airport Cars',
        subtitle: 'Premium Airport Transportation',
        description: 'Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area.',
        hero: {
          title: 'Professional Airport Transportation',
          subtitle: 'Reliable rides to and from Fairfield Airport',
          description: 'Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed.',
          primaryButton: 'Book Now',
          secondaryButton: 'Learn More'
        },
        features: {
          title: 'Why Choose Us?',
          subtitle: 'Professional service you can count on',
          items: [
            { title: 'On-Time Service', description: 'Reliable pickup times with flight tracking' },
            { title: 'Clean Vehicles', description: 'Well-maintained, professional fleet' },
            { title: 'Easy Booking', description: 'Secure online booking and payment' }
          ]
        },
        testimonials: {
          title: 'What Our Customers Say',
          subtitle: 'Trusted by travelers and businesses',
          items: [
            { name: 'Sarah Johnson', role: 'Business Traveler', content: 'Fairfield Airport Cars made my business trips stress-free.' },
            { name: 'Mike Chen', role: 'Frequent Flyer', content: 'The best airport transportation service I\'ve used.' },
            { name: 'Lisa Rodriguez', role: 'Travel Consultant', content: 'I recommend Fairfield Airport Cars to all my clients.' }
          ]
        },
        cta: {
          title: 'Ready to Book Your Ride?',
          subtitle: 'Get started with your airport transportation today',
          primaryButton: 'Book Now',
          secondaryButton: 'Learn More'
        }
      },
      'test-edit-mode': {
        title: 'Test Edit Mode Page',
        description: 'This page has editable content. Try clicking the edit button (top-right) to open the editor.',
        customText: 'This text should be editable in the CMS editor.',
        instructions: 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.',
        reloadButton: 'Reload Page'
      },
      about: {
        hero: { title: 'About Fairfield Airport Cars', subtitle: 'Professional airport transportation services' },
        description: 'We provide reliable, professional airport transportation throughout Fairfield County.',
        cta: { subtitle: 'Ready to book your ride?', primaryButton: 'Book Your Ride', secondaryButton: 'Contact Us' }
      },
      help: {
        hero: { title: 'Help & Support', subtitle: 'Quick answers and support' },
        quickAnswers: { title: 'Quick Answers' },
        contact: { title: 'Need More Help?', subtitle: 'Contact our support team', primaryButton: 'Call Support', secondaryButton: 'Email Support', tertiaryButton: 'Book a Ride' }
      },
      privacy: {
        title: '🔒 Privacy Policy',
        effectiveDate: 'Effective Date: January 1, 2024 | Last Updated: January 1, 2024'
      },
      terms: {
        title: '📋 Terms of Service',
        lastUpdated: 'Effective Date: January 1, 2024 | Last updated: January 2024',
        intro: 'Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.',
        serviceDescription: 'We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.'
      }
    },
    business: {
      company: {
        name: 'Fairfield Airport Cars',
        tagline: 'Premium Airport Transportation',
        phone: '+1-203-555-0123',
        email: 'info@fairfieldairportcar.com',
        address: 'Fairfield, CT',
        hours: '24/7 Service',
        website: 'https://fairfieldairportcar.com'
      },
      social: { facebook: '', instagram: '', twitter: '' },
      branding: {
        primaryColor: 'var(--primary-color)',
        secondaryColor: 'var(--secondary-color)',
        logoUrl: '/NewLogoNoBackground.svg'
      }
    },
    pricing: {
      baseFare: 50,
      perMileRate: 2.5,
      airportSurcharge: 10,
      depositPercent: 25
    },
    bookingForm: {
      fullNameLabel: 'Full Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      pickupLocationLabel: 'Pickup Location',
      dropoffLocationLabel: 'Dropoff Location',
      pickupDateTimeLabel: 'Pickup Date and Time',
      passengersLabel: 'Passengers',
      flightNumberLabel: 'Flight Number (Optional)',
      notesLabel: 'Notes (Optional)',
      calculateFareButton: 'Calculate Fare',
      calculatingFareButton: 'Calculating...',
      bookNowButton: 'Book Now',
      updateBookingButton: 'Update Booking',
      estimatedFareLabel: 'Estimated Fare:',
      errorEnterLocations: 'Please enter both pickup and drop-off locations.',
      errorCalculateFare: 'Could not calculate fare. Please check the addresses.',
      errorCalculateBeforeBooking: 'Please calculate the fare before booking.',
      errorTimeConflict: 'Selected time conflicts with another booking. Please choose a different time.',
      errorCreateBooking: 'Failed to create booking.',
      errorUpdateBooking: 'Failed to update booking.',
      successBookingCreated: 'Booking created successfully! Sending confirmation...',
      successBookingUpdated: 'Booking updated successfully!',
      loading: 'Loading...'
    },
    footer: {
      companyName: 'Fairfield Airport Cars',
      tagline: 'Professional airport transportation services',
      phone: '📞 (203) 555-0123',
      email: '✉️ info@fairfieldairportcars.com'
    }
  } as any;
} 