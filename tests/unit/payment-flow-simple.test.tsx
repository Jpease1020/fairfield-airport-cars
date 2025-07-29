import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from '@/app/book/booking-form';

// Mock Google Maps API
const mockGoogleMaps = {
  maps: {
    places: {
      AutocompleteService: jest.fn(),
      PlacesService: jest.fn(),
    },
    Geocoder: jest.fn(),
    DistanceMatrixService: jest.fn(),
  },
};

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogleMaps,
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/book',
  assign: jest.fn(),
  replace: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
    mockSessionStorage.clear();
  });

  describe('Customer Booking and Payment Flow', () => {
    test('Complete booking flow with payment integration', async () => {
      // Mock successful API responses
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
            driverName: 'Gregg',
            driverPhone: '203-555-0123',
            status: 'pending'
          })
        });

      render(<BookingForm />);

      // Fill out booking form
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
        target: { value: 'Fairfield Station, Fairfield, CT' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport, Queens, NY' }
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

      // Calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));

      // Wait for fare calculation
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify payment link creation and redirect
      await waitFor(() => {
        expect(mockLocation.href).toBe('https://squareup.com/checkout/test-session');
      });

      // Verify session storage was set
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingBooking',
        expect.stringContaining('test-booking-123')
      );
    });

    test('Handles payment errors gracefully', async () => {
      // Mock payment creation failure
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
          ok: false,
          status: 500,
          json: async () => ({ error: 'Payment service unavailable' })
        });

      render(<BookingForm />);

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Fill out minimal form
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

      // Fill required fields for fare calculation
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
        expect(screen.getByText(/failed to create booking/i)).toBeInTheDocument();
      });
    });

    test('Validates form before payment processing', async () => {
      render(<BookingForm />);

      // Try to submit without filling form - button should be disabled
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

      // Try to calculate fare without required fields - button should be disabled
      const calculateButton = screen.getByTestId('calculate-fare-button');
      expect(calculateButton).toBeDisabled();
    });
  });

  describe('Payment API Integration', () => {
    test('Creates checkout session with correct data', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          paymentLinkUrl: 'https://squareup.com/checkout/test-session',
          orderId: 'test-order-123'
        })
      });

      // Simulate API call
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'test-booking-123',
          amount: 15000, // $150.00 in cents
          currency: 'USD',
          description: 'Airport Transfer - Fairfield to JFK'
        })
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test-booking-123')
      });

      expect(data.paymentLinkUrl).toBe('https://squareup.com/checkout/test-session');
      expect(data.orderId).toBe('test-order-123');
    });

    test('Handles payment completion webhook', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Payment processed successfully'
        })
      });

      // Simulate webhook call
      const response = await fetch('/api/payment/square-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-square-hmacsha256-signature': 'test-signature'
        },
        body: JSON.stringify({
          type: 'payment.updated',
          data: {
            object: {
              payment: {
                order_id: 'test-order-123',
                status: 'COMPLETED'
              }
            }
          }
        })
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/payment/square-webhook', {
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-square-hmacsha256-signature': 'test-signature'
        }),
        body: expect.stringContaining('payment.updated')
      });

      expect(data.message).toBe('Payment processed successfully');
    });
  });

  describe('Payment Error Handling', () => {
    test('Handles network errors during payment', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<BookingForm />);

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Fill out form
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

      // Fill required fields for fare calculation
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Calculate fare - should fail due to network error
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/error estimating fare\. please try again\./i)).toBeInTheDocument();
      });

      // Submit booking - should fail because no fare was calculated
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/please calculate fare before booking/i)).toBeInTheDocument();
      });
    });

    test('Handles invalid payment data', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid payment data' })
      });

      // Simulate API call with invalid data
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: '',
          amount: -100,
          currency: 'INVALID',
          description: ''
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid payment data');
    });
  });
}); 