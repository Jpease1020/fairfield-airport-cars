/**
 * Time Slot Locking Integration Test
 *
 * Tests the critical double-booking prevention system.
 * This protects Gregg from accidentally accepting two rides at the same time.
 *
 * How it works:
 * 1. Customer starts checkout → time slot is locked for 5 minutes
 * 2. Other customers see that slot as unavailable
 * 3. If checkout completes → slot becomes booked
 * 4. If checkout abandoned → lock expires, slot becomes available again
 * 5. 60-minute buffer between bookings
 *
 * What this tests:
 * 1. Locking a time slot during checkout
 * 2. Locked slots show as unavailable to other users
 * 3. Lock release on abandonment
 * 4. Conflict detection for same slot
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

// Mock the booking lock service
vi.mock('@/lib/services/booking-lock-service', () => ({
  bookingLockService: {
    lockTimeSlot: vi.fn(),
    releaseTimeSlot: vi.fn(),
    isTimeSlotLocked: vi.fn(),
  },
}));

// Mock the driver scheduling service
vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts: vi.fn(),
    getAvailableDriversForTimeSlot: vi.fn(),
  },
}));

import { bookingLockService } from '@/lib/services/booking-lock-service';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';

const mockLockTimeSlot = bookingLockService.lockTimeSlot as ReturnType<typeof vi.fn>;
const mockReleaseTimeSlot = bookingLockService.releaseTimeSlot as ReturnType<typeof vi.fn>;
const mockIsTimeSlotLocked = bookingLockService.isTimeSlotLocked as ReturnType<typeof vi.fn>;
const mockCheckBookingConflicts = driverSchedulingService.checkBookingConflicts as ReturnType<typeof vi.fn>;
const mockGetAvailableDriversForTimeSlot = driverSchedulingService.getAvailableDriversForTimeSlot as ReturnType<typeof vi.fn>;

// Load route handlers once
let lockPost: typeof import('@/app/api/booking/lock-time-slot/route').POST;
let releasePost: typeof import('@/app/api/booking/release-time-slot/route').POST;
let checkAvailabilityPost: typeof import('@/app/api/booking/check-availability/route').POST;

beforeAll(async () => {
  ({ POST: lockPost } = await import('@/app/api/booking/lock-time-slot/route'));
  ({ POST: releasePost } = await import('@/app/api/booking/release-time-slot/route'));
  ({ POST: checkAvailabilityPost } = await import('@/app/api/booking/check-availability/route'));
});

// Helper to create a request object with json() method
const createRequest = (body: Record<string, unknown>) => {
  return {
    json: () => Promise.resolve(body),
  } as any;
};

describe('Time Slot Locking', () => {
  const testTimeSlot = '2024-03-15-10:00';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Lock Acquisition', () => {
    it('locks a time slot when customer starts checkout', async () => {
      mockLockTimeSlot.mockResolvedValueOnce(true);

      const response = await lockPost(createRequest({
        timeSlot: testTimeSlot,
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lockId).toBeDefined();
      expect(mockLockTimeSlot).toHaveBeenCalledWith(testTimeSlot, expect.any(String));
    });

    it('rejects lock request for already locked slot', async () => {
      mockLockTimeSlot.mockResolvedValueOnce(false);

      const response = await lockPost(createRequest({
        timeSlot: testTimeSlot,
      }));
      const data = await response!.json();

      expect(response!.status).toBe(409); // Conflict
      expect(data.success).toBe(false);
      expect(data.error).toContain('already locked');
    });

    it('returns 400 when timeSlot is missing', async () => {
      const response = await lockPost(createRequest({}));
      const data = await response!.json();

      expect(response!.status).toBe(400);
      expect(data.error).toBe('Time slot is required');
    });
  });

  describe('Lock Release', () => {
    it('releases lock when checkout is abandoned', async () => {
      mockReleaseTimeSlot.mockResolvedValueOnce(undefined);

      const response = await releasePost(createRequest({
        timeSlot: testTimeSlot,
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockReleaseTimeSlot).toHaveBeenCalledWith(testTimeSlot, 'any');
    });

    it('returns 400 when timeSlot is missing for release', async () => {
      const response = await releasePost(createRequest({}));
      const data = await response!.json();

      expect(response!.status).toBe(400);
      expect(data.error).toBe('Time slot is required');
    });
  });

  describe('Availability Checking', () => {
    it('shows slot as available when no conflicts exist', async () => {
      mockCheckBookingConflicts.mockResolvedValueOnce({
        hasConflict: false,
        conflictingBookings: [],
        suggestedTimeSlots: [],
      });
      mockGetAvailableDriversForTimeSlot.mockResolvedValueOnce([
        { id: 'driver-1', name: 'Gregg' },
      ]);

      const response = await checkAvailabilityPost(createRequest({
        date: '2024-03-15',
        startTime: '10:00',
        endTime: '11:00',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.isAvailable).toBe(true);
      expect(data.hasConflict).toBe(false);
      expect(data.availableDrivers).toBe(1);
    });

    it('shows slot as unavailable when there is a conflict', async () => {
      mockCheckBookingConflicts.mockResolvedValueOnce({
        hasConflict: true,
        conflictingBookings: [{
          bookingId: 'booking-123',
          customerName: 'John Doe',
          timeSlot: '10:00-11:00',
          driverName: 'Gregg',
        }],
        suggestedTimeSlots: ['11:30', '12:00'],
      });
      mockGetAvailableDriversForTimeSlot.mockResolvedValueOnce([]);

      const response = await checkAvailabilityPost(createRequest({
        date: '2024-03-15',
        startTime: '10:00',
        endTime: '11:00',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.isAvailable).toBe(false);
      expect(data.hasConflict).toBe(true);
      expect(data.conflictingBookings).toHaveLength(1);
      expect(data.suggestedTimeSlots).toContain('11:30');
    });

    it('shows slot as unavailable when no drivers are available', async () => {
      mockCheckBookingConflicts.mockResolvedValueOnce({
        hasConflict: false,
        conflictingBookings: [],
        suggestedTimeSlots: [],
      });
      mockGetAvailableDriversForTimeSlot.mockResolvedValueOnce([]);

      const response = await checkAvailabilityPost(createRequest({
        date: '2024-03-15',
        startTime: '10:00',
        endTime: '11:00',
      }));
      const data = await response!.json();

      expect(response!.status).toBe(200);
      expect(data.isAvailable).toBe(false);
      expect(data.availableDrivers).toBe(0);
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await checkAvailabilityPost(createRequest({
        date: '2024-03-15',
        // missing startTime and endTime
      }));
      const data = await response!.json();

      expect(response!.status).toBe(400);
      expect(data.error).toContain('required');
    });
  });
});

describe('Double Booking Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents two customers from locking the same slot', async () => {
    // First customer locks the slot
    mockLockTimeSlot
      .mockResolvedValueOnce(true)  // First lock succeeds
      .mockResolvedValueOnce(false); // Second lock fails

    // Customer 1 locks
    const response1 = await lockPost(createRequest({
      timeSlot: '2024-03-15-10:00',
    }));
    expect(response1!.status).toBe(200);

    // Customer 2 tries to lock same slot
    const response2 = await lockPost(createRequest({
      timeSlot: '2024-03-15-10:00',
    }));
    expect(response2!.status).toBe(409); // Conflict
  });

  it('allows booking after lock is released', async () => {
    mockReleaseTimeSlot.mockResolvedValueOnce(undefined);
    mockLockTimeSlot.mockResolvedValueOnce(true);

    // First, release any existing lock
    const releaseResponse = await releasePost(createRequest({
      timeSlot: '2024-03-15-10:00',
    }));
    expect(releaseResponse!.status).toBe(200);

    // Now a new customer can lock the slot
    const lockResponse = await lockPost(createRequest({
      timeSlot: '2024-03-15-10:00',
    }));
    expect(lockResponse!.status).toBe(200);
  });
});
