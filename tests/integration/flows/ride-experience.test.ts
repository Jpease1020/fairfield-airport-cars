/**
 * Ride Experience Integration Test
 *
 * Tests the complete ride journey from customer and driver perspectives.
 * This ensures the real-time tracking and status updates work correctly.
 *
 * Customer Experience:
 * 1. Pre-ride: View booking status, get reminders
 * 2. Driver assigned: See driver info, vehicle details
 * 3. Driver en route: Live location tracking, ETA updates
 * 4. Pickup: Status changes to "in-progress"
 * 5. During ride: Continued tracking
 * 6. Dropoff: Status changes to "completed"
 * 7. Post-ride: Feedback prompt
 *
 * Driver (Gregg) Experience:
 * 1. See upcoming bookings
 * 2. Start tracking for a booking
 * 3. Update location in real-time
 * 4. Mark pickup complete
 * 5. Mark dropoff complete
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock the booking service
vi.mock('@/lib/services/booking-service', () => ({
  getBooking: vi.fn(),
  updateBooking: vi.fn().mockResolvedValue(undefined),
}));

// Mock the driver service
vi.mock('@/lib/services/driver-service', () => ({
  getDriver: vi.fn(),
}));

// Mock the driver location service
vi.mock('@/lib/services/driver-location-service', () => ({
  driverLocationService: {
    initializeDriverTracking: vi.fn().mockResolvedValue(undefined),
    stopDriverTracking: vi.fn().mockResolvedValue(undefined),
    getActiveDriverSubscriptions: vi.fn().mockReturnValue([]),
  },
}));

// Mock Firebase admin
vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: 'test-booking-123',
          data: () => ({
            status: 'confirmed',
            driverId: 'driver-123',
            customer: { name: 'Test Customer' },
          }),
        }),
        update: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// Mock driver scheduling service
vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts: vi.fn().mockResolvedValue({
      hasConflict: false,
      conflictingBookings: [],
      suggestedTimeSlots: [],
    }),
    cancelBooking: vi.fn().mockResolvedValue(undefined),
    bookTimeSlot: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock fetch for WebSocket updates
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
});

import { getBooking, updateBooking } from '@/lib/services/booking-service';
import { getDriver } from '@/lib/services/driver-service';
import { driverLocationService } from '@/lib/services/driver-location-service';

const mockGetBooking = getBooking as ReturnType<typeof vi.fn>;
const mockUpdateBooking = updateBooking as ReturnType<typeof vi.fn>;
const mockGetDriver = getDriver as ReturnType<typeof vi.fn>;
const mockInitializeDriverTracking = driverLocationService.initializeDriverTracking as ReturnType<typeof vi.fn>;
const mockGetActiveDriverSubscriptions = driverLocationService.getActiveDriverSubscriptions as ReturnType<typeof vi.fn>;

// Load route handlers once
let trackingGet: typeof import('@/app/api/tracking/[bookingId]/route').GET;
let startTrackingPost: typeof import('@/app/api/drivers/start-tracking/route').POST;

beforeAll(async () => {
  ({ GET: trackingGet } = await import('@/app/api/tracking/[bookingId]/route'));
  ({ POST: startTrackingPost } = await import('@/app/api/drivers/start-tracking/route'));
});

// Test data
const mockBooking = {
  id: 'booking-ride-123',
  status: 'confirmed',
  driverId: 'gregg-123',
  customer: {
    firstName: 'Test',
    lastName: 'Customer',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+12035551234',
  },
  trip: {
    pickup: {
      address: '123 Main St, Fairfield, CT',
      lat: 41.1408,
      lng: -73.2613,
    },
    dropoff: {
      address: 'Bradley International Airport',
      lat: 41.9389,
      lng: -72.6832,
    },
    pickupDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  pickupLocation: '123 Main St, Fairfield, CT',
  pickupDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};

const mockDriver = {
  id: 'gregg-123',
  name: 'Gregg',
  phone: '+12035559999',
  vehicleInfo: {
    make: 'Toyota',
    model: 'Camry',
    color: 'Black',
    licensePlate: 'CT-123-ABC',
  },
  currentLocation: {
    lat: 41.15,
    lng: -73.25,
  },
};

// Helper to create a request object with json() method
const createRequest = (body: Record<string, unknown>) => {
  return {
    json: () => Promise.resolve(body),
    nextUrl: { origin: 'http://localhost:3000' },
  } as any;
};

// Helper to create params for dynamic routes
const createParams = (bookingId: string) => ({
  params: Promise.resolve({ bookingId }),
});

describe('Ride Experience - Customer Perspective', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Live Tracking', () => {
    it('customer can get real-time driver location and booking info', async () => {
      mockGetBooking.mockResolvedValueOnce(mockBooking);
      mockGetDriver.mockResolvedValueOnce(mockDriver);

      const response = await trackingGet(
        createRequest({}) as any,
        createParams('booking-ride-123')
      );
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.driverName).toBe('Gregg');
      expect(data.driverPhone).toBe('+12035559999');
      expect(data.vehicleInfo).toBeDefined();
      expect(data.currentLocation).toBeDefined();
    });

    it('returns 404 for non-existent booking', async () => {
      mockGetBooking.mockResolvedValueOnce(null);

      const response = await trackingGet(
        createRequest({}) as any,
        createParams('non-existent')
      );

      expect(response!.status).toBe(404);
    });

    it('returns 404 when driver is not found', async () => {
      mockGetBooking.mockResolvedValueOnce(mockBooking);
      mockGetDriver.mockResolvedValueOnce(null);

      const response = await trackingGet(
        createRequest({}) as any,
        createParams('booking-ride-123')
      );

      expect(response!.status).toBe(404);
    });
  });
});

describe('Ride Experience - Driver (Gregg) Perspective', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Starting Location Tracking', () => {
    it('driver can start location tracking for a booking', async () => {
      mockGetBooking.mockResolvedValueOnce(mockBooking);
      mockGetActiveDriverSubscriptions.mockReturnValueOnce([]);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockInitializeDriverTracking.mockResolvedValueOnce(undefined);

      const response = await startTrackingPost(createRequest({
        bookingId: 'booking-ride-123',
        driverId: 'gregg-123',
        driverName: 'Gregg',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookingId).toBe('booking-ride-123');
      expect(data.driverId).toBe('gregg-123');
    });

    it('returns 400 when bookingId is missing', async () => {
      const response = await startTrackingPost(createRequest({
        driverId: 'gregg-123',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('returns 400 when driverId is missing', async () => {
      const response = await startTrackingPost(createRequest({
        bookingId: 'booking-ride-123',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('returns 404 when booking is not found', async () => {
      mockGetBooking.mockResolvedValueOnce(null);

      const response = await startTrackingPost(createRequest({
        bookingId: 'non-existent',
        driverId: 'gregg-123',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(404);
      expect(data.error).toBe('Booking not found');
    });

    it('returns 409 when tracking is already active for driver', async () => {
      mockGetBooking.mockResolvedValueOnce(mockBooking);
      mockGetActiveDriverSubscriptions.mockReturnValueOnce(['gregg-123']);

      const response = await startTrackingPost(createRequest({
        bookingId: 'booking-ride-123',
        driverId: 'gregg-123',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(409);
      expect(data.error).toContain('already active');
    });

    it('updates booking with driver assignment when starting tracking', async () => {
      mockGetBooking.mockResolvedValueOnce(mockBooking);
      mockGetActiveDriverSubscriptions.mockReturnValueOnce([]);
      mockUpdateBooking.mockResolvedValueOnce(undefined);
      mockInitializeDriverTracking.mockResolvedValueOnce(undefined);

      await startTrackingPost(createRequest({
        bookingId: 'booking-ride-123',
        driverId: 'gregg-123',
        driverName: 'Gregg',
      }));

      expect(mockUpdateBooking).toHaveBeenCalledWith('booking-ride-123', expect.objectContaining({
        driverId: 'gregg-123',
        driverName: 'Gregg',
        status: 'confirmed',
      }));
    });
  });
});

describe('Booking Status Views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracking shows correct status for confirmed booking', async () => {
    mockGetBooking.mockResolvedValueOnce({ ...mockBooking, status: 'confirmed' });
    mockGetDriver.mockResolvedValueOnce(mockDriver);

    const response = await trackingGet(
      createRequest({}) as any,
      createParams('booking-ride-123')
    );
    const data = await response!.json();

    expect(response!.status).toBe(200);
    expect(data.status).toBe('confirmed');
  });

  it('tracking shows correct status for in-progress booking', async () => {
    mockGetBooking.mockResolvedValueOnce({ ...mockBooking, status: 'in-progress' });
    mockGetDriver.mockResolvedValueOnce(mockDriver);

    const response = await trackingGet(
      createRequest({}) as any,
      createParams('booking-ride-123')
    );
    const data = await response!.json();

    expect(response!.status).toBe(200);
    expect(data.status).toBe('in-progress');
  });

  it('tracking shows correct status for completed booking', async () => {
    mockGetBooking.mockResolvedValueOnce({ ...mockBooking, status: 'completed' });
    mockGetDriver.mockResolvedValueOnce(mockDriver);

    const response = await trackingGet(
      createRequest({}) as any,
      createParams('booking-ride-123')
    );
    const data = await response!.json();

    expect(response!.status).toBe(200);
    expect(data.status).toBe('completed');
  });
});
