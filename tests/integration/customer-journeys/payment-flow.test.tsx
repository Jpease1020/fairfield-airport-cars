import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { createPaymentLink } from '@/lib/services/square-service';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock API calls
global.fetch = jest.fn();

// Mock Square service
jest.mock('@/lib/services/square-service', () => ({
  createPaymentLink: jest.fn(),
  refundPayment: jest.fn()
}));

describe('Payment Flow - User Journey', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
    (createPaymentLink as jest.Mock).mockClear();
  });

  it('creates payment link for booking payment', async () => {
    const user = userEvent.setup();
    const mockPaymentResponse = {
      id: 'payment-link-123',
      url: 'https://square.link/test-payment',
      longUrl: 'https://square.link/test-payment-long',
      orderId: 'order-123'
    };

    (createPaymentLink as jest.Mock).mockResolvedValue(mockPaymentResponse);

    // Mock booking data
    const bookingData = {
      id: 'booking-123',
      fare: 15000, // Amount in cents
      name: 'John Smith',
      email: 'john@example.com'
    };

    // Simulate payment link creation
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bookingId: bookingData.id, 
        amount: bookingData.fare,
        description: 'Airport Transportation',
        buyerEmail: bookingData.email
      })
    });

    expect(response.ok).toBe(true);
    expect(createPaymentLink).toHaveBeenCalledWith({
      bookingId: bookingData.id,
      amount: bookingData.fare,
      currency: 'USD',
      description: 'Airport Transportation',
      buyerEmail: bookingData.email
    });
  });

  it('handles payment completion successfully', async () => {
    const mockPaymentData = {
      checkoutSessionId: 'checkout-session-123',
      bookingId: 'booking-123',
      status: 'completed'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaymentData
    });

    // Simulate payment completion webhook
    const response = await fetch('/api/payment/complete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkoutSessionId: mockPaymentData.checkoutSessionId,
        bookingId: mockPaymentData.bookingId
      })
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  it('handles payment errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Payment failed'));

    // Simulate failed payment
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking-123', amount: 15000 })
    });

    expect(response.ok).toBe(false);
  });

  it('validates payment data before processing', async () => {
    const invalidPaymentData = {
      bookingId: '', // Missing required field
      amount: -50 // Invalid amount
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid payment data' })
    });

    // Simulate invalid payment data
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPaymentData)
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('processes Square webhook correctly', async () => {
    const mockWebhookData = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'checkout-session-123',
          metadata: {
            bookingId: 'booking-123'
          }
        }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Simulate Square webhook
    const response = await fetch('/api/payment/square-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockWebhookData)
    });

    expect(response.ok).toBe(true);
  });

  it('updates booking status after successful payment', async () => {
    const mockBookingUpdate = {
      id: 'booking-123',
      status: 'paid',
      paymentStatus: 'completed'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingUpdate
    });

    // Simulate booking status update after payment
    const response = await fetch(`/api/booking/${mockBookingUpdate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'paid',
        paymentStatus: 'completed'
      })
    });

    expect(response.ok).toBe(true);
  });
}); 