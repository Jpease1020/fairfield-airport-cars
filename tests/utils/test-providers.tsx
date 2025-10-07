/**
 * Test Provider Utilities
 * 
 * Provides consistent provider wrapping for tests to match production behavior.
 * This ensures tests run in the same environment as the actual app.
 */

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BookingProvider } from '@/providers/BookingProvider';
import { CMSDataProvider } from '@/design/providers/CMSDataProvider';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';
import { GoogleMapsClientProvider } from '@/providers/GoogleMapsClientProvider';

// Mock CMS data for tests
const mockCmsData = {
  'customer-book': {
    'hero-title': 'Complete Your Booking',
    'hero-subtitle': 'Fill in your details below',
    'fare-display-title': 'Your Fare',
    'fare-display-subtitle': 'Estimated cost for your trip'
  },
  'home': {
    'hero-title': 'Premium Airport Transportation',
    'hero-subtitle': 'Reliable rides to and from Fairfield Airport'
  },
  'tracking': {
    'tracking-bookingNotFound': 'Booking not found',
    'tracking-driverEnRoute': 'Driver is on the way'
  }
};

// All providers wrapper - matches production layout.tsx
interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <CMSDataProvider initialCmsData={mockCmsData}>
      <BookingProvider>
        <AdminProvider>
          <InteractionModeProvider>
            <GoogleMapsClientProvider>
              {children}
            </GoogleMapsClientProvider>
          </InteractionModeProvider>
        </AdminProvider>
      </BookingProvider>
    </CMSDataProvider>
  );
}

// Custom render function that includes all providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Individual provider wrappers for specific test needs
export function BookingProviderWrapper({ children }: { children: ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>;
}

export function CMSProviderWrapper({ children }: { children: ReactNode }) {
  return <CMSDataProvider initialCmsData={mockCmsData}>{children}</CMSDataProvider>;
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

