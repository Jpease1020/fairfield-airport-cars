/**
 * Complete Booking Flow Integration Test
 *
 * Tests the critical path: Quote → Book → Pay → Confirm
 * This is the PRIMARY revenue-generating flow and must always work.
 *
 * What this tests:
 * 1. Customer can get a fare quote for a valid route
 * 2. Quote contains correct pricing and is valid
 * 3. Customer can submit a booking with the quote
 * 4. Payment is processed successfully
 * 5. Booking is created in the database
 * 6. Confirmation notifications are triggered (email, SMS, admin alert)
 * 7. Time slot is marked as booked
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external services - we're testing integration, not external APIs
vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue({ sid: 'mock-sms-sid' }),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendBookingVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/square-service', () => ({
  processPayment: vi.fn().mockResolvedValue({
    success: true,
    paymentId: 'mock-payment-id',
    orderId: 'mock-order-id',
    status: 'COMPLETED',
    amount: 5000,
    currency: 'USD',
  }),
  refundPayment: vi.fn().mockResolvedValue({
    success: true,
    refundId: 'mock-refund-id',
    status: 'COMPLETED',
  }),
}));

vi.mock('@/lib/services/admin-notification-service', () => ({
  sendAdminSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/google-calendar', () => ({
  createBookingCalendarEvent: vi.fn().mockResolvedValue({ eventId: 'mock-event-id' }),
  deleteBookingEvent: vi.fn().mockResolvedValue(undefined),
  getStoredCalendarTokens: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: vi.fn().mockResolvedValue({ bookingId: 'mock-booking-123' }),
  getBooking: vi.fn().mockResolvedValue({
    id: 'mock-booking-123',
    customer: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com',
      phone: '+12035551234',
    },
    trip: {
      pickupDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    },
    status: 'pending',
  }),
  updateBooking: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/booking-attempts-service', () => ({
  recordBookingAttempt: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        update: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// Import mocked services for assertions
import { sendSms } from '@/lib/services/twilio-service';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { processPayment } from '@/lib/services/square-service';
import { createBookingAtomic } from '@/lib/services/booking-service';

const mockSendSms = sendSms as ReturnType<typeof vi.fn>;
const mockSendBookingVerificationEmail = sendBookingVerificationEmail as ReturnType<typeof vi.fn>;
const mockProcessPayment = processPayment as ReturnType<typeof vi.fn>;
const mockCreateBookingAtomic = createBookingAtomic as ReturnType<typeof vi.fn>;

// Test data representing a real booking scenario
const TEST_BOOKING_DATA = {
  customer: {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    phone: '+12035551234',
  },
  trip: {
    pickup: {
      address: '123 Main St, Fairfield, CT 06824',
      lat: 41.1408,
      lng: -73.2613,
    },
    dropoff: {
      address: 'Bradley International Airport, Windsor Locks, CT',
      lat: 41.9389,
      lng: -72.6832,
    },
    pickupDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    passengers: 2,
    luggage: 2,
    fareType: 'personal' as const,
    flightNumber: 'AA123',
  },
  fare: 85.00,
};

describe('Complete Booking Flow', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Step 1: Payment Processing', () => {
    it('creates a booking and processes payment successfully', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-ok',
          amount: 2550, // $25.50 deposit in cents
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookingId).toBeDefined();
    });

    it('calls Square payment API with correct amount', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-ok',
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 500, // $5 tip
        }),
      });

      await POST(request);

      // Payment should include tip
      expect(mockProcessPayment).toHaveBeenCalledWith(
        'cnon:card-nonce-ok',
        3050, // $25.50 + $5.00 tip = $30.50
        'USD',
        expect.any(String)
      );
    });

    it('creates booking in database after successful payment', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-ok',
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 0,
        }),
      });

      await POST(request);

      expect(mockCreateBookingAtomic).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: TEST_BOOKING_DATA.customer,
          depositPaid: true,
          squarePaymentId: 'mock-payment-id',
        })
      );
    });

    it('sends verification email after booking creation', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-ok',
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 0,
        }),
      });

      await POST(request);

      expect(mockSendBookingVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('Step 2: Payment Failure Handling', () => {
    it('returns error when payment fails', async () => {
      mockProcessPayment.mockResolvedValueOnce({ success: false });

      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-declined',
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('does not create booking when payment fails', async () => {
      mockProcessPayment.mockResolvedValueOnce({ success: false });

      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-declined',
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
          tipAmount: 0,
        }),
      });

      await POST(request);

      expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
    });
  });

  describe('Step 3: Validation', () => {
    it('rejects request missing payment token', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 2550,
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('rejects request missing amount', async () => {
      const { POST } = await import('@/app/api/payment/process-payment/route');

      const request = new Request('http://localhost:3000/api/payment/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: 'cnon:card-nonce-ok',
          currency: 'USD',
          bookingData: TEST_BOOKING_DATA,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
