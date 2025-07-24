import { validateBookingData } from '@/lib/validation/booking-validation';

describe('Booking Validation', () => {
  describe('validateBookingData', () => {
    test('validates complete booking data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      futureDate.setHours(10, 0, 0, 0);
      
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: futureDate.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects booking with missing name', () => {
      const bookingData = {
        name: '',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    test('rejects booking with invalid email', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'invalid-email',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('rejects booking with missing phone', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone is required');
    });

    test('rejects booking with missing pickup location', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: '',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pickup location is required');
    });

    test('rejects booking with missing dropoff location', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: '',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dropoff location is required');
    });

    test('rejects booking with past pickup time', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: pastDate.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pickup date must be in the future');
    });

    test('rejects booking with zero passengers', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 0
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 1 passenger is required');
    });

    test('rejects booking with too many passengers', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 15
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 10 passengers allowed');
    });

    test('rejects booking with missing pickup date', () => {
      const bookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '',
        passengers: 2
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pickup date and time is required');
    });

    test('returns multiple errors for invalid booking', () => {
      const bookingData = {
        name: '',
        email: 'invalid-email',
        phone: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: '',
        passengers: 0
      };

      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Phone is required');
    });
  });
}); 