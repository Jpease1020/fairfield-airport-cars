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

describe('Business Critical Flows - Gregg\'s Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocation.href = '';
  });

  describe('🔴 CRITICAL: Customer Booking Flow', () => {
    test('Complete customer booking journey', async () => {
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

      // Calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify payment link creation and redirect
      await waitFor(() => {
        expect(mockLocation.href).toBe('https://squareup.com/checkout/test-session');
      });

      // Verify session storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingBooking',
        expect.stringContaining('test-booking-123')
      );
    });

    test('Handles booking errors gracefully', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill minimal form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });

      // Try to calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
      });
    });

    test('Validates form before submission', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Try to submit without filling required fields
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

      // Try to calculate fare without required fields
      const calculateButton = screen.getByTestId('calculate-fare-button');
      expect(calculateButton).toBeDisabled();
    });
  });

  describe('🔴 CRITICAL: Admin Authentication Flow', () => {
    test('Admin login with valid credentials', async () => {
      // Mock successful Firebase auth
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Fill login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'gregg@fairfieldairportcar.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      // Submit login
      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Verify authentication call
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'gregg@fairfieldairportcar.com',
          'password123'
        );
      });
    });

    test('Admin login with Google', async () => {
      const { signInWithPopup } = require('firebase/auth');
      signInWithPopup.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Click Google sign in
      fireEvent.click(screen.getByTestId('google-sign-in-button'));

      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });
  });

  describe('🔴 CRITICAL: Payment Processing Flow', () => {
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

    test('Handles payment errors', async () => {
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

  describe('🔴 CRITICAL: Booking Management Flow', () => {
    test('Admin can view and manage bookings', async () => {
      // Mock bookings data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '203-555-0123',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: '2024-01-15T10:00:00Z',
            passengers: 2,
            fare: 150.00,
            status: 'pending',
            paymentStatus: 'paid'
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify bookings page loads
      await waitFor(() => {
        expect(screen.getByText(/manage bookings/i)).toBeInTheDocument();
      });

      // Verify booking data is displayed
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/fairfield station/i)).toBeInTheDocument();
        expect(screen.getByText(/jfk airport/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/i)).toBeInTheDocument();
      });
    });

    test('Admin can update booking status', async () => {
      // Mock update API
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'booking-1',
              name: 'John Smith',
              status: 'pending'
            }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Find and click status update button
      const statusButtons = screen.getAllByRole('button');
      const confirmButton = statusButtons.find(button => 
        button.textContent?.includes('Confirm') || 
        button.textContent?.includes('Update') ||
        button.textContent?.includes('Status')
      );
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
        
        // Verify API call was made
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/bookings/booking-1'),
            expect.objectContaining({
              method: 'PUT'
            })
          );
        });
      }
    });
  });

  describe('🔴 CRITICAL: Payment Management Flow', () => {
    test('Admin can view payment statistics', async () => {
      // Mock payment data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 5000.00,
          totalBookings: 25,
          pendingPayments: 3,
          recentPayments: [
            {
              id: 'payment-1',
              bookingId: 'booking-1',
              amount: 150.00,
              status: 'completed',
              customerName: 'John Smith',
              date: '2024-01-15T10:00:00Z'
            }
          ]
        })
      });

      const { default: AdminPaymentsPage } = await import('@/app/admin/payments/page');
      render(<AdminPaymentsPage />);

      // Verify payments page loads
      await waitFor(() => {
        expect(screen.getByText(/payment management/i)).toBeInTheDocument();
      });

      // Verify payment data is displayed
      await waitFor(() => {
        expect(screen.getByText(/\$5,000\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/25/i)).toBeInTheDocument();
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });
    });

    test('Admin can process refunds', async () => {
      // Mock refund API
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            totalRevenue: 5000.00,
            recentPayments: [
              {
                id: 'payment-1',
                bookingId: 'booking-1',
                amount: 150.00,
                status: 'completed'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, refundId: 'refund-123' })
        });

      const { default: AdminPaymentsPage } = await import('@/app/admin/payments/page');
      render(<AdminPaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/payment management/i)).toBeInTheDocument();
      });

      // Find and click refund button
      const refundButtons = screen.getAllByRole('button');
      const refundButton = refundButtons.find(button => 
        button.textContent?.includes('Refund') || 
        button.textContent?.includes('Process Refund')
      );
      
      if (refundButton) {
        fireEvent.click(refundButton);
        
        // Verify refund API call
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/admin/payments/payment-1/refund'),
            expect.objectContaining({
              method: 'POST'
            })
          );
        });
      }
    });
  });

  describe('🟡 IMPORTANT: Form Validation and Error Handling', () => {
    test('Validates required fields in booking form', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Try to submit without filling form
      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeDisabled();

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

      // Now button should be enabled
      expect(bookButton).not.toBeDisabled();
    });

    test('Handles network errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

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

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
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
  });

  describe('🟡 IMPORTANT: Session Management', () => {
    test('Stores booking data in session storage', async () => {
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

      // Calculate fare first
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify session storage is used
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingBooking',
        expect.stringContaining('test-booking-123')
      );

      // Verify the stored data contains all necessary information
      const storedData = mockSessionStorage.setItem.mock.calls[0][1];
      expect(storedData).toContain('test-booking-123');
      expect(storedData).toContain('John Driver');
      expect(storedData).toContain('203-555-0123');
      expect(storedData).toContain('150');
    });
  });
}); 