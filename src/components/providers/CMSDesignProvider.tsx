'use client';

import { useEffect, ReactNode } from 'react';
import { generateCSSVariables } from '@/lib/design-system/cms';

interface CMSDesignProviderProps {
  children: ReactNode;
}

export function CMSDesignProvider({ children }: CMSDesignProviderProps) {
  useEffect(() => {
    // Apply CMS design system CSS variables on mount
    const applyCMSDesign = () => {
      try {
        // Try to get CMS config (simplified approach)
        let cmsConfig = {
          pages: {
            home: {
              hero: { title: '', subtitle: '', ctaText: '' },
              features: { title: '', items: [] },
              about: { title: '', content: '' },
              contact: { title: '', content: '', phone: '', email: '' }
            },
            help: {
              faq: [],
              contactInfo: { phone: '', email: '', hours: '' },
              sections: []
            }
          },
          business: {
            company: { name: '', tagline: '', phone: '', email: '', address: '', hours: '', website: '' },
            social: {},
            branding: { primaryColor: '', secondaryColor: '' }
          },
          pricing: {
            baseFare: 0,
            perMile: 0,
            perMinute: 0,
            depositPercent: 0,
            bufferMinutes: 0,
            cancellation: { over24hRefundPercent: 0, between3And24hRefundPercent: 0, under3hRefundPercent: 0 },
            zones: []
          },
          payment: {
            square: { applicationId: '', locationId: '', webhookUrl: '' }
          },
          communication: {
            email: {
              bookingConfirmation: { subject: '', body: '', includeCalendarInvite: false },
              bookingReminder: { subject: '', body: '', sendHoursBefore: 0 },
              cancellation: { subject: '', body: '' },
              feedback: { subject: '', body: '', sendDaysAfter: 0 }
            },
            sms: {
              bookingConfirmation: '',
              bookingReminder: '',
              driverEnRoute: '',
              driverArrived: ''
            }
          },
          driver: {
            requirements: { minimumAge: 0, licenseRequired: false, backgroundCheckRequired: false, vehicleRequirements: [] },
            compensation: { baseRate: 0, perMileRate: 0, bonusStructure: '' },
            scheduling: { advanceBookingHours: 0, maxBookingsPerDay: 0, breakRequirements: '' }
          },
          analytics: {
            googleAnalytics: { trackingId: '', enabled: false },
            reporting: { dailyReports: false, weeklyReports: false, monthlyReports: false, emailRecipients: [] }
          },
          bookingForm: {
            fullNameLabel: '', emailLabel: '', phoneLabel: '', pickupLocationLabel: '', dropoffLocationLabel: '',
            pickupDateTimeLabel: '', passengersLabel: '', flightNumberLabel: '', notesLabel: '',
            calculateFareButton: '', calculatingFareButton: '', bookNowButton: '', updateBookingButton: '',
            estimatedFareLabel: '', errorLoadLocations: '', loading: '', errorEnterLocations: '',
            errorCalculateFare: '', errorCalculateBeforeBooking: '', errorTimeConflict: '',
            successBookingUpdated: '', successBookingCreated: '', errorUpdateBooking: '', errorCreateBooking: ''
          },
          lastUpdated: new Date(),
          version: '1.0.0',
          themeColors: {}
        };
        
        // Check if we have stored CMS config
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cmsConfig');
          if (stored) {
            try {
              cmsConfig = { ...cmsConfig, ...JSON.parse(stored) };
            } catch {
              console.warn('Invalid stored CMS config, using defaults');
            }
          }
        }
        
        // Generate and apply CSS variables
        if (typeof window !== 'undefined') {
          const cssVars = generateCSSVariables(cmsConfig);
          const rootElement = document.documentElement;
          
          Object.entries(cssVars).forEach(([property, value]) => {
            rootElement.style.setProperty(property, String(value));
          });
          
          console.log('✅ CMS Design System applied successfully');
        }
      } catch (error) {
        console.warn('CMS design system initialization failed, using defaults:', error);
        
        // Fallback: apply defaults
        if (typeof window !== 'undefined') {
          const defaultConfig = {
            pages: {
              home: {
                hero: { title: '', subtitle: '', ctaText: '' },
                features: { title: '', items: [] },
                about: { title: '', content: '' },
                contact: { title: '', content: '', phone: '', email: '' }
              },
              help: {
                faq: [],
                contactInfo: { phone: '', email: '', hours: '' },
                sections: []
              }
            },
            business: {
              company: { name: '', tagline: '', phone: '', email: '', address: '', hours: '', website: '' },
              social: {},
              branding: { primaryColor: '', secondaryColor: '' }
            },
            pricing: {
              baseFare: 0,
              perMile: 0,
              perMinute: 0,
              depositPercent: 0,
              bufferMinutes: 0,
              cancellation: { over24hRefundPercent: 0, between3And24hRefundPercent: 0, under3hRefundPercent: 0 },
              zones: []
            },
            payment: {
              square: { applicationId: '', locationId: '', webhookUrl: '' }
            },
            communication: {
              email: {
                bookingConfirmation: { subject: '', body: '', includeCalendarInvite: false },
                bookingReminder: { subject: '', body: '', sendHoursBefore: 0 },
                cancellation: { subject: '', body: '' },
                feedback: { subject: '', body: '', sendDaysAfter: 0 }
              },
              sms: {
                bookingConfirmation: '',
                bookingReminder: '',
                driverEnRoute: '',
                driverArrived: ''
              }
            },
            driver: {
              requirements: { minimumAge: 0, licenseRequired: false, backgroundCheckRequired: false, vehicleRequirements: [] },
              compensation: { baseRate: 0, perMileRate: 0, bonusStructure: '' },
              scheduling: { advanceBookingHours: 0, maxBookingsPerDay: 0, breakRequirements: '' }
            },
            analytics: {
              googleAnalytics: { trackingId: '', enabled: false },
              reporting: { dailyReports: false, weeklyReports: false, monthlyReports: false, emailRecipients: [] }
            },
            bookingForm: {
              fullNameLabel: '', emailLabel: '', phoneLabel: '', pickupLocationLabel: '', dropoffLocationLabel: '',
              pickupDateTimeLabel: '', passengersLabel: '', flightNumberLabel: '', notesLabel: '',
              calculateFareButton: '', calculatingFareButton: '', bookNowButton: '', updateBookingButton: '',
              estimatedFareLabel: '', errorLoadLocations: '', loading: '', errorEnterLocations: '',
              errorCalculateFare: '', errorCalculateBeforeBooking: '', errorTimeConflict: '',
              successBookingUpdated: '', successBookingCreated: '', errorUpdateBooking: '', errorCreateBooking: ''
            },
            lastUpdated: new Date(),
            version: '1.0.0',
            themeColors: {}
          };
          const defaultVars = generateCSSVariables(defaultConfig);
          const rootElement = document.documentElement;
          Object.entries(defaultVars).forEach(([property, value]) => {
            rootElement.style.setProperty(property, String(value));
          });
        }
      }
    };

    applyCMSDesign();
  }, []);

  return <>{children}</>;
} 