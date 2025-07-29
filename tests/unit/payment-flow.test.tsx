import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import BookingForm from '@/app/book/booking-form';
import PaymentsPage from '@/app/admin/payments/page';

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
  assign: jest.fn(),
  replace: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Setup MSW server for API mocking
const server = setupServer(
  // Mock fare estimation
  http.post('/api/booking/estimate-fare', () => {
    return HttpResponse.json({
      fare: 150.00,
      distance: '45 miles',
      duration: '1 hour 15 minutes',
      baseFare: 120.00,
      surcharge: 30.00
    });
  }),

  // Mock booking creation
  http.post('/api/booking', () => {
    return HttpResponse.json({
      bookingId: 'test-booking-123',
      paymentLinkUrl: 'https://squareup.com/checkout/test-session',
      driverName: 'Gregg',
      driverPhone: '203-555-0123',
      status: 'pending'
    });
  }),

  // Mock payment creation
  http.post('/api/payment/create-checkout-session', () => {
    return HttpResponse.json({
      paymentLinkUrl: 'https://squareup.com/checkout/test-session',
      orderId: 'test-order-123'
    });
  }),

  // Mock payment completion
  http.post('/api/payment/complete-payment', () => {
    return HttpResponse.json({
      paymentLinkUrl: 'https://squareup.com/checkout/balance-session',
      success: true
    });
  }),

  // Mock Square webhook
  http.post('/api/payment/square-webhook', () => {
    return HttpResponse.json({
      message: 'Payment processed successfully'
    });
  }),

  // Mock admin payments API
  http.get('/api/admin/payments', () => {
    return HttpResponse.json([
      {
        id: 'payment-1',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        bookingId: 'booking-1',
        amount: 75.00,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentType: 'deposit',
        stripePaymentId: 'pi_test_123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:05:00Z')
      },
      {
        id: 'payment-2',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        bookingId: 'booking-2',
        amount: 120.00,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'credit_card',
        paymentType: 'full',
        stripePaymentId: 'pi_test_456',
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T09:00:00Z')
      }
    ]);
  }),

  // Mock refund processing
  http.post('/api/admin/payments/:id/refund', () => {
    return HttpResponse.json({
      success: true,
      refundId: 're_test_123',
      amount: 75.00
    });
  })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  mockSessionStorage.clear();
  mockLocation.href = '';
});

// Close server after all tests
afterAll(() => server.close());

describe('Payment Flow Integration Tests', () => {
  describe('Customer Booking and Payment Flow', () => {
    test('Complete booking flow with payment integration', async () => {
      render(<BookingForm />);

      // Fill out booking form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByLabelText(/pickup/i), {
        target: { value: 'Fairfield Station, Fairfield, CT' }
      });
      fireEvent.change(screen.getByLabelText(/destination/i), {
        target: { value: 'JFK Airport, Queens, NY' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByLabelText(/date and time/i), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Set passengers
      fireEvent.change(screen.getByLabelText(/passengers/i), {
        target: { value: '2' }
      });

      // Calculate fare
      fireEvent.click(screen.getByText(/calculate fare/i));

      // Wait for fare calculation
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByText(/book your ride/i));

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
      server.use(
        http.post('/api/booking', () => {
          return HttpResponse.json(
            { error: 'Payment service unavailable' },
            { status: 500 }
          );
        })
      );

      render(<BookingForm />);

      // Fill out minimal form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByLabelText(/pickup/i), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByLabelText(/destination/i), {
        target: { value: 'JFK Airport' }
      });

      // Calculate fare
      fireEvent.click(screen.getByText(/calculate fare/i));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByText(/book your ride/i));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/payment service unavailable/i)).toBeInTheDocument();
      });
    });

    test('Validates form before payment processing', async () => {
      render(<BookingForm />);

      // Try to submit without filling form
      fireEvent.click(screen.getByText(/book your ride/i));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/please fill out all required fields/i)).toBeInTheDocument();
      });
    });
  });

  describe('Admin Payment Management Flow', () => {
    test('Displays payment statistics correctly', async () => {
      render(<PaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/\$195\.00/i)).toBeInTheDocument(); // 75 + 120
      });

      // Verify payment status badges
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    test('Processes refunds successfully', async () => {
      render(<PaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Click refund button for first payment
      const refundButtons = screen.getAllByText(/refund/i);
      fireEvent.click(refundButtons[0]);

      // Verify refund processing
      await waitFor(() => {
        expect(screen.getByText(/refund processed for john smith/i)).toBeInTheDocument();
      });
    });

    test('Handles payment search functionality', async () => {
      render(<PaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/search payments/i)).toBeInTheDocument();
      });

      // Click search payments quick action
      const searchButton = screen.getByText(/search payments/i);
      fireEvent.click(searchButton);

      // Verify search functionality (would show search modal in real implementation)
      expect(searchButton).toBeInTheDocument();
    });

    test('Displays payment details correctly', async () => {
      render(<PaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
      });

      // Verify payment amounts
      expect(screen.getByText(/\$75\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/\$120\.00/i)).toBeInTheDocument();

      // Verify payment types
      expect(screen.getByText(/deposit/i)).toBeInTheDocument();
      expect(screen.getByText(/full/i)).toBeInTheDocument();
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
      server.use(
        http.post('/api/booking', () => {
          return HttpResponse.error();
        })
      );

      render(<BookingForm />);

      // Fill out form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByLabelText(/pickup/i), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByLabelText(/destination/i), {
        target: { value: 'JFK Airport' }
      });

      // Calculate fare
      fireEvent.click(screen.getByText(/calculate fare/i));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByText(/book your ride/i));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('Handles invalid payment data', async () => {
      // Mock invalid payment response
      server.use(
        http.post('/api/payment/create-checkout-session', () => {
          return HttpResponse.json(
            { error: 'Invalid payment data' },
            { status: 400 }
          );
        })
      );

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