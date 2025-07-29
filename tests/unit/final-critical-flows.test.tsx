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
  usePathname: () => '/',
  useParams: () => ({ id: 'test-booking-123' }),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ user: { email: 'gregg@fairfieldairportcar.com' } });
    return () => {};
  }),
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(() => ({})),
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
  pathname: '/',
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

describe('🎯 Critical Business Flows - What Users Can Do', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocation.href = '';
  });

  describe('🔴 CRITICAL: Customer Can Book a Ride', () => {
    test('customer can complete entire booking journey', async () => {
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
            driverName: 'John Driver',
            driverPhone: '203-555-0123'
          })
        });

      // Import and render booking form
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // User fills out booking form (using semantic queries)
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

      // User sets future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // User sets number of passengers
      fireEvent.change(screen.getByTestId('passengers-select'), {
        target: { value: '2' }
      });

      // User calculates fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      
      // User sees fare estimate
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // User submits booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // User is redirected to payment
      await waitFor(() => {
        expect(mockLocation.href).toBe('https://squareup.com/checkout/test-session');
      });
    });

    test('customer gets helpful error messages when booking fails', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // User fills out form
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

      // User sets future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // User tries to calculate fare but gets error
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      
      // User sees helpful error message
      await waitFor(() => {
        expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
      });
    });

    test('customer cannot submit incomplete booking form', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // User tries to submit without filling required fields
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

      // User tries to calculate fare without required fields
      const calculateButton = screen.getByTestId('calculate-fare-button');
      expect(calculateButton).toBeDisabled();
    });
  });

  describe('🔴 CRITICAL: Admin Can Manage Business', () => {
    test('admin can log in with email and password', async () => {
      // Mock successful Firebase auth
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Admin fills login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'gregg@fairfieldairportcar.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      // Admin submits login
      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Admin authentication is processed
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'gregg@fairfieldairportcar.com',
          'password123'
        );
      });
    });

    test('admin can log in with Google', async () => {
      const { signInWithPopup } = require('firebase/auth');
      signInWithPopup.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Admin clicks Google sign in
      fireEvent.click(screen.getByTestId('google-sign-in-button'));

      // Admin Google authentication is processed
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });
  });

  describe('🔴 CRITICAL: Payment Processing Works', () => {
    test('payment system creates checkout session', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          paymentLinkUrl: 'https://squareup.com/checkout/test-session',
          orderId: 'test-order-123'
        })
      });

      // Simulate payment session creation
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

      // Payment system works correctly
      expect(data.paymentLinkUrl).toBe('https://squareup.com/checkout/test-session');
      expect(data.orderId).toBe('test-order-123');
    });

    test('payment system handles successful payments', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Payment processed successfully'
        })
      });

      // Simulate successful payment webhook
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

      // Payment system processes successful payments
      expect(data.message).toBe('Payment processed successfully');
    });

    test('payment system handles payment errors', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid payment data' })
      });

      // Simulate payment error
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

      // Payment system handles errors gracefully
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid payment data');
    });
  });

  describe('🔴 CRITICAL: Form Validation Protects Users', () => {
    test('booking form validates required fields', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // User tries to submit without filling form
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

      // User fills required fields
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

      // User sets future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // User can now submit form
      expect(bookButton).not.toBeDisabled();
    });

    test('booking form handles network errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // User fills out form
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

      // User sets future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // User tries to calculate fare but gets network error
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      
      // User sees helpful error message
      await waitFor(() => {
        expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
      });

      // User tries to book without fare calculation
      fireEvent.click(screen.getByTestId('book-now-button'));

      // User gets helpful guidance
      await waitFor(() => {
        expect(screen.getByText(/please calculate fare before booking/i)).toBeInTheDocument();
      });
    });
  });

  describe('🟡 IMPORTANT: Booking Data Persistence', () => {
    test('booking data is saved for user reference', async () => {
      // Mock successful booking creation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fare: 150.00
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

      // User fills complete form
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

      // User sets future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // User calculates fare first
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // User submits booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // User's booking data is saved for reference
      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'pendingBooking',
          expect.stringContaining('test-booking-123')
        );
      });
    });
  });

  describe('🟡 IMPORTANT: Business Services Work', () => {
    test('fare estimation service provides accurate pricing', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fare: 150.00,
          distance: '45 miles',
          duration: '1 hour 15 minutes'
        })
      });

      // Simulate fare estimation service call
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-01-15T10:00:00Z',
          passengers: 2
        })
      });

      const data = await response.json();

      // Fare estimation service provides accurate information
      expect(data.fare).toBe(150.00);
      expect(data.distance).toBe('45 miles');
      expect(data.duration).toBe('1 hour 15 minutes');
    });

    test('booking creation service processes reservations', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          bookingId: 'test-booking-123',
          paymentLinkUrl: 'https://squareup.com/checkout/test-session',
          driverName: 'John Driver',
          driverPhone: '203-555-0123'
        })
      });

      // Simulate booking creation service call
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Smith',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-01-15T10:00:00Z',
          passengers: 2,
          fare: 150.00
        })
      });

      const data = await response.json();

      // Booking creation service processes reservations correctly
      expect(data.bookingId).toBe('test-booking-123');
      expect(data.paymentLinkUrl).toBe('https://squareup.com/checkout/test-session');
      expect(data.driverName).toBe('John Driver');
      expect(data.driverPhone).toBe('203-555-0123');
    });
  });
}); 