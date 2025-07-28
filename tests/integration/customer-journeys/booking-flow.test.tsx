import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import BookingForm from '../../../src/app/book/booking-form';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock API calls
global.fetch = jest.fn();

// Mock Google Maps
global.google = {
  maps: {
    places: {
      AutocompletePrediction: class {}
    }
  }
} as any;

describe('Booking Flow - User Journey', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
  });

  it('allows user to fill out booking form step by step', async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    // Step 1: Fill personal information
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);

    await user.type(nameInput, 'John Smith');
    await user.type(emailInput, 'john@example.com');
    await user.type(phoneInput, '203-555-0123');

    expect(nameInput).toHaveValue('John Smith');
    expect(emailInput).toHaveValue('john@example.com');
    expect(phoneInput).toHaveValue('203-555-0123');

    // Step 2: Fill trip details
    const pickupInput = screen.getByLabelText(/pickup location/i);
    const dropoffInput = screen.getByLabelText(/dropoff location/i);
    const dateInput = screen.getByLabelText(/pickup date & time/i);

    await user.type(pickupInput, 'Fairfield Station');
    await user.type(dropoffInput, 'JFK Airport');
    await user.type(dateInput, '2024-12-25T10:00');

    expect(pickupInput).toHaveValue('Fairfield Station');
    expect(dropoffInput).toHaveValue('JFK Airport');
    expect(dateInput).toHaveValue('2024-12-25T10:00');

    // Step 3: Select passengers
    const passengerSelect = screen.getByLabelText(/number of passengers/i);
    await user.selectOptions(passengerSelect, '2');
    expect(passengerSelect).toHaveValue('2');
  });

  it('calculates fare when user clicks calculate button', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ fare: 150 })
    });

    render(<BookingForm />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Smith');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '203-555-0123');
    await user.type(screen.getByLabelText(/pickup location/i), 'Fairfield Station');
    await user.type(screen.getByLabelText(/dropoff location/i), 'JFK Airport');

    // Click calculate fare
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);

    // Should show loading state
    expect(calculateButton).toBeDisabled();

    // Should call fare estimation API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/booking/estimate-fare', expect.any(Object));
    });
  });

  it('submits booking successfully with valid data', async () => {
    const user = userEvent.setup();
    const mockBookingResponse = { bookingId: 'booking-123' };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ fare: 150 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockBookingResponse });

    render(<BookingForm />);

    // Fill out complete form
    await user.type(screen.getByLabelText(/full name/i), 'John Smith');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '203-555-0123');
    await user.type(screen.getByLabelText(/pickup location/i), 'Fairfield Station');
    await user.type(screen.getByLabelText(/dropoff location/i), 'JFK Airport');
    await user.type(screen.getByLabelText(/pickup date & time/i), '2024-12-25T10:00');
    await user.selectOptions(screen.getByLabelText(/number of passengers/i), '2');

    // Calculate fare first
    await user.click(screen.getByRole('button', { name: /calculate fare/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/booking/estimate-fare', expect.any(Object));
    });

    // Submit booking
    const submitButton = screen.getByRole('button', { name: /book now/i });
    await user.click(submitButton);

    // Should call booking API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/booking', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('John Smith')
      }));
    });
  });

  it('shows validation errors for invalid data', async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /book now/i });
    await user.click(submitButton);

    // Should show fare calculation error
    await waitFor(() => {
      expect(screen.getByText(/please calculate fare before booking/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<BookingForm />);

    // Fill form and try to calculate fare
    await user.type(screen.getByLabelText(/full name/i), 'John Smith');
    await user.type(screen.getByLabelText(/pickup location/i), 'Fairfield Station');
    await user.type(screen.getByLabelText(/dropoff location/i), 'JFK Airport');
    await user.type(screen.getByLabelText(/pickup date & time/i), '2024-12-25T10:00');

    await user.click(screen.getByRole('button', { name: /calculate fare/i }));

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
    });
  });

  it('provides accessible form controls', () => {
    render(<BookingForm />);

    // All form controls should have proper labels
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dropoff location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup date & time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of passengers/i)).toBeInTheDocument();

    // Buttons should have accessible names
    expect(screen.getByRole('button', { name: /calculate fare/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('debug: shows what is actually rendered', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<BookingForm />);

    // Fill form and try to calculate fare
    await user.type(screen.getByLabelText(/full name/i), 'John Smith');
    await user.type(screen.getByLabelText(/pickup location/i), 'Fairfield Station');
    await user.type(screen.getByLabelText(/dropoff location/i), 'JFK Airport');

    await user.click(screen.getByRole('button', { name: /calculate fare/i }));

    // Debug: log what's actually rendered
    console.log('Rendered HTML:', document.body.innerHTML);
    
    // Wait a bit and check again
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('After wait HTML:', document.body.innerHTML);
  });

  it('debug: check form validation', async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    // Check initial button state
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    expect(calculateButton).toBeDisabled();

    // Fill required fields
    await user.type(screen.getByLabelText(/pickup location/i), 'Fairfield Station');
    await user.type(screen.getByLabelText(/dropoff location/i), 'JFK Airport');
    await user.type(screen.getByLabelText(/pickup date & time/i), '2024-12-25T10:00');

    // Check if button is now enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /calculate fare/i })).not.toBeDisabled();
    });

    console.log('Form state after filling:', {
      pickupLocation: screen.getByLabelText(/pickup location/i).getAttribute('value'),
      dropoffLocation: screen.getByLabelText(/dropoff location/i).getAttribute('value'),
      pickupDateTime: screen.getByLabelText(/pickup date & time/i).getAttribute('value'),
    });
  });
}); 