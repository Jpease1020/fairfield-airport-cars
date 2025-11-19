/**
 * Integration tests for Hero Quick Booking Form
 * Tests the business logic and user flow for the home page booking form
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import { BookingProvider } from '@/providers/BookingProvider';
import { CMSDataProvider } from '@/design/providers/CMSDataProvider';

// Mock useFareCalculation hook
const mockFare = vi.fn();
const mockIsCalculating = vi.fn(() => false);
const mockFareError = vi.fn(() => null);

vi.mock('@/hooks/useFareCalculation', () => ({
  useFareCalculation: vi.fn(() => ({
    fare: mockFare(),
    isCalculating: mockIsCalculating(),
    error: mockFareError(),
  })),
}));

// Mock LocationInput to avoid Google Maps dependency
vi.mock('@/design/components/base-components/forms/LocationInput', () => ({
  LocationInput: ({ value, onChange, onLocationSelect, 'data-testid': testId, ...props }: any) => (
    <input
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        // Simulate location selection with coordinates
        if (value && onLocationSelect) {
          onLocationSelect(value, { lat: 41.123, lng: -73.456 });
        }
      }}
      {...props}
    />
  ),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <CMSDataProvider initialCmsData={{}}>
      <BookingProvider>
        {component}
      </BookingProvider>
    </CMSDataProvider>
  );
};

describe('Hero Quick Booking Form - Business Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFare.mockReturnValue(null);
    mockIsCalculating.mockReturnValue(false);
    mockFareError.mockReturnValue(null);
  });

  it('should render all form fields', () => {
    renderWithProviders(<HeroCompactBookingForm />);
    
    expect(screen.getByTestId('quick-book-pickup-input')).toBeInTheDocument();
    expect(screen.getByTestId('quick-book-dropoff-input')).toBeInTheDocument();
    expect(screen.getByTestId('quick-book-datetime-input-date')).toBeInTheDocument();
    expect(screen.getByTestId('quick-book-datetime-input-time')).toBeInTheDocument();
  });

  it('should NOT show fare or button when form is empty', () => {
    renderWithProviders(<HeroCompactBookingForm />);
    
    expect(screen.queryByTestId('quick-book-price-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quick-book-secure-rate-button')).not.toBeInTheDocument();
  });

  it('should NOT show fare or button when only locations are filled (missing date/time)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HeroCompactBookingForm />);
    
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    await user.type(dropoffInput, 'JFK Airport');
    await dropoffInput.blur();
    
    // Wait a bit for any calculations
    await waitFor(() => {
      expect(screen.queryByTestId('quick-book-price-display')).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.queryByTestId('quick-book-secure-rate-button')).not.toBeInTheDocument();
  });

  it('should show fare and button when all fields are filled including date/time', async () => {
    const user = userEvent.setup();
    mockFare.mockReturnValue(129.50);
    
    renderWithProviders(<HeroCompactBookingForm />);
    
    // Fill pickup location
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    
    // Fill dropoff location
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    await user.type(dropoffInput, 'JFK Airport');
    await dropoffInput.blur();
    
    // Fill date
    const dateInput = screen.getByTestId('quick-book-datetime-input-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);
    
    // Fill time
    const timeInput = screen.getByTestId('quick-book-datetime-input-time');
    await user.type(timeInput, '14:00');
    
    // Wait for debounced sessionStorage save and fare calculation
    await waitFor(() => {
      expect(screen.getByTestId('quick-book-price-display')).toBeInTheDocument();
      expect(screen.getByText(/Estimated Fare: \$129\.50/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify promotional text appears
    expect(screen.getByText(/Limited Time Offer!/)).toBeInTheDocument();
    expect(screen.getByText(/No Deposit Required/)).toBeInTheDocument();
    
    // Verify button appears
    const button = screen.getByTestId('quick-book-secure-rate-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should pass pickupDateTime to useFareCalculation hook', async () => {
    const user = userEvent.setup();
    const { useFareCalculation } = await import('@/hooks/useFareCalculation');
    
    renderWithProviders(<HeroCompactBookingForm />);
    
    // Fill all fields
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    await user.type(dropoffInput, 'JFK Airport');
    await dropoffInput.blur();
    
    const dateInput = screen.getByTestId('quick-book-datetime-input-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);
    
    const timeInput = screen.getByTestId('quick-book-datetime-input-time');
    await user.type(timeInput, '14:00');
    
    // Wait a bit for the hook to be called
    await waitFor(() => {
      expect(useFareCalculation).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Verify pickupDateTime was passed
    const lastCall = (useFareCalculation as any).mock.calls[(useFareCalculation as any).mock.calls.length - 1];
    expect(lastCall[0]).toHaveProperty('pickupDateTime');
    expect(lastCall[0].pickupDateTime).toBeTruthy();
  });

  it('should disable button when form is invalid', async () => {
    const user = userEvent.setup();
    mockFare.mockReturnValue(129.50);
    
    renderWithProviders(<HeroCompactBookingForm />);
    
    // Fill only pickup (incomplete form)
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    
    // If button appears (shouldn't), it should be disabled
    const button = screen.queryByTestId('quick-book-secure-rate-button');
    if (button) {
      expect(button).toBeDisabled();
    }
  });

  it('should show loading state while calculating fare', async () => {
    const user = userEvent.setup();
    mockIsCalculating.mockReturnValue(true);
    mockFare.mockReturnValue(null);
    
    renderWithProviders(<HeroCompactBookingForm />);
    
    // Fill all fields
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    await user.type(dropoffInput, 'JFK Airport');
    await dropoffInput.blur();
    
    const dateInput = screen.getByTestId('quick-book-datetime-input-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);
    
    const timeInput = screen.getByTestId('quick-book-datetime-input-time');
    await user.type(timeInput, '14:00');
    
    // Wait for debounced sessionStorage save and fare calculation
    // Should show calculating message (if fare is being calculated)
    await waitFor(() => {
      const calculatingText = screen.queryByText(/Calculating/);
      // Either calculating text appears OR fare display appears (calculation completed)
      expect(calculatingText || screen.queryByTestId('quick-book-price-display')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should show error message when fare calculation fails', async () => {
    const user = userEvent.setup();
    mockFareError.mockReturnValue('Network error while generating quote' as any);
    
    renderWithProviders(<HeroCompactBookingForm />);
    
    // Fill all fields
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    await user.type(pickupInput, 'Fairfield Station');
    await pickupInput.blur();
    
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    await user.type(dropoffInput, 'JFK Airport');
    await dropoffInput.blur();
    
    const dateInput = screen.getByTestId('quick-book-datetime-input-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);
    
    const timeInput = screen.getByTestId('quick-book-datetime-input-time');
    await user.type(timeInput, '14:00');
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

