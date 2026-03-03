/**
 * Test Provider Utilities
 * 
 * Provides consistent provider wrapping for tests to match production behavior.
 * This ensures tests run in the same environment as the actual app.
 */

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BookingProvider } from '@/providers/BookingProvider';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { GoogleMapsClientProvider } from '@/providers/GoogleMapsClientProvider';

// All providers wrapper - matches production layout.tsx
interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <BookingProvider>
      <AdminProvider>
        <GoogleMapsClientProvider>
          {children}
        </GoogleMapsClientProvider>
      </AdminProvider>
    </BookingProvider>
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
  return <>{children}</>;
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
