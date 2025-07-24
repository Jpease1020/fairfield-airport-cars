import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'fs';
import path from 'path';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

// Mock CMS hooks
jest.mock('@/hooks/useCMS', () => ({
  useHomePageContent: jest.fn(),
  useBusinessSettings: jest.fn(),
  useCMS: jest.fn(),
}));

// Mock admin components
jest.mock('@/components/admin/EditModeProvider', () => ({
  useEditMode: () => ({
    editMode: false,
    localContent: null,
    setLocalContent: jest.fn(),
    handleFieldChange: jest.fn(),
    EditModeToggle: () => <div data-testid="edit-mode-toggle">Edit Mode Toggle</div>,
    EditModeControls: () => <div data-testid="edit-mode-controls">Edit Mode Controls</div>,
  }),
}));

// Mock components
jest.mock('@/components/layout', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-header">{children}</div>
  ),
  PageContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-content">{children}</div>
  ),
}));

jest.mock('@/components/marketing', () => ({
  FeatureCard: ({ title }: { title: string }) => <div data-testid="feature-card">{title}</div>,
  FAQ: () => <div data-testid="faq-section">FAQ Section</div>,
  ContactSection: () => <div data-testid="contact-section">Contact Section</div>,
}));

jest.mock('@/components/data', () => ({
  LoadingSpinner: ({ text }: { text: string }) => <div data-testid="loading-spinner">{text}</div>,
}));

describe('Page Rendering Integration Tests', () => {
  const mockUseHomePageContent = require('@/hooks/useCMS').useHomePageContent;
  const mockUseBusinessSettings = require('@/hooks/useCMS').useBusinessSettings;
  const mockUseCMS = require('@/hooks/useCMS').useCMS;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseBusinessSettings.mockReturnValue({
      settings: {
        company: {
          phone: '+1 (203) 555-0123',
          email: 'info@fairfieldairportcars.com',
        },
      },
      loading: false,
    });

    mockUseCMS.mockReturnValue({
      config: {},
    });
  });

  describe('Home Page (/page.tsx)', () => {
    it('should render loading state correctly', async () => {
      mockUseHomePageContent.mockReturnValue({
        content: null,
        loading: true,
        error: null,
      });

      const HomePage = require('@/app/page').default;
      render(<HomePage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state when CMS content fails to load', async () => {
      mockUseHomePageContent.mockReturnValue({
        content: null,
        loading: false,
        error: new Error('CMS Error'),
      });

      const HomePage = require('@/app/page').default;
      render(<HomePage />);

      expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Please check back later or contact support.')).toBeInTheDocument();
    });

    it('should render successfully with valid CMS content', async () => {
      const mockContent = {
        hero: {
          title: 'Premium Airport Transportation',
          subtitle: 'Reliable, comfortable rides',
          ctaText: 'Book Your Ride',
        },
        features: {
          items: [
            {
              title: 'Reliable Service',
              description: 'Always on time',
              icon: 'clock',
            },
            {
              title: 'Comfortable Vehicles',
              description: 'Clean and spacious',
              icon: 'car',
            },
          ],
        },
        finalCta: {
          title: 'Ready to Book?',
          subtitle: 'Get started today',
        },
        contact: {
          title: 'Contact Us',
          content: 'Get in touch with us',
        },
      };

      mockUseHomePageContent.mockReturnValue({
        content: mockContent,
        loading: false,
        error: null,
      });

      const HomePage = require('@/app/page').default;
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Premium Airport Transportation')).toBeInTheDocument();
      });

      expect(screen.getByText('Reliable Service')).toBeInTheDocument();
      expect(screen.getByText('Comfortable Vehicles')).toBeInTheDocument();
    });

    it('should handle missing features.items gracefully', async () => {
      const mockContent = {
        hero: {
          title: 'Premium Airport Transportation',
          subtitle: 'Reliable, comfortable rides',
          ctaText: 'Book Your Ride',
        },
        features: {
          // Missing items array - this should not crash
        },
        finalCta: {
          title: 'Ready to Book?',
          subtitle: 'Get started today',
        },
        contact: {
          title: 'Contact Us',
          content: 'Get in touch with us',
        },
      };

      mockUseHomePageContent.mockReturnValue({
        content: mockContent,
        loading: false,
        error: null,
      });

      const HomePage = require('@/app/page').default;
      
      // This should not throw an error
      expect(() => render(<HomePage />)).not.toThrow();
    });

    it('should handle undefined homeContent gracefully', async () => {
      mockUseHomePageContent.mockReturnValue({
        content: undefined,
        loading: false,
        error: null,
      });

      const HomePage = require('@/app/page').default;
      
      // This should render the error state, not crash
      render(<HomePage />);
      
      expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
    });
  });

  describe('About Page (/about/page.tsx)', () => {
    it('should have proper file structure', () => {
      const aboutPagePath = path.join(process.cwd(), 'src/app/about/page.tsx');
      const aboutPageContent = readFileSync(aboutPagePath, 'utf8');
      
      // Check that the file contains expected content
      expect(aboutPageContent).toContain('AboutPage');
      expect(aboutPageContent).toContain('Our Story');
      expect(aboutPageContent).toContain('Our Commitment');
      expect(aboutPageContent).toContain('Why Choose Us');
      expect(aboutPageContent).toContain('Our Fleet');
      expect(aboutPageContent).toContain('Service Areas');
    });

    it('should use proper React components instead of HTML strings', () => {
      const aboutPagePath = path.join(process.cwd(), 'src/app/about/page.tsx');
      const aboutPageContent = readFileSync(aboutPagePath, 'utf8');
      
      // Check that it uses proper JSX instead of dangerouslySetInnerHTML
      expect(aboutPageContent).toContain('<section>');
      expect(aboutPageContent).toContain('<h2 className=');
      expect(aboutPageContent).not.toContain('dangerouslySetInnerHTML');
      expect(aboutPageContent).not.toContain('EditableContent');
    });

    it('should have proper Tailwind classes', () => {
      const aboutPagePath = path.join(process.cwd(), 'src/app/about/page.tsx');
      const aboutPageContent = readFileSync(aboutPagePath, 'utf8');
      
      // Check for proper styling classes
      expect(aboutPageContent).toContain('text-2xl font-semibold');
      expect(aboutPageContent).toContain('text-lg text-gray-700');
      expect(aboutPageContent).toContain('list-disc list-inside');
    });
  });

  describe('Book Page (/book/page.tsx)', () => {
    it('should have proper file structure', () => {
      const bookPagePath = path.join(process.cwd(), 'src/app/book/page.tsx');
      const bookPageContent = readFileSync(bookPagePath, 'utf8');
      
      // Check that the file contains expected content
      expect(bookPageContent).toContain('BookPage');
      expect(bookPageContent).toContain('Book Your Airport Transfer');
    });

    it('should import booking form component', () => {
      const bookPagePath = path.join(process.cwd(), 'src/app/book/page.tsx');
      const bookPageContent = readFileSync(bookPagePath, 'utf8');
      
      // Check for proper imports
      expect(bookPageContent).toContain('BookingForm');
    });
  });
}); 