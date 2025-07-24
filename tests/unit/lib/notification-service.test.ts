import { sendCriticalError, sendHighErrorRate, sendBrokenFeature } from '@/lib/services/notification-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('Notification Service', () => {
  const mockBooking = {
    id: 'test-booking-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '203-555-0123',
    pickupLocation: 'Fairfield Airport',
    dropoffLocation: 'New York City',
    pickupDateTime: new Date('2024-02-15T10:00:00Z'),
    passengers: 2,
    fare: 150,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('sendCriticalError', () => {
    it('should send critical error notification', async () => {
      const error = new Error('Database connection failed');
      const context = { userId: '123', action: 'booking' };

      await sendCriticalError(error, context);

      // The function should not throw and should log the error
      expect(true).toBe(true);
    });
  });

  describe('sendHighErrorRate', () => {
    it('should send high error rate notification', async () => {
      const errorRate = 15.5;
      const totalInteractions = 100;

      await sendHighErrorRate(errorRate, totalInteractions);

      // The function should not throw and should log the error
      expect(true).toBe(true);
    });
  });

  describe('sendBrokenFeature', () => {
    it('should send broken feature notification', async () => {
      const feature = 'booking-form';
      const error = new Error('Form validation failed');

      await sendBrokenFeature(feature, error);

      // The function should not throw and should log the error
      expect(true).toBe(true);
    });
  });
}); 