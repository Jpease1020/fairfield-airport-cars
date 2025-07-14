import { Booking } from '@/types/booking';

// Mock booking data for testing
export const mockBooking: Booking = {
  id: 'test-booking-id',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-123-4567',
  pickupLocation: 'Fairfield Station',
  dropoffLocation: 'JFK Airport',
  pickupDateTime: new Date('2024-12-25T10:00:00Z'),
  flightNumber: 'AA123',
  passengers: 2,
  notes: 'Test booking for visual testing',
  status: 'pending',
  fare: 150.00,
  depositPaid: false,
  balanceDue: 75.00,
  depositAmount: 75.00,
  createdAt: new Date('2024-12-20T10:00:00Z'),
  updatedAt: new Date('2024-12-20T10:00:00Z'),
};

// Mock the getBooking function
export const mockGetBooking = async (id: string): Promise<Booking | null> => {
  if (id === 'test-booking-id') {
    return mockBooking;
  }
  return null;
};

// Mock the booking service module
export const mockBookingService = {
  getBooking: mockGetBooking,
  createBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return 'test-booking-id';
  },
  updateBooking: async (id: string, updates: Partial<Booking>): Promise<void> => {
    // Mock implementation
  },
  deleteBooking: async (id: string): Promise<void> => {
    // Mock implementation
  },
  listBookings: async (): Promise<Booking[]> => {
    return [mockBooking];
  },
  isTimeSlotAvailable: async (pickupDate: Date, bufferMinutes = 60): Promise<boolean> => {
    return true;
  },
}; 