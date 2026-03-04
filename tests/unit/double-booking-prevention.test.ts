import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkBookingConflicts = vi.fn();
const getAvailableDriversForTimeSlot = vi.fn();
const generateTimeSlots = vi.fn(() => []);
const getScheduleDocId = vi.fn(() => 'schedule-doc-id');
const getAdminDb = vi.fn();

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts,
    getAvailableDriversForTimeSlot,
    generateTimeSlots,
    getScheduleDocId,
  },
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/utils/booking-id-generator', () => ({
  generateShortBookingId: vi.fn(() => 'booking_123'),
}));

const minimalValidBookingData: any = {
  trip: {
    pickup: { address: '123 Main St', coordinates: null },
    dropoff: { address: 'JFK Airport', coordinates: null },
    pickupDateTime: new Date('2026-03-05T10:00:00.000Z'),
    fare: 120,
    fareType: 'personal',
    flightInfo: { hasFlight: false, airline: '', flightNumber: '', arrivalTime: '', terminal: '' },
  },
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+12035551212',
    notes: '',
    saveInfoForFuture: false,
  },
  payment: {
    depositAmount: 20,
    balanceDue: 100,
    depositPaid: true,
    tipAmount: 0,
    tipPercent: 0,
    totalAmount: 120,
  },
};

describe('double booking prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const transaction = {
      get: vi.fn().mockResolvedValue({ exists: false }),
      set: vi.fn(),
    };

    const db = {
      collection: vi.fn(() => ({
        doc: vi.fn((id: string) => ({ id })),
      })),
      runTransaction: vi.fn(async (callback: (tx: any) => Promise<any>) => callback(transaction)),
    };

    getAdminDb.mockReturnValue(db);
  });

  it('createBookingAtomic rejects when driverSchedulingService reports a conflict', async () => {
    checkBookingConflicts.mockResolvedValue({ hasConflict: true, suggestedTimeSlots: ['11:00', '14:00'] });
    getAvailableDriversForTimeSlot.mockResolvedValue([]);

    const { createBookingAtomic } = await import('@/lib/services/booking-service');

    await expect(createBookingAtomic(minimalValidBookingData)).rejects.toThrow('Time slot conflicts');
    expect(checkBookingConflicts).toHaveBeenCalledTimes(1);
  });

  it('createBookingAtomic succeeds when no conflict exists', async () => {
    checkBookingConflicts.mockResolvedValue({ hasConflict: false, suggestedTimeSlots: [] });
    getAvailableDriversForTimeSlot.mockResolvedValue([]);

    const { createBookingAtomic } = await import('@/lib/services/booking-service');

    await expect(createBookingAtomic(minimalValidBookingData)).resolves.toEqual({ bookingId: 'booking_123' });
    expect(checkBookingConflicts).toHaveBeenCalledTimes(1);
  });
});
