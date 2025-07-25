import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the Square service
jest.mock('@/lib/services/square-service', () => ({
  createPaymentLink: jest.fn(),
  refundPayment: jest.fn(),
  verifyWebhookSignature: jest.fn()
}));

describe('Payment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Link Creation', () => {
    it('should create payment link successfully', async () => {
      const { createPaymentLink } = require('@/lib/services/square-service');
      
      const mockPaymentLink = {
        id: 'test-payment-link',
        url: 'https://checkout.square.com/test-link',
        orderId: 'test-order-id'
      };
      
      createPaymentLink.mockResolvedValue(mockPaymentLink);
      
      const result = await createPaymentLink({
        amount: 15000,
        currency: 'USD',
        bookingId: 'test-booking-123'
      });
      
      expect(result).toEqual(mockPaymentLink);
      expect(createPaymentLink).toHaveBeenCalledWith({
        amount: 15000,
        currency: 'USD',
        bookingId: 'test-booking-123'
      });
    });

    it('should handle payment link creation errors', async () => {
      const { createPaymentLink } = require('@/lib/services/square-service');
      
      createPaymentLink.mockRejectedValue(new Error('Payment service unavailable'));
      
      await expect(createPaymentLink({
        amount: 15000,
        currency: 'USD',
        bookingId: 'test-booking-123'
      })).rejects.toThrow('Payment service unavailable');
    });
  });

  describe('Payment Refund', () => {
    it('should process refund successfully', async () => {
      const { refundPayment } = require('@/lib/services/square-service');
      
      const mockRefund = {
        id: 'test-refund-id',
        amount: 15000,
        status: 'COMPLETED'
      };
      
      refundPayment.mockResolvedValue(mockRefund);
      
      const result = await refundPayment({
        paymentId: 'test-payment-id',
        amount: 15000,
        reason: 'Customer cancellation'
      });
      
      expect(result).toEqual(mockRefund);
      expect(refundPayment).toHaveBeenCalledWith({
        paymentId: 'test-payment-id',
        amount: 15000,
        reason: 'Customer cancellation'
      });
    });

    it('should handle refund errors', async () => {
      const { refundPayment } = require('@/lib/services/square-service');
      
      refundPayment.mockRejectedValue(new Error('Refund failed'));
      
      await expect(refundPayment({
        paymentId: 'test-payment-id',
        amount: 15000,
        reason: 'Customer cancellation'
      })).rejects.toThrow('Refund failed');
    });
  });

  describe('Webhook Verification', () => {
    it('should verify webhook signature successfully', async () => {
      const { verifyWebhookSignature } = require('@/lib/services/square-service');
      
      verifyWebhookSignature.mockReturnValue(true);
      
      const isValid = verifyWebhookSignature({
        body: 'test-body',
        signature: 'test-signature',
        timestamp: 'test-timestamp'
      });
      
      expect(isValid).toBe(true);
      expect(verifyWebhookSignature).toHaveBeenCalledWith({
        body: 'test-body',
        signature: 'test-signature',
        timestamp: 'test-timestamp'
      });
    });

    it('should reject invalid webhook signatures', async () => {
      const { verifyWebhookSignature } = require('@/lib/services/square-service');
      
      verifyWebhookSignature.mockReturnValue(false);
      
      const isValid = verifyWebhookSignature({
        body: 'test-body',
        signature: 'invalid-signature',
        timestamp: 'test-timestamp'
      });
      
      expect(isValid).toBe(false);
    });
  });
}); 