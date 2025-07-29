import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/booking-service');
jest.mock('@/lib/services/driver-service');
jest.mock('@/lib/services/review-service');
jest.mock('@/lib/services/square-service');

describe('Critical API Endpoints Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking API', () => {
    it('should create booking with payment integration', async () => {
      const { POST } = await import('@/app/api/booking/route');
      
      const mockBookingId = 'booking-123';
      const mockPaymentLink = {
        id: 'payment-link-123',
        url: 'https://squareup.com/checkout/test',
        orderId: 'order-123'
      };

      // Mock the services
      const { createBooking, getBooking } = require('@/lib/services/booking-service');
      const { createPaymentLink } = require('@/lib/services/square-service');
      
      createBooking.mockResolvedValue(mockBookingId);
      getBooking.mockResolvedValue({
        id: mockBookingId,
        name: 'John Doe',
        email: 'john@example.com',
        fare: 150
      });
      createPaymentLink.mockResolvedValue(mockPaymentLink);

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00:00',
          passengers: 2,
          fare: 150
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookingId).toBe(mockBookingId);
      expect(data.paymentLinkUrl).toBe(mockPaymentLink.url);
      expect(data.driverName).toBe('Gregg');
      expect(data.driverPhone).toBe('(203) 555-0123');
    });

    it('should handle missing required fields', async () => {
      const { POST } = await import('@/app/api/booking/route');

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com'
          // Missing required fields
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required field');
    });
  });

  describe('Tracking API', () => {
    it('should return tracking information for booking', async () => {
      const { GET } = await import('@/app/api/tracking/[bookingId]/route');
      
      const mockBooking = {
        id: 'booking-123',
        name: 'John Doe',
        pickupLocation: 'Fairfield Station',
        pickupDateTime: new Date('2024-12-25T10:00:00'),
        driverId: 'gregg-main-driver'
      };

      const mockDriver = {
        id: 'gregg-main-driver',
        name: 'Gregg',
        phone: '(203) 555-0123',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Highlander',
          year: 2022,
          color: 'Silver',
          licensePlate: 'CT-ABC123'
        },
        currentLocation: {
          latitude: 41.123,
          longitude: -73.456,
          timestamp: new Date()
        }
      };

      // Mock the services
      const { getBooking } = require('@/lib/services/booking-service');
      const { getDriver } = require('@/lib/services/driver-service');
      
      getBooking.mockResolvedValue(mockBooking);
      getDriver.mockResolvedValue(mockDriver);

      const request = new NextRequest('http://localhost:3000/api/tracking/booking-123');
      const response = await GET(request, { params: { bookingId: 'booking-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.bookingId).toBe('booking-123');
      expect(data.driverName).toBe('Gregg');
      expect(data.driverPhone).toBe('(203) 555-0123');
      expect(data.vehicleInfo.make).toBe('Toyota');
      expect(data.currentLocation).toBeDefined();
    });

    it('should handle booking not found', async () => {
      const { GET } = await import('@/app/api/tracking/[bookingId]/route');
      
      const { getBooking } = require('@/lib/services/booking-service');
      getBooking.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tracking/non-existent');
      const response = await GET(request, { params: { bookingId: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Booking not found');
    });
  });

  describe('Review API', () => {
    it('should submit review successfully', async () => {
      const { POST } = await import('@/app/api/reviews/submit/route');
      
      const mockBooking = {
        id: 'booking-123',
        name: 'John Doe',
        email: 'john@example.com',
        pickupDateTime: new Date('2024-12-25T10:00:00'),
        driverId: 'gregg-main-driver',
        driverName: 'Gregg'
      };

      const mockReviewId = 'review-123';

      // Mock the services
      const { createReview, hasBookingBeenReviewed } = require('@/lib/services/review-service');
      const { getBooking } = require('@/lib/services/booking-service');
      
      hasBookingBeenReviewed.mockResolvedValue(false);
      getBooking.mockResolvedValue(mockBooking);
      createReview.mockResolvedValue(mockReviewId);

      const request = new NextRequest('http://localhost:3000/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'booking-123',
          rating: 5,
          comment: 'Great service!'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reviewId).toBe(mockReviewId);
    });

    it('should reject duplicate reviews', async () => {
      const { POST } = await import('@/app/api/reviews/submit/route');
      
      const { hasBookingBeenReviewed } = require('@/lib/services/review-service');
      hasBookingBeenReviewed.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'booking-123',
          rating: 5,
          comment: 'Great service!'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('This booking has already been reviewed');
    });

    it('should validate rating range', async () => {
      const { POST } = await import('@/app/api/reviews/submit/route');

      const request = new NextRequest('http://localhost:3000/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'booking-123',
          rating: 6, // Invalid rating
          comment: 'Great service!'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Rating must be between 1 and 5');
    });
  });

  describe('Payment API', () => {
    it('should create payment link for deposit', async () => {
      const { POST } = await import('@/app/api/payment/create-checkout-session/route');
      
      const mockPaymentLink = {
        id: 'payment-link-123',
        url: 'https://squareup.com/checkout/test',
        orderId: 'order-123'
      };

      const { createPaymentLink } = require('@/lib/services/square-service');
      const { updateBooking } = require('@/lib/services/booking-service');
      
      createPaymentLink.mockResolvedValue(mockPaymentLink);
      updateBooking.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'booking-123',
          amount: 3000, // $30.00 in cents
          currency: 'USD',
          description: 'Deposit for ride'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.paymentLinkUrl).toBe(mockPaymentLink.url);
    });

    it('should handle missing payment information', async () => {
      const { POST } = await import('@/app/api/payment/create-checkout-session/route');

      const request = new NextRequest('http://localhost:3000/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'booking-123'
          // Missing amount, currency, description
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required payment information');
    });
  });
}); 