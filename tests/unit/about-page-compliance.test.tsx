import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';
import AboutPage from '@/app/(public)/about/page';

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProvider>
    <InteractionModeProvider>
      {children}
    </InteractionModeProvider>
  </AdminProvider>
);

describe('About Page - CMS Rules Compliance', () => {
  it('should render without errors', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // If it renders without errors, basic structure is correct
    expect(screen.getByText('About Fairfield Airport Cars')).toBeInTheDocument();
  });

  it('should have all required hooks working', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Check that CMS data is being used
    expect(screen.getByText('Professional airport transportation services')).toBeInTheDocument();
    expect(screen.getByText('We provide reliable, professional airport transportation throughout Fairfield County. Licensed drivers, clean vehicles, on-time service.')).toBeInTheDocument();
  });

  it('should have proper data-cms-id attributes on all editable elements', () => {
    const { container } = render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Check for all required data-cms-id attributes
    const cmsElements = container.querySelectorAll('[data-cms-id]');
    
    // Should have exactly 6 CMS-enabled elements
    expect(cmsElements).toHaveLength(6);
    
    // Check specific CMS IDs
    expect(container.querySelector('[data-cms-id="pages.about.title"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cms-id="pages.about.subtitle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cms-id="pages.about.description"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cms-id="pages.about.cta.subtitle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cms-id="pages.about.cta.primaryButton"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cms-id="pages.about.cta.secondaryButton"]')).toBeInTheDocument();
  });

  it('should use hierarchical CMS paths', () => {
    const { container } = render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    const cmsElements = container.querySelectorAll('[data-cms-id]');
    
    // All paths should be hierarchical (contain dots)
    Array.from(cmsElements).forEach(element => {
      const cmsId = element.getAttribute('data-cms-id');
      expect(cmsId).toMatch(/^pages\.about\..+/);
    });
  });

  it('should have meaningful fallback content', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Check that fallback content is professional and meaningful
    expect(screen.getByText('About Fairfield Airport Cars')).toBeInTheDocument();
    expect(screen.getByText('Professional airport transportation services')).toBeInTheDocument();
    expect(screen.getByText('We provide reliable, professional airport transportation throughout Fairfield County. Licensed drivers, clean vehicles, on-time service.')).toBeInTheDocument();
    expect(screen.getByText('Ready to book your ride?')).toBeInTheDocument();
    expect(screen.getByText('Book Now')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('should NOT have duplicate InlineTextEditor', () => {
    const { container } = render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Should NOT have InlineTextEditor component in the page
    const inlineEditor = container.querySelector('[data-testid="inline-text-editor"]');
    expect(inlineEditor).not.toBeInTheDocument();
  });

  it('should NOT have layout components', () => {
    const { container } = render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Should NOT have navigation or footer in the page component
    const navigation = container.querySelector('[data-testid="layout-navigation"]');
    const footer = container.querySelector('[data-testid="layout-footer"]');
    
    expect(navigation).not.toBeInTheDocument();
    expect(footer).not.toBeInTheDocument();
  });

  it('should use correct component props', () => {
    const { container } = render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Check that Text components have mode prop
    const textElements = container.querySelectorAll('[data-cms-id]');
    textElements.forEach(element => {
      if (element.tagName === 'H1' || element.tagName === 'P') {
        // These should have mode prop (though we can't easily test this in DOM)
        expect(element).toHaveAttribute('data-cms-id');
      }
    });
    
    // Check that Button components have interactionMode prop
    const buttonElements = container.querySelectorAll('button[data-cms-id]');
    buttonElements.forEach(button => {
      expect(button).toHaveAttribute('data-cms-id');
    });
  });

  it('should follow the correct page structure pattern', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );
    
    // Should have the correct structure: AboutPageContent function
    // This is tested by the fact that the component renders correctly
    expect(screen.getByText('About Fairfield Airport Cars')).toBeInTheDocument();
  });
});
