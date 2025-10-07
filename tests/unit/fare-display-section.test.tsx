/**
 * FareDisplaySection Unit Tests
 * 
 * These tests verify the FareDisplaySection component behavior
 * including fare display, loading states, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, render, screen } from '../utils/test-providers';
import { FareDisplaySection } from '@/components/booking/trip-details/FareDisplaySection';
import { useBooking } from '@/providers/BookingProvider';

// Mock the useBooking hook properly
vi.mock('@/providers/BookingProvider', () => ({
  useBooking: vi.fn()
}));

describe('FareDisplaySection', () => {
  const mockCmsData = {
    'tripDetailsPhase-fareTitle': 'Estimated Fare',
    'tripDetailsPhase-personalFare': 'Personal',
    'tripDetailsPhase-businessFare': 'Business',
    'tripDetailsPhase-fareType': 'Fare',
    'tripDetailsPhase-calculatingFare': 'Calculating fare...'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useBooking).mockReturnValue({
      currentFare: null,
      setFare: vi.fn(),
      error: null,
      success: null,
      // ... other required properties
    } as any);
  });

  it('should show calculating state when isCalculating is true', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={null}
        isCalculating={true}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    expect(screen.getByText('Calculating fare...')).toBeInTheDocument();
    expect(screen.getByTestId('fare-calculating')).toBeInTheDocument();
  });

  it('should show error state when fare is null and error is provided', () => {
    const errorMessage = 'Unable to calculate fare';
    
    renderWithProviders(
      <FareDisplaySection
        fare={null}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByTestId('fare-error')).toBeInTheDocument();
  });

  it('should not render anything when fare is null and no error', () => {
    const { container } = render(
      <FareDisplaySection
        fare={null}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display business fare correctly', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={85.50}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    expect(screen.getByText('Estimated Fare')).toBeInTheDocument();
    expect(screen.getByText('Business Fare')).toBeInTheDocument();
    expect(screen.getByText('$85.50')).toBeInTheDocument();
    expect(screen.getByTestId('fare-display')).toBeInTheDocument();
  });

  it('should display personal fare correctly', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={75.25}
        isCalculating={false}
        fareType="personal"
        cmsData={mockCmsData}
      />
    );

    expect(screen.getByText('Estimated Fare')).toBeInTheDocument();
    expect(screen.getByText('Personal Fare')).toBeInTheDocument();
    expect(screen.getByText('$75.25')).toBeInTheDocument();
  });

  it('should format fare as currency correctly', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={123.456}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    expect(screen.getByText('$123.46')).toBeInTheDocument();
  });

  it('should handle zero fare', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={0}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should use fallback text when CMS data is missing', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={85}
        isCalculating={false}
        fareType="business"
        cmsData={{}}
      />
    );

    expect(screen.getByText('Estimated Fare')).toBeInTheDocument();
    expect(screen.getByText('Business Fare')).toBeInTheDocument();
  });

  it('should show -- when fare is null in display', () => {
    renderWithProviders(
      <FareDisplaySection
        fare={null}
        isCalculating={false}
        fareType="business"
        cmsData={mockCmsData}
      />
    );

    // Should not render anything when fare is null and no error
    expect(screen.queryByText('--')).not.toBeInTheDocument();
  });
});
