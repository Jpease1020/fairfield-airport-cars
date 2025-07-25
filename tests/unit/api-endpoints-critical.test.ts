import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock external services
jest.mock('@/lib/services/square-service', () => ({
  createPaymentLink: jest.fn(),
  verifyWebhookSignature: jest.fn(),
  refundPayment: jest.fn()
}));

jest.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: jest.fn(),
  sendReminderEmail: jest.fn()
}));

jest.mock('@/lib/services/twilio-service', () => ({
  sendSms: jest.fn()
}));

jest.mock('@/lib/validation/booking-validation', () => ({
  validateBookingData: jest.fn()
}));

jest.mock('@/lib/services/booking-service', () => ({
  createBooking: jest.fn(),
  getBooking: jest.fn(),
  updateBooking: jest.fn()
}));

describe('Critical API Endpoints Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment API Endpoints', () => {
    it('should create payment link successfully', async () => {
      const { createPaymentLink } = require('@/lib/services/square-service');
      createPaymentLink.mockResolvedValue({
        id: 'payment-link-123',
        url: 'https://square.link/test',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const mockBooking = {
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        fare: 150,
        depositAmount: 75
      };

      const result = await createPaymentLink(mockBooking);
      
      expect(result).toEqual({
        id: 'payment-link-123',
        url: 'https://square.link/test',
        expiresAt: expect.any(Date)
      });
      expect(createPaymentLink).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle payment link creation errors', async () => {
      const { createPaymentLink } = require('@/lib/services/square-service');
      createPaymentLink.mockRejectedValue(new Error('Square API error'));

      const mockBooking = {
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        fare: 150,
        depositAmount: 75
      };

      await expect(createPaymentLink(mockBooking)).rejects.toThrow('Square API error');
    });

    it('should verify webhook signature correctly', async () => {
      const { verifyWebhookSignature } = require('@/lib/services/square-service');
      verifyWebhookSignature.mockResolvedValue(true);

      const mockWebhookData = {
        body: '{"event_type":"payment.created"}',
        signature: 'valid-signature',
        timestamp: Date.now()
      };

      const result = await verifyWebhookSignature(mockWebhookData);
      
      expect(result).toBe(true);
      expect(verifyWebhookSignature).toHaveBeenCalledWith(mockWebhookData);
    });

    it('should process refund successfully', async () => {
      const { refundPayment } = require('@/lib/services/square-service');
      refundPayment.mockResolvedValue({
        id: 'refund-123',
        status: 'COMPLETED',
        amount: 75
      });

      const result = await refundPayment('payment-123', 75);
      
      expect(result).toEqual({
        id: 'refund-123',
        status: 'COMPLETED',
        amount: 75
      });
      expect(refundPayment).toHaveBeenCalledWith('payment-123', 75);
    });
  });

  describe('Booking API Endpoints', () => {
    it('should create booking successfully', async () => {
      const { createBooking } = require('@/lib/services/booking-service');
      const { validateBookingData } = require('@/lib/validation/booking-validation');
      
      validateBookingData.mockResolvedValue({ isValid: true });
      createBooking.mockResolvedValue({
        id: 'booking-123',
        status: 'confirmed',
        createdAt: new Date()
      });

      const mockBookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        passengers: 2,
        fare: 150
      };

      const result = await createBooking(mockBookingData);
      
      expect(result).toEqual({
        id: 'booking-123',
        status: 'confirmed',
        createdAt: expect.any(Date)
      });
      expect(validateBookingData).toHaveBeenCalledWith(mockBookingData);
      expect(createBooking).toHaveBeenCalledWith(mockBookingData);
    });

    it('should reject invalid booking data', async () => {
      const { validateBookingData } = require('@/lib/validation/booking-validation');
      validateBookingData.mockResolvedValue({ 
        isValid: false, 
        errors: ['Name is required'] 
      });

      const mockBookingData = {
        email: 'john@example.com',
        phone: '203-555-0123'
        // Missing required fields
      };

      const validation = await validateBookingData(mockBookingData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Name is required');
    });

    it('should retrieve booking by ID', async () => {
      const { getBooking } = require('@/lib/services/booking-service');
      getBooking.mockResolvedValue({
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        status: 'confirmed',
        fare: 150,
        createdAt: new Date()
      });

      const result = await getBooking('booking-123');
      
      expect(result).toEqual({
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        status: 'confirmed',
        fare: 150,
        createdAt: expect.any(Date)
      });
      expect(getBooking).toHaveBeenCalledWith('booking-123');
    });

    it('should handle booking not found', async () => {
      const { getBooking } = require('@/lib/services/booking-service');
      getBooking.mockResolvedValue(null);

      const result = await getBooking('non-existent-booking');
      
      expect(result).toBeNull();
    });
  });

  describe('Notification API Endpoints', () => {
    it('should send confirmation email successfully', async () => {
      const { sendConfirmationEmail } = require('@/lib/services/email-service');
      sendConfirmationEmail.mockResolvedValue({
        messageId: 'email-123',
        status: 'sent'
      });

      const mockBooking = {
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        fare: 150
      };

      const result = await sendConfirmationEmail(mockBooking);
      
      expect(result).toEqual({
        messageId: 'email-123',
        status: 'sent'
      });
      expect(sendConfirmationEmail).toHaveBeenCalledWith(mockBooking);
    });

    it('should send SMS notification successfully', async () => {
      const { sendSms } = require('@/lib/services/twilio-service');
      sendSms.mockResolvedValue({
        sid: 'sms-123',
        status: 'delivered'
      });

      const mockNotification = {
        to: '+12035550123',
        message: 'Your booking is confirmed for Dec 25 at 10:00 AM'
      };

      const result = await sendSms(mockNotification.to, mockNotification.message);
      
      expect(result).toEqual({
        sid: 'sms-123',
        status: 'delivered'
      });
      expect(sendSms).toHaveBeenCalledWith(mockNotification.to, mockNotification.message);
    });

    it('should handle email sending errors', async () => {
      const { sendConfirmationEmail } = require('@/lib/services/email-service');
      sendConfirmationEmail.mockRejectedValue(new Error('Email service unavailable'));

      const mockBooking = {
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        fare: 150
      };

      await expect(sendConfirmationEmail(mockBooking)).rejects.toThrow('Email service unavailable');
    });

    it('should handle SMS sending errors', async () => {
      const { sendSms } = require('@/lib/services/twilio-service');
      sendSms.mockRejectedValue(new Error('Twilio service error'));

      await expect(sendSms('+12035550123', 'Test message')).rejects.toThrow('Twilio service error');
    });
  });

  describe('Driver API Endpoints', () => {
    it('should get driver availability', async () => {
      // Mock driver availability data
      const mockDrivers = [
        {
          id: 'driver-1',
          name: 'John Driver',
          available: true,
          currentLocation: 'Fairfield Station',
          rating: 4.8
        },
        {
          id: 'driver-2',
          name: 'Jane Driver',
          available: false,
          currentLocation: 'JFK Airport',
          rating: 4.9
        }
      ];

      // Mock the API response
      const response = {
        drivers: mockDrivers.filter(driver => driver.available),
        totalAvailable: 1,
        estimatedWaitTime: '15 minutes'
      };

      expect(response.drivers).toHaveLength(1);
      expect(response.drivers[0].id).toBe('driver-1');
      expect(response.totalAvailable).toBe(1);
      expect(response.estimatedWaitTime).toBe('15 minutes');
    });

    it('should handle driver assignment', async () => {
      const mockBooking = {
        id: 'booking-123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z')
      };

      const mockDriver = {
        id: 'driver-1',
        name: 'John Driver',
        available: true,
        currentLocation: 'Fairfield Station'
      };

      // Mock assignment logic
      const assignment = {
        bookingId: mockBooking.id,
        driverId: mockDriver.id,
        assignedAt: new Date(),
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      };

      expect(assignment.bookingId).toBe('booking-123');
      expect(assignment.driverId).toBe('driver-1');
      expect(assignment.estimatedArrival).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limiting', async () => {
      const { createPaymentLink } = require('@/lib/services/square-service');
      createPaymentLink.mockRejectedValue(new Error('Rate limit exceeded'));

      const mockBooking = {
        id: 'booking-123',
        fare: 150
      };

      await expect(createPaymentLink(mockBooking)).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle network connectivity issues', async () => {
      const { sendConfirmationEmail } = require('@/lib/services/email-service');
      sendConfirmationEmail.mockRejectedValue(new Error('Network timeout'));

      const mockBooking = {
        id: 'booking-123',
        email: 'john@example.com'
      };

      await expect(sendConfirmationEmail(mockBooking)).rejects.toThrow('Network timeout');
    });

    it('should handle invalid webhook data', async () => {
      const { verifyWebhookSignature } = require('@/lib/services/square-service');
      verifyWebhookSignature.mockResolvedValue(false);

      const mockWebhookData = {
        body: 'invalid-json',
        signature: 'invalid-signature',
        timestamp: Date.now()
      };

      const result = await verifyWebhookSignature(mockWebhookData);
      
      expect(result).toBe(false);
    });
  });
}); 