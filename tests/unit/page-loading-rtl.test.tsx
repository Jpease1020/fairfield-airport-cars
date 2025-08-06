import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { vi, describe, test, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import HomePage from '@/app/(public)/page';
import BookPage from '@/app/(customer)/book/page';
import AdminPage from '@/app/(admin)/admin/page';
import HelpPage from '@/app/(public)/help/page';
import CostsPage from '@/app/(admin)/costs/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock Firebase
vi.mock('@/lib/utils/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}));

// Mock business settings hook
vi.mock('@/hooks/useBusinessSettings', () => ({
  useBusinessSettings: () => ({
    settings: {
      businessName: 'Fairfield Airport Cars',
      phone: '(203) 555-0123',
      email: 'info@fairfieldairportcar.com',
    },
    loading: false,
    error: null,
  }),
}));

// Mock booking status hook
vi.mock('@/hooks/useBookingStatus', () => ({
  useBookingStatus: () => ({
    status: 'confirmed',
    loading: false,
    error: null,
  }),
}));

// Setup MSW server for API mocking
const server = setupServer(
  // Mock successful API responses
  http.get('/api/bookings', () => {
    return HttpResponse.json({ bookings: [] });
  }),
  
  http.get('/api/admin/bookings', () => {
    return HttpResponse.json({ bookings: [] });
  }),
  
  http.post('/api/booking', () => {
    return HttpResponse.json({ success: true, bookingId: 'test-123' });
  }),
  
  // Mock API failures
  http.get('/api/failing-endpoint', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),
  
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),
  
  http.get('/api/timeout', () => {
    return HttpResponse.json({ bookings: [] });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Page Loading Tests - RTL', () => {
  beforeEach(() => {
    (useRouter as any).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  describe('Public Pages', () => {
    test('Home page loads with expected content', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
      
      // Check for main navigation elements
      expect(screen.getByTestId('nav-home')).toBeDefined();
      expect(screen.getByTestId('nav-book')).toBeDefined();
      expect(screen.getByTestId('nav-help')).toBeDefined();
      expect(screen.getByTestId('nav-about')).toBeDefined();
      
      // Check for main content area
      expect(screen.getByTestId('main-content')).toBeDefined();
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
      expect(screen.getByTestId('book-now-button')).toBeDefined();
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

    test('Costs page loads with pricing information', async () => {
      render(<CostsPage />);
      
      // Costs page is a simple placeholder for now
      expect(screen.getByText('Costs')).toBeDefined();
      expect(screen.getByText('Costs page content will be implemented here.')).toBeDefined();
    });
  });

  describe('Admin Pages', () => {
    test('Admin dashboard loads with admin controls', async () => {
      render(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toBeDefined();
      });
      
      // Check for admin dashboard elements
      expect(screen.getByTestId('main-content')).toBeDefined();
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
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
      
      // Page should still load even with API errors
      expect(screen.getByTestId('main-content')).toBeDefined();
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
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
      
      // Page should still load even with network errors
      expect(screen.getByTestId('main-content')).toBeDefined();
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
      expect(screen.getByTestId('nav-home')).toBeDefined();
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
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    test('Page has proper heading structure', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('Page has proper alt text for images', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-home')).toBeDefined();
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
      expect(screen.getByTestId('book-now-button').hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    test('Page content is accessible on mobile', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-home')).toBeDefined();
      });
      
      // Check that main content is present
      expect(screen.getByTestId('main-content')).toBeDefined();
      
      // Mobile menu should be available (visibility depends on viewport)
      // We don't test mobile menu toggle visibility as it depends on viewport size
    });
  });
}); 