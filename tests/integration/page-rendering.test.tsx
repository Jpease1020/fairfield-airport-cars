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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Home Page (/page.tsx)', () => {
    it('should render home page content correctly', async () => {
      const HomePage = require('@/app/page').default;
      
      render(<HomePage />);
      
      // Should render the actual content, not use CMS
      expect(screen.getAllByText('Premium Airport Transportation')).toHaveLength(2); // One in header, one in hero
      expect(screen.getByText('Book Your Ride')).toBeInTheDocument();
      expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
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
      expect(aboutPageContent).toContain('Our Fleet');
      expect(aboutPageContent).toContain('Service Areas');
      expect(aboutPageContent).toContain('Get in Touch');
    });

    it('should use proper React components instead of HTML strings', () => {
      const aboutPagePath = path.join(process.cwd(), 'src/app/about/page.tsx');
      const aboutPageContent = readFileSync(aboutPagePath, 'utf8');
      
      // Check that it uses proper JSX instead of dangerouslySetInnerHTML
      expect(aboutPageContent).toContain('className="about-section"');
      expect(aboutPageContent).toContain('<h2>');
      expect(aboutPageContent).not.toContain('dangerouslySetInnerHTML');
      expect(aboutPageContent).not.toContain('EditableContent');
    });

    it('should have proper Tailwind classes', () => {
      const aboutPagePath = path.join(process.cwd(), 'src/app/about/page.tsx');
      const aboutPageContent = readFileSync(aboutPagePath, 'utf8');
      
      // Check for proper structure
      expect(aboutPageContent).toContain('about-content');
      expect(aboutPageContent).toContain('about-section');
      expect(aboutPageContent).toContain('grid grid-2');
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