import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock external services
jest.mock('@/lib/services/booking-service', () => ({
  createBooking: jest.fn(),
  getBooking: jest.fn(),
  updateBooking: jest.fn(),
  deleteBooking: jest.fn()
}));

jest.mock('@/lib/services/payment-service', () => ({
  createPaymentLink: jest.fn(),
  processPayment: jest.fn()
}));

jest.mock('@/lib/services/notification-service', () => ({
  sendBookingConfirmation: jest.fn(),
  sendBookingReminder: jest.fn()
}));

describe('Booking API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/booking', () => {
    it('creates booking with valid data', async () => {
      const { createBooking } = require('@/lib/services/booking-service');
      const { createPaymentLink } = require('@/lib/services/payment-service');
      const { sendBookingConfirmation } = require('@/lib/services/notification-service');

      const mockBookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2,
        fare: 150
      };

      createBooking.mockResolvedValue({
        id: 'booking-123',
        status: 'pending',
        ...mockBookingData
      });

      createPaymentLink.mockResolvedValue({
        id: 'payment-link-123',
        url: 'https://square.link/test'
      });

      sendBookingConfirmation.mockResolvedValue({ success: true });

      // Simulate API call
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBookingData)
      });

      expect(response.ok).toBe(true);
      expect(createBooking).toHaveBeenCalledWith(mockBookingData);
      expect(createPaymentLink).toHaveBeenCalled();
      expect(sendBookingConfirmation).toHaveBeenCalled();
    });

    it('validates booking data before creation', async () => {
      const { createBooking } = require('@/lib/services/booking-service');

      const invalidBookingData = {
        name: '', // Missing required field
        email: 'invalid-email',
        phone: '123', // Too short
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: '2024-01-01T00:00', // Past date
        passengers: 0, // Invalid
        fare: -50 // Negative fare
      };

      createBooking.mockRejectedValue(new Error('Validation failed'));

      // Simulate API call
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBookingData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('handles booking creation errors gracefully', async () => {
      const { createBooking } = require('@/lib/services/booking-service');

      const mockBookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2,
        fare: 150
      };

      createBooking.mockRejectedValue(new Error('Database connection failed'));

      // Simulate API call
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBookingData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/booking/[id]', () => {
    it('retrieves booking by ID', async () => {
      const { getBooking } = require('@/lib/services/booking-service');

      const mockBooking = {
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        status: 'confirmed',
        fare: 150
      };

      getBooking.mockResolvedValue(mockBooking);

      // Simulate API call
      const response = await fetch('/api/booking/booking-123');
      
      expect(response.ok).toBe(true);
      expect(getBooking).toHaveBeenCalledWith('booking-123');
    });

    it('handles booking not found', async () => {
      const { getBooking } = require('@/lib/services/booking-service');

      getBooking.mockResolvedValue(null);

      // Simulate API call
      const response = await fetch('/api/booking/nonexistent-booking');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/booking/[id]', () => {
    it('updates booking status', async () => {
      const { updateBooking } = require('@/lib/services/booking-service');

      const updateData = {
        status: 'confirmed',
        driverAssigned: 'Driver John',
        estimatedPickupTime: '2024-12-25T09:45'
      };

      updateBooking.mockResolvedValue({
        id: 'booking-123',
        ...updateData
      });

      // Simulate API call
      const response = await fetch('/api/booking/booking-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      expect(response.ok).toBe(true);
      expect(updateBooking).toHaveBeenCalledWith('booking-123', updateData);
    });

    it('validates update data', async () => {
      const { updateBooking } = require('@/lib/services/booking-service');

      const invalidUpdateData = {
        status: 'invalid-status',
        driverAssigned: '', // Empty driver name
        estimatedPickupTime: 'invalid-date'
      };

      updateBooking.mockRejectedValue(new Error('Invalid update data'));

      // Simulate API call
      const response = await fetch('/api/booking/booking-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdateData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/booking/[id]', () => {
    it('cancels booking successfully', async () => {
      const { deleteBooking } = require('@/lib/services/booking-service');

      deleteBooking.mockResolvedValue({ success: true });

      // Simulate API call
      const response = await fetch('/api/booking/booking-123', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
      expect(deleteBooking).toHaveBeenCalledWith('booking-123');
    });

    it('handles cancellation errors', async () => {
      const { deleteBooking } = require('@/lib/services/booking-service');

      deleteBooking.mockRejectedValue(new Error('Cannot cancel confirmed booking'));

      // Simulate API call
      const response = await fetch('/api/booking/booking-123', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/booking/estimate-fare', () => {
    it('estimates fare for trip', async () => {
      const mockFareData = {
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        passengers: 2,
        fare: 150
      };

      // Simulate API call
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockFareData)
      });

      expect(response.ok).toBe(true);
    });

    it('handles fare estimation errors', async () => {
      const invalidFareData = {
        pickupLocation: '',
        dropoffLocation: '',
        passengers: 0
      };

      // Simulate API call
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidFareData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
}); 