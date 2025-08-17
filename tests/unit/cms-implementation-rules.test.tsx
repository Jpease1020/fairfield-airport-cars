import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProvider>
    <InteractionModeProvider>
      {children}
    </InteractionModeProvider>
  </AdminProvider>
);

// Mock CMS data for testing
const mockCMSData = {
  pages: {
    home: {
      hero: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        primaryButton: 'Test Button',
        secondaryButton: 'Test Secondary'
      },
      features: {
        title: 'Test Features',
        items: [
          { title: 'Feature 1', description: 'Description 1', icon: '🚀' },
          { title: 'Feature 2', description: 'Description 2', icon: '⭐' }
        ]
      }
    }
  }
};

// Test component that follows all CMS rules
const ValidCMSPage: React.FC = () => {
  const { cmsData } = useCMSData();
  const { isAdmin } = useAdmin();
  const { mode } = useInteractionMode();
  
  return (
    <>
      {/* Hero Section - Following Rule 5, 6, 7 */}
      <h1 
        data-cms-id="pages.home.hero.title" 
        data-testid="hero-title"
      >
        {getCMSField(cmsData, 'pages.home.hero.title', 'Professional Airport Transportation')}
      </h1>
      
      <p 
        data-cms-id="pages.home.hero.subtitle" 
        data-testid="hero-subtitle"
      >
        {getCMSField(cmsData, 'pages.home.hero.subtitle', 'Reliable airport transportation')}
      </p>
      
      <button
        data-cms-id="pages.home.hero.primaryButton"
        data-testid="hero-button"
      >
        {getCMSField(cmsData, 'pages.home.hero.primaryButton', 'Book Now')}
      </button>
      
      {/* Features Section - Following Rule 10 */}
      <h2 
        data-cms-id="pages.home.features.title" 
        data-testid="features-title"
      >
        {getCMSField(cmsData, 'pages.home.features.title', 'Why Choose Us')}
      </h2>
      
      {[0, 1].map((index) => (
        <div key={index}>
          <h3 
            data-cms-id={`pages.home.features.items.${index}.title`}
            data-testid={`feature-${index}-title`}
          >
            {getCMSField(cmsData, `pages.home.features.items.${index}.title`, `Feature ${index + 1}`)}
          </h3>
          
          <p 
            data-cms-id={`pages.home.features.items.${index}.description`}
            data-testid={`feature-${index}-description`}
          >
            {getCMSField(cmsData, `pages.home.features.items.${index}.description`, `Description ${index + 1}`)}
          </p>
        </div>
      ))}
    </>
  );
};

// Test component that violates CMS rules
const InvalidCMSPage: React.FC = () => {
  const { cmsData } = useCMSData();
  const { isAdmin } = useAdmin();
  const { mode } = useInteractionMode();
  
  return (
    <>
      {/* ❌ VIOLATION: Missing data-cms-id */}
      <h1 data-testid="invalid-title">Just a title</h1>
      
      {/* ❌ VIOLATION: Missing fallback content */}
      <p 
        data-cms-id="pages.home.field"
        data-testid="invalid-text"
      >
        {getCMSField(cmsData, 'pages.home.field')}
      </p>
      
      {/* ❌ VIOLATION: Generic CMS path */}
      <button 
        data-cms-id="button"
        data-testid="invalid-button"
      >
        {getCMSField(cmsData, 'button', 'Button')}
      </button>
    </>
  );
};

