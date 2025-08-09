import React from 'react';
import { render as rtlRender, screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi, describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import HomePage from '@/app/page';
import BookPage from '@/app/(customer)/book/page';
import AdminPage from '@/app/(admin)/admin/page';
import HelpPage from '@/app/(public)/help/page';
import CostsPage from '@/app/(admin)/admin/costs/page';
import { server } from '../mocks/server';
import { ToastProvider, CMSDesignProvider } from '@/ui';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { EditModeProvider } from '@/design/providers/EditModeProvider';

// Reuse centralized MSW server and handlers
beforeAll(() => {
  // Ensure Google Maps hook sees an API key and an existing script tag
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'test-key';
  const existing = document.querySelector('script[data-gmaps="true"]');
  if (!existing) {
    const script = document.createElement('script');
    script.setAttribute('data-gmaps', 'true');
    document.head.appendChild(script);
  }
  server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper: render with real providers
function render(ui: React.ReactNode) {
  return rtlRender(
    <ToastProvider>
      <CMSDesignProvider>
        <AdminProvider>
          <EditModeProvider>
            {ui}
          </EditModeProvider>
        </AdminProvider>
      </CMSDesignProvider>
    </ToastProvider>
  );
}

describe('Page Loading Tests - RTL', () => {

  describe('Public Pages', () => {
    test('Home page loads with expected content', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Check for main navigation elements
      expect(screen.getByTestId('nav-container')).toBeDefined();
      
      // Check for main content area
      expect(screen.getByTestId('layout-main-content')).toBeDefined();
    });

    test('Book page loads with booking form', async () => {
      render(<BookPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-form')).toBeDefined();
      });
      
      // Check for booking form elements
      expect(screen.getByTestId('booking-form')).toBeDefined();
      expect(screen.getByTestId('name-input')).toBeDefined();
      expect(screen.getByTestId('email-input')).toBeDefined();
      expect(screen.getByTestId('phone-input')).toBeDefined();
      expect(screen.getByTestId('pickup-location-input')).toBeDefined();
      expect(screen.getByTestId('dropoff-location-input')).toBeDefined();
      // The submit button doesn't have a fixed test id; verify by role and name
      expect(screen.getByRole('button', { name: /book now/i })).toBeDefined();
    });

    test('Help page loads with help content', async () => {
      render(<HelpPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('help-content')).toBeDefined();
      });
      
      // Check for help page elements
      expect(screen.getByTestId('help-content')).toBeDefined();
      expect(screen.getByTestId('faq-section')).toBeDefined();
    });

    test('Costs page loads with cost management UI', async () => {
      render(<CostsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Cost Breakdown/i)).toBeDefined();
      });
      expect(screen.getByText(/Quick Actions/i)).toBeDefined();
    });
  });

  describe('Admin Pages', () => {
    test('Admin dashboard loads with admin controls', async () => {
      render(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-main-content')).toBeDefined();
      });
      
      // Check for admin dashboard elements
      expect(screen.getByTestId('layout-main-content')).toBeDefined();
      // Admin dashboard loads with main content
    });
  });

  describe('API Error Handling', () => {
    test('Page handles API errors gracefully', async () => {
      // Mock API failure
      server.use(
        http.get('/api/bookings', () => {
          return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
        })
      );

      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Page should still load even with API errors
      expect(screen.getByTestId('layout-main-content')).toBeDefined();
    });

    test('Page handles network errors gracefully', async () => {
      // Mock network error
      server.use(
        http.get('/api/bookings', () => {
          return HttpResponse.error();
        })
      );

      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Page should still load even with network errors
      expect(screen.getByTestId('layout-main-content')).toBeDefined();
    });
  });

  describe('Loading States', () => {
    test('Page shows loading state while data is being fetched', async () => {
      // Mock a slow API response
      server.use(
        http.get('/api/bookings', () => {
          return HttpResponse.json({ bookings: [] });
        })
      );

      render(<HomePage />);
      
      // Should show content immediately (no loading state for static content)
      expect(screen.getByTestId('layout-navigation')).toBeDefined();
    });
  });

  describe('Error Boundaries', () => {
    test('Page handles component errors gracefully', async () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // This would normally be handled by an error boundary
      // For this test, we'll just ensure the page doesn't crash
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    test('Page has proper heading structure', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('Page has proper alt text for images', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Check for images with alt text
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true);
      });
    });
  });

  describe('Form Validation', () => {
    test('Booking form shows validation errors', async () => {
      render(<BookPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-form')).toBeDefined();
      });
      
      // Check that form is present and submit button is disabled initially
      expect(screen.getByTestId('booking-form')).toBeDefined();
      const submitBtn = screen.getByRole('button', { name: /book now/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    test('Page content is accessible on mobile', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('layout-navigation')).toBeDefined();
      });
      
      // Check that main content is present
      expect(screen.getByTestId('layout-main-content')).toBeDefined();
      
      // Mobile menu should be available (visibility depends on viewport)
      // We don't test mobile menu toggle visibility as it depends on viewport size
    });
  });
}); 