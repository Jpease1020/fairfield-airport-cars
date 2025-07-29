import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/book',
}));

// Mock Google Maps
global.window.google = {
  maps: {
    places: {
      Autocomplete: jest.fn(),
      AutocompletePrediction: jest.fn(),
    },
    DistanceMatrixService: jest.fn(),
  },
} as any;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock location
const mockLocation = {
  href: '',
  pathname: '/book',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Customer Booking Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocation.href = '';
  });

  describe('Booking Form Rendering', () => {
    test('renders complete booking form with all sections', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Verify form container
      expect(screen.getByTestId('booking-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('booking-form')).toBeInTheDocument();
      expect(screen.getByTestId('booking-form-stack')).toBeInTheDocument();

      // Verify contact information section
      expect(screen.getByTestId('contact-information-card')).toBeInTheDocument();
      expect(screen.getByTestId('contact-information-stack')).toBeInTheDocument();
      expect(screen.getByTestId('contact-information-title')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();

      // Verify trip details section
      expect(screen.getByTestId('trip-details-card')).toBeInTheDocument();
      expect(screen.getByTestId('trip-details-stack')).toBeInTheDocument();
      expect(screen.getByTestId('trip-details-title')).toBeInTheDocument();
      expect(screen.getByTestId('pickup-location-input')).toBeInTheDocument();
      expect(screen.getByTestId('dropoff-location-input')).toBeInTheDocument();
      expect(screen.getByTestId('pickup-datetime-input')).toBeInTheDocument();
      expect(screen.getByTestId('flight-number-input')).toBeInTheDocument();

      // Verify additional information section
      expect(screen.getByTestId('additional-information-card')).toBeInTheDocument();
      expect(screen.getByTestId('additional-information-stack')).toBeInTheDocument();
      expect(screen.getByTestId('additional-information-title')).toBeInTheDocument();
      expect(screen.getByTestId('passengers-select')).toBeInTheDocument();
      expect(screen.getByTestId('notes-input')).toBeInTheDocument();

      // Verify action buttons
      expect(screen.getByTestId('action-buttons-card')).toBeInTheDocument();
      expect(screen.getByTestId('action-buttons-stack')).toBeInTheDocument();
      expect(screen.getByTestId('calculate-fare-button')).toBeInTheDocument();
      expect(screen.getByTestId('book-now-button')).toBeInTheDocument();
    });

    test('shows Google Maps error when API is unavailable', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Verify maps error message is displayed
      expect(screen.getByTestId('maps-error-message')).toBeInTheDocument();
      expect(screen.getByText(/location autocomplete is temporarily unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields before submission', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Try to submit without filling required fields
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

      // Try to calculate fare without required fields
      const calculateButton = screen.getByTestId('calculate-fare-button');
      expect(calculateButton).toBeDisabled();

      // Fill required fields
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Now buttons should be enabled
      expect(calculateButton).not.toBeDisabled();
      expect(bookButton).not.toBeDisabled();
    });

    test('validates email format', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill form with invalid email
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });

      // Book button should still be disabled
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();
    });

    test('validates phone number format', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill form with invalid phone
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '123' } // Too short
      });

      // Book button should still be disabled
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();
    });
  });

  describe('Fare Calculation', () => {
    test('calculates fare successfully', async () => {
      // Mock successful fare calculation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fare: 150.00,
          distance: '45 miles',
          duration: '1 hour 15 minutes'
        })
      });

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill required fields for fare calculation
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));

      // Verify fare calculation API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/booking/estimate-fare',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Fairfield Station')
          })
        );
      });

      // Verify fare is displayed
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
        expect(screen.getByTestId('fare-section')).toBeInTheDocument();
      });
    });

    test('handles fare calculation errors', async () => {
      // Mock fare calculation error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to calculate fare')
      );

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill required fields
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Try to calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Submission', () => {
    test('submits booking successfully', async () => {
      // Mock successful booking creation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fare: 150.00,
            distance: '45 miles',
            duration: '1 hour 15 minutes'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bookingId: 'test-booking-123',
            paymentLinkUrl: 'https://squareup.com/checkout/test-session',
            driverName: 'John Driver',
            driverPhone: '203-555-0123'
          })
        });

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill complete form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Set passengers
      fireEvent.change(screen.getByTestId('passengers-select'), {
        target: { value: '2' }
      });

      // Add notes
      fireEvent.change(screen.getByTestId('notes-input'), {
        target: { value: 'Wheelchair accessible' }
      });

      // Calculate fare first
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify booking API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/booking',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('John Smith')
          })
        );
      });

      // Verify payment redirect
      await waitFor(() => {
        expect(mockLocation.href).toBe('https://squareup.com/checkout/test-session');
      });

      // Verify session storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingBooking',
        expect.stringContaining('test-booking-123')
      );
    });

    test('handles booking submission errors', async () => {
      // Mock booking creation error
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fare: 150.00
          })
        })
        .mockRejectedValueOnce(new Error('Booking failed'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    test('maintains form state during interactions', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill form partially
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });

      // Verify form state is maintained
      expect(screen.getByTestId('name-input')).toHaveValue('John Smith');
      expect(screen.getByTestId('email-input')).toHaveValue('john@example.com');

      // Fill more fields
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });

      // Verify all values are maintained
      expect(screen.getByTestId('name-input')).toHaveValue('John Smith');
      expect(screen.getByTestId('email-input')).toHaveValue('john@example.com');
      expect(screen.getByTestId('phone-input')).toHaveValue('203-555-0123');
      expect(screen.getByTestId('pickup-location-input')).toHaveValue('Fairfield Station');
    });

    test('handles form reset', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });

      // Find and click reset button (if exists)
      const resetButton = screen.queryByTestId('reset-button');
      if (resetButton) {
        fireEvent.click(resetButton);

        // Verify form is reset
        expect(screen.getByTestId('name-input')).toHaveValue('');
        expect(screen.getByTestId('email-input')).toHaveValue('');
      }
    });
  });

  describe('Accessibility Features', () => {
    test('has proper form labels and accessibility attributes', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Verify form has proper labels
      expect(screen.getByTestId('name-input')).toHaveAttribute('id', 'name');
      expect(screen.getByTestId('email-input')).toHaveAttribute('id', 'email');
      expect(screen.getByTestId('phone-input')).toHaveAttribute('id', 'phone');
      expect(screen.getByTestId('pickup-location-input')).toHaveAttribute('id', 'pickupLocation');
      expect(screen.getByTestId('dropoff-location-input')).toHaveAttribute('id', 'dropoffLocation');
      expect(screen.getByTestId('pickup-datetime-input')).toHaveAttribute('id', 'pickupDateTime');
      expect(screen.getByTestId('passengers-select')).toHaveAttribute('id', 'passengers');

      // Verify labels are associated with inputs
      expect(screen.getByTestId('name-input')).toHaveAttribute('aria-labelledby');
      expect(screen.getByTestId('email-input')).toHaveAttribute('aria-labelledby');
      expect(screen.getByTestId('phone-input')).toHaveAttribute('aria-labelledby');
    });

    test('has proper error message accessibility', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Verify error message has proper attributes
      const errorMessage = screen.queryByTestId('error-message');
      if (errorMessage) {
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      }
    });
  });
}); 