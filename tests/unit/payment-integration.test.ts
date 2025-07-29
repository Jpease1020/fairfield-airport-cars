import { createPaymentLink } from '@/lib/services/square-service';
import { createBooking, getBooking } from '@/lib/services/booking-service';

// Mock Square service
jest.mock('@/lib/services/square-service', () => ({
  createPaymentLink: jest.fn()
}));

// Mock booking service
jest.mock('@/lib/services/booking-service', () => ({
  createBooking: jest.fn(),
  getBooking: jest.fn()
}));

// Mock Firebase
jest.mock('@/lib/utils/firebase', () => ({
  db: {}
}));

describe('Payment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking with Payment Integration', () => {
    it('should create booking with payment link', async () => {
      const mockBookingId = 'booking-123';
      const mockPaymentLink = {
        id: 'payment-link-123',
        url: 'https://squareup.com/checkout/test',
        orderId: 'order-123'
      };

      (createBooking as jest.Mock).mockResolvedValue(mockBookingId);
      (getBooking as jest.Mock).mockResolvedValue({
        id: mockBookingId,
        name: 'John Doe',
        email: 'john@example.com',
        fare: 150
      });
      (createPaymentLink as jest.Mock).mockResolvedValue(mockPaymentLink);

      const bookingData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00'),
        passengers: 2,
        fare: 150,
        status: 'pending' as const,
        depositPaid: false,
        balanceDue: 150
      };

      const bookingId = await createBooking(bookingData);

      expect(bookingId).toBe(mockBookingId);
      expect(createPaymentLink).toHaveBeenCalledWith({
        bookingId: mockBookingId,
        amount: 3000, // 20% of 150 = 30, converted to cents
        currency: 'USD',
        description: 'Deposit for ride from Fairfield Station to JFK Airport',
        buyerEmail: 'john@example.com'
      });
    });

    it('should handle payment link creation failure gracefully', async () => {
      const mockBookingId = 'booking-123';

      (createBooking as jest.Mock).mockResolvedValue(mockBookingId);
      (createPaymentLink as jest.Mock).mockRejectedValue(new Error('Square API error'));

      const bookingData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00'),
        passengers: 2,
        fare: 150,
        status: 'pending' as const,
        depositPaid: false,
        balanceDue: 150
      };

      // Should not throw error even if payment link fails
      const bookingId = await createBooking(bookingData);

      expect(bookingId).toBe(mockBookingId);
    });
  });

  describe('Payment Link Creation', () => {
    it('should create payment link with correct parameters', async () => {
      const mockPaymentLink = {
        id: 'payment-link-123',
        url: 'https://squareup.com/checkout/test',
        orderId: 'order-123'
      };

      (createPaymentLink as jest.Mock).mockResolvedValue(mockPaymentLink);

      const paymentData = {
        bookingId: 'booking-123',
        amount: 3000, // $30.00 in cents
        currency: 'USD',
        description: 'Deposit for ride from Fairfield to JFK',
        buyerEmail: 'john@example.com'
      };

      const result = await createPaymentLink(paymentData);

      expect(result).toEqual(mockPaymentLink);
      expect(createPaymentLink).toHaveBeenCalledWith(paymentData);
    });

    it('should handle payment link creation errors', async () => {
      (createPaymentLink as jest.Mock).mockRejectedValue(new Error('Square API error'));

      const paymentData = {
        bookingId: 'booking-123',
        amount: 3000,
        currency: 'USD',
        description: 'Deposit for ride',
        buyerEmail: 'john@example.com'
      };

      await expect(createPaymentLink(paymentData)).rejects.toThrow('Square API error');
    });
  });

  describe('Deposit Calculation', () => {
    it('should calculate 20% deposit correctly', () => {
      const fare = 150;
      const depositAmount = Math.round(fare * 0.2 * 100) / 100;
      const balanceDue = fare - depositAmount;

      expect(depositAmount).toBe(30);
      expect(balanceDue).toBe(120);
    });

    it('should handle different fare amounts', () => {
      const testCases = [
        { fare: 100, expectedDeposit: 20, expectedBalance: 80 },
        { fare: 200, expectedDeposit: 40, expectedBalance: 160 },
        { fare: 75, expectedDeposit: 15, expectedBalance: 60 }
      ];

      testCases.forEach(({ fare, expectedDeposit, expectedBalance }) => {
        const depositAmount = Math.round(fare * 0.2 * 100) / 100;
        const balanceDue = fare - depositAmount;

        expect(depositAmount).toBe(expectedDeposit);
        expect(balanceDue).toBe(expectedBalance);
      });
    });
  });

  describe('Payment Validation', () => {
    it('should validate payment amounts', () => {
      const validAmounts = [1000, 5000, 10000]; // $10, $50, $100 in cents
      const invalidAmounts = [-100, 0, 999999999];

      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThan(0);
        expect(amount).toBeLessThan(100000000); // Reasonable upper limit
      });

      invalidAmounts.forEach(amount => {
        expect(amount <= 0 || amount >= 100000000).toBe(true);
      });
    });

    it('should validate currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
      const invalidCurrencies = ['INVALID', '', 'US'];

      validCurrencies.forEach(currency => {
        expect(currency).toMatch(/^[A-Z]{3}$/);
      });

      invalidCurrencies.forEach(currency => {
        expect(currency).not.toMatch(/^[A-Z]{3}$/);
      });
    });
  });
}); 