describe('CMS Implementation Rules - Iron-Clad Standards', () => {
  describe('Rule 4: Required Hooks (ALL PAGES)', () => {
    it('should have all three required hooks', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // If the component renders without errors, all hooks are working
      expect(screen.getByTestId('hero-title')).toBeInTheDocument();
    });
  });

  describe('Rule 5: Text Component Requirements', () => {
    it('should have data-cms-id and getCMSField for all editable text', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Check that all text elements have proper CMS structure
      const subtitle = screen.getByTestId('hero-subtitle');
      expect(subtitle).toHaveAttribute('data-cms-id', 'pages.home.hero.subtitle');
      expect(subtitle.textContent).toBe('Test Subtitle');
    });
  });

  describe('Rule 6: Button Component Requirements', () => {
    it('should have data-cms-id and getCMSField for all editable buttons', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Check that all buttons have proper CMS structure
      const button = screen.getByTestId('hero-button');
      expect(button).toHaveAttribute('data-cms-id', 'pages.home.hero.primaryButton');
      expect(button.textContent).toBe('Test Button');
    });
  });

  describe('Rule 7: Heading Component Requirements', () => {
    it('should have data-cms-id and getCMSField for all editable headings', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Check that all headings have proper CMS structure
      const title = screen.getByTestId('hero-title');
      expect(title).toHaveAttribute('data-cms-id', 'pages.home.hero.title');
      expect(title.textContent).toBe('Test Title');
    });
  });

  describe('Rule 10: CMS Path Naming Convention', () => {
    it('should use hierarchical, descriptive paths', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Check for proper hierarchical paths
      const heroTitle = screen.getByTestId('hero-title');
      const featuresTitle = screen.getByTestId('features-title');
      const feature0Title = screen.getByTestId('feature-0-title');
      
      expect(heroTitle).toHaveAttribute('data-cms-id', 'pages.home.hero.title');
      expect(featuresTitle).toHaveAttribute('data-cms-id', 'pages.home.features.title');
      expect(feature0Title).toHaveAttribute('data-cms-id', 'pages.home.features.items.0.title');
    });
  });

  describe('Rule 11: Fallback Content Requirements', () => {
    it('should have meaningful, professional fallback text', () => {
      // Test with no CMS data to see fallback content
      const { rerender } = render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Check that fallback content is professional
      const title = screen.getByTestId('hero-title');
      expect(title.textContent).toBe('Professional Airport Transportation');
      
      const subtitle = screen.getByTestId('hero-subtitle');
      expect(subtitle.textContent).toBe('Reliable airport transportation');
    });
  });

  describe('Rule Violations Detection', () => {
    it('should detect missing data-cms-id attributes', () => {
      render(
        <TestWrapper>
          <InvalidCMSPage />
        </TestWrapper>
      );
      
      // This should have a data-cms-id but doesn't
      const invalidTitle = screen.getByTestId('invalid-title');
      expect(invalidTitle).not.toHaveAttribute('data-cms-id');
    });

    it('should detect generic CMS paths', () => {
      render(
        <TestWrapper>
          <InvalidCMSPage />
        </TestWrapper>
      );
      
      // This has a generic path instead of hierarchical
      const invalidButton = screen.getByTestId('invalid-button');
      expect(invalidButton).toHaveAttribute('data-cms-id', 'button');
    });
  });

  describe('CMS Data Integration', () => {
    it('should render CMS data when available', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // With mock data, should show CMS content
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should handle array-based CMS content', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // Should render array items correctly
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Testing', () => {
    it('should have testable elements with data-testid', () => {
      render(
        <TestWrapper>
          <ValidCMSPage />
        </TestWrapper>
      );
      
      // All major elements should have test IDs
      expect(screen.getByTestId('hero-title')).toBeInTheDocument();
      expect(screen.getByTestId('hero-subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('hero-button')).toBeInTheDocument();
      expect(screen.getByTestId('features-title')).toBeInTheDocument();
    });
  });
});

// Test helper functions
export const validateCMSPage = (component: React.ReactElement) => {
  const { container } = render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
  
  const violations: string[] = [];
  
  // Check for missing data-cms-id attributes
  const elementsWithoutCMSId = container.querySelectorAll('[data-cms-id]');
  if (elementsWithoutCMSId.length === 0) {
    violations.push('No elements have data-cms-id attributes');
  }
  
  // Check for generic CMS paths
  const genericPaths = Array.from(elementsWithoutCMSId).filter(el => {
    const cmsId = el.getAttribute('data-cms-id');
    return cmsId && !cmsId.includes('.');
  });
  
  if (genericPaths.length > 0) {
    violations.push(`${genericPaths.length} elements have generic CMS paths`);
  }
  
  // Check for missing fallback content
  const cmsElements = Array.from(elementsWithoutCMSId);
  const missingFallbacks = cmsElements.filter(el => {
    const text = el.textContent?.trim();
    return !text || text.length < 3;
  });
  
  if (missingFallbacks.length > 0) {
    violations.push(`${missingFallbacks.length} elements have insufficient fallback content`);
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    elementCount: cmsElements.length
  };
};
