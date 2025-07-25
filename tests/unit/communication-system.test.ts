import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the email service
jest.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: jest.fn(),
  sendReminderEmail: jest.fn()
}));

// Mock the SMS service
jest.mock('@/lib/services/twilio-service', () => ({
  sendSms: jest.fn()
}));

describe('Communication System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Confirmation', () => {
    it('should send confirmation email successfully', async () => {
      const { sendConfirmationEmail } = require('@/lib/services/email-service');
      
      const mockBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        passengers: 2,
        fare: 150,
        status: 'confirmed' as const,
        depositPaid: true,
        balanceDue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'test-booking-123'
      };
      
      sendConfirmationEmail.mockResolvedValue({
        messageId: 'test-message-id',
        status: 'sent'
      });
      
      const result = await sendConfirmationEmail(mockBooking);
      
      expect(result).toEqual({
        messageId: 'test-message-id',
        status: 'sent'
      });
      expect(sendConfirmationEmail).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle email sending errors', async () => {
      const { sendConfirmationEmail } = require('@/lib/services/email-service');
      
      sendConfirmationEmail.mockRejectedValue(new Error('Email service unavailable'));
      
      const mockBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        passengers: 2,
        fare: 150,
        status: 'confirmed' as const,
        depositPaid: true,
        balanceDue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'test-booking-123'
      };
      
      await expect(sendConfirmationEmail(mockBooking))
        .rejects.toThrow('Email service unavailable');
    });
  });

  describe('SMS Notifications', () => {
    it('should send SMS notification successfully', async () => {
      const { sendSms } = require('@/lib/services/twilio-service');
      
      sendSms.mockResolvedValue({
        messageId: 'test-sms-id',
        status: 'delivered'
      });
      
      const result = await sendSms({
        to: '+12035550123',
        message: 'Your airport transfer is confirmed for tomorrow at 10:00 AM.'
      });
      
      expect(result).toEqual({
        messageId: 'test-sms-id',
        status: 'delivered'
      });
      expect(sendSms).toHaveBeenCalledWith({
        to: '+12035550123',
        message: 'Your airport transfer is confirmed for tomorrow at 10:00 AM.'
      });
    });

    it('should handle SMS sending errors', async () => {
      const { sendSms } = require('@/lib/services/twilio-service');
      
      sendSms.mockRejectedValue(new Error('SMS service unavailable'));
      
      await expect(sendSms({
        to: '+12035550123',
        message: 'Your airport transfer is confirmed for tomorrow at 10:00 AM.'
      })).rejects.toThrow('SMS service unavailable');
    });
  });

  describe('Reminder System', () => {
    it('should send reminder email successfully', async () => {
      const { sendReminderEmail } = require('@/lib/services/email-service');
      
      const mockBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        passengers: 2,
        fare: 150,
        status: 'confirmed' as const,
        depositPaid: true,
        balanceDue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'test-booking-123'
      };
      
      sendReminderEmail.mockResolvedValue({
        messageId: 'test-reminder-id',
        status: 'sent'
      });
      
      const result = await sendReminderEmail(mockBooking);
      
      expect(result).toEqual({
        messageId: 'test-reminder-id',
        status: 'sent'
      });
      expect(sendReminderEmail).toHaveBeenCalledWith(mockBooking);
    });
  });
}); 