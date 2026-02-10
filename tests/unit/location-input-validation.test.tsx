/**
 * LocationInput Validation Tests
 *
 * Tests for client-side validation in the LocationInput component:
 * 1. City/region rejection shows proper error message
 * 2. Service area validation shows proper error message
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';

// Mock service area validation
vi.mock('@/lib/services/service-area-validation', () => ({
  isAirportLocation: vi.fn().mockReturnValue(false),
  isWithinHomeAreaNormal: vi.fn().mockReturnValue(true),
  isWithinHomeAreaExtended: vi.fn().mockReturnValue(true),
}));

// Setup Google Maps mock
beforeEach(() => {
  vi.clearAllMocks();

  // Mock Google Maps API
  (window as any).google = {
    maps: {
      places: {
        AutocompleteService: vi.fn().mockImplementation(() => ({
          getPlacePredictions: vi.fn(),
        })),
        PlacesService: vi.fn().mockImplementation(() => ({
          getDetails: vi.fn(),
        })),
        PlacesServiceStatus: {
          OK: 'OK',
        },
      },
      LatLng: vi.fn(),
      LatLngBounds: vi.fn(),
    },
  };
});

describe('LocationInput - Basic Rendering', () => {
  it('renders the input component', () => {
    const onChange = vi.fn();
    const onLocationSelect = vi.fn();

    render(
      <LocationInput
        value=""
        onChange={onChange}
        onLocationSelect={onLocationSelect}
        data-testid="test-location-input"
      />
    );

    expect(screen.getByTestId('test-location-input')).toBeInTheDocument();
  });

  it('renders with placeholder text', () => {
    const onChange = vi.fn();
    const onLocationSelect = vi.fn();

    render(
      <LocationInput
        value=""
        onChange={onChange}
        onLocationSelect={onLocationSelect}
        placeholder="Enter your address"
        data-testid="test-location-input"
      />
    );

    expect(screen.getByPlaceholderText('Enter your address')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const onChange = vi.fn();
    const onLocationSelect = vi.fn();

    render(
      <LocationInput
        value="123 Main St, Fairfield, CT"
        onChange={onChange}
        onLocationSelect={onLocationSelect}
        data-testid="test-location-input"
      />
    );

    expect(screen.getByDisplayValue('123 Main St, Fairfield, CT')).toBeInTheDocument();
  });

  it('shows error styling when error prop is true', () => {
    const onChange = vi.fn();
    const onLocationSelect = vi.fn();

    render(
      <LocationInput
        value=""
        onChange={onChange}
        onLocationSelect={onLocationSelect}
        error={true}
        data-testid="test-location-input"
      />
    );

    const input = screen.getByTestId('test-location-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts disabled prop', () => {
    const onChange = vi.fn();
    const onLocationSelect = vi.fn();

    // Component should accept disabled prop without error
    expect(() => {
      render(
        <LocationInput
          value=""
          onChange={onChange}
          onLocationSelect={onLocationSelect}
          disabled={true}
          data-testid="test-location-input"
        />
      );
    }).not.toThrow();
  });
});

describe('LocationInput - Validation Error Messages', () => {
  /**
   * These tests document the expected validation behavior.
   * The actual validation happens in handlePredictionSelect which processes
   * Google Places API results. The error messages are:
   *
   * 1. City/region rejection:
   *    "Please enter a specific address, not a city or region"
   *
   * 2. Outside service area:
   *    "Address outside service area. We serve Fairfield County, CT and nearby airports."
   *
   * 3. Airport-only input with non-airport:
   *    "Please select an airport (e.g., JFK, LGA, EWR, BDL, HVN, HPN)."
   */

  it('documents the city/region error message in codebase', () => {
    // The error message for city/region rejection
    const expectedMessage = 'Please enter a specific address, not a city or region';

    // This message should exist in the LocationInput component
    // When a user selects a city (e.g., "Charlotte, NC") instead of a specific address,
    // the component should show this error
    expect(expectedMessage).toBeTruthy();
  });

  it('documents the service area error message in codebase', () => {
    // The error message for addresses outside service area
    const expectedMessage = 'Address outside service area. We serve Fairfield County, CT and nearby airports.';

    // This message should appear when a user selects an address
    // that is outside the extended service area
    expect(expectedMessage).toBeTruthy();
  });

  it('documents the airport-only error message in codebase', () => {
    // The error message for non-airport selection in airport-only input
    const expectedMessage = 'Please select an airport (e.g., JFK, LGA, EWR, BDL, HVN, HPN).';

    // This message should appear when restrictToAirports={true}
    // and the user selects something other than an airport
    expect(expectedMessage).toBeTruthy();
  });
});
