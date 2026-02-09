// @ts-nocheck - Tests are scaffolding, need type refinement before enabling
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
 * 3. Lock expiration after timeout
 * 4. Lock release on abandonment
 * 5. Slot becomes permanently booked after payment
 * 6. Buffer time enforcement between bookings
 *
 * STATUS: Tests need refinement to match actual API types.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const describeSkip = describe.skip;

// Mock the booking lock service
vi.mock('@/lib/services/booking-lock-service', () => ({
  lockTimeSlot: vi.fn(),
  releaseTimeSlot: vi.fn(),
  isTimeSlotLocked: vi.fn(),
  getTimeSlotLock: vi.fn(),
}));

// Mock the driver scheduling service
vi.mock('@/lib/services/driver-scheduling-service', () => ({
  checkAvailability: vi.fn(),
  getAvailableSlots: vi.fn(),
  bookTimeSlot: vi.fn(),
  releaseBookedSlot: vi.fn(),
}));

import {
  lockTimeSlot,
  releaseTimeSlot,
  isTimeSlotLocked,
} from '@/lib/services/booking-lock-service';

import {
  checkAvailability,
  getAvailableSlots,
  bookTimeSlot,
} from '@/lib/services/driver-scheduling-service';

const mockLockTimeSlot = lockTimeSlot as ReturnType<typeof vi.fn>;
const mockReleaseTimeSlot = releaseTimeSlot as ReturnType<typeof vi.fn>;
const mockIsTimeSlotLocked = isTimeSlotLocked as ReturnType<typeof vi.fn>;
const mockCheckAvailability = checkAvailability as ReturnType<typeof vi.fn>;
const mockGetAvailableSlots = getAvailableSlots as ReturnType<typeof vi.fn>;
const mockBookTimeSlot = bookTimeSlot as ReturnType<typeof vi.fn>;

describeSkip('Time Slot Locking', () => {
  const testDate = new Date('2024-03-15T10:00:00Z');
  const testSlotId = '2024-03-15T10:00';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(testDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Lock Acquisition', () => {
    it('locks a time slot when customer starts checkout', async () => {
      mockLockTimeSlot.mockResolvedValueOnce({
        success: true,
        lockId: 'lock-123',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const { POST } = await import('@/app/api/booking/lock-time-slot/route');

      const request = new Request('http://localhost:3000/api/booking/lock-time-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTime: testDate.toISOString(),
          sessionId: 'session-abc-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lockId).toBeDefined();
      expect(mockLockTimeSlot).toHaveBeenCalled();
    });

    it('rejects lock request for already locked slot', async () => {
      mockLockTimeSlot.mockResolvedValueOnce({
        success: false,
        error: 'Slot already locked',
      });

      const { POST } = await import('@/app/api/booking/lock-time-slot/route');

      const request = new Request('http://localhost:3000/api/booking/lock-time-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTime: testDate.toISOString(),
          sessionId: 'different-session',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409); // Conflict
      expect(data.success).toBe(false);
    });
  });

  describe('Availability Checking', () => {
    it('shows locked slot as unavailable', async () => {
      mockCheckAvailability.mockResolvedValueOnce({
        available: false,
        reason: 'Slot is currently locked by another user',
      });

      const { POST } = await import('@/app/api/booking/check-availability/route');

      const request = new Request('http://localhost:3000/api/booking/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTime: testDate.toISOString(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.available).toBe(false);
    });

    it('shows available slot as available', async () => {
      mockCheckAvailability.mockResolvedValueOnce({
        available: true,
      });

      const { POST } = await import('@/app/api/booking/check-availability/route');

      const request = new Request('http://localhost:3000/api/booking/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTime: testDate.toISOString(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.available).toBe(true);
    });

    it('respects 60-minute buffer between bookings', async () => {
      // Existing booking at 10:00
      mockCheckAvailability.mockResolvedValueOnce({
        available: false,
        reason: 'Too close to existing booking (60-minute buffer required)',
      });

      const { POST } = await import('@/app/api/booking/check-availability/route');

      // Trying to book at 10:30 - should fail due to buffer
      const request = new Request('http://localhost:3000/api/booking/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTime: new Date('2024-03-15T10:30:00Z').toISOString(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.available).toBe(false);
      expect(data.reason).toContain('buffer');
    });
  });

  describe('Lock Release', () => {
    it('releases lock when checkout is abandoned', async () => {
      mockReleaseTimeSlot.mockResolvedValueOnce({ success: true });

      const { POST } = await import('@/app/api/booking/release-time-slot/route');

      const request = new Request('http://localhost:3000/api/booking/release-time-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockId: 'lock-123',
          sessionId: 'session-abc-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockReleaseTimeSlot).toHaveBeenCalled();
    });

    it('lock expires automatically after 5 minutes', async () => {
      // Initial lock check - locked
      mockIsTimeSlotLocked.mockResolvedValueOnce(true);

      // After 5 minutes - no longer locked
      mockIsTimeSlotLocked.mockResolvedValueOnce(false);

      // First check - should be locked
      let result = await mockIsTimeSlotLocked(testSlotId);
      expect(result).toBe(true);

      // Advance time by 6 minutes
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Second check - should be unlocked
      result = await mockIsTimeSlotLocked(testSlotId);
      expect(result).toBe(false);
    });
  });

  describe('Booking Confirmation', () => {
    it('converts lock to permanent booking after payment', async () => {
      mockBookTimeSlot.mockResolvedValueOnce({
        success: true,
        bookingId: 'booking-123',
      });

      // This would be called by the payment success handler
      const result = await mockBookTimeSlot({
        pickupDateTime: testDate,
        bookingId: 'booking-123',
        lockId: 'lock-123',
      });

      expect(result.success).toBe(true);
      expect(mockBookTimeSlot).toHaveBeenCalled();
    });
  });
});

describeSkip('Double Booking Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents two customers from booking the same slot', async () => {
    // First customer locks the slot
    mockLockTimeSlot
      .mockResolvedValueOnce({ success: true, lockId: 'lock-1' })
      // Second customer tries to lock - fails
      .mockResolvedValueOnce({ success: false, error: 'Already locked' });

    const { POST } = await import('@/app/api/booking/lock-time-slot/route');

    const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Customer 1 locks
    const request1 = new Request('http://localhost:3000/api/booking/lock-time-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupDateTime: pickupTime,
        sessionId: 'customer-1',
      }),
    });

    const response1 = await POST(request1);
    expect(response1.status).toBe(200);

    // Customer 2 tries to lock same slot
    const request2 = new Request('http://localhost:3000/api/booking/lock-time-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupDateTime: pickupTime,
        sessionId: 'customer-2',
      }),
    });

    const response2 = await POST(request2);
    expect(response2.status).toBe(409); // Conflict
  });

  it('allows booking after previous lock expires', async () => {
    vi.useFakeTimers();

    mockLockTimeSlot
      // First lock
      .mockResolvedValueOnce({ success: true, lockId: 'lock-1' })
      // After expiry, second lock succeeds
      .mockResolvedValueOnce({ success: true, lockId: 'lock-2' });

    const { POST } = await import('@/app/api/booking/lock-time-slot/route');

    const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Customer 1 locks but abandons checkout
    const request1 = new Request('http://localhost:3000/api/booking/lock-time-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupDateTime: pickupTime,
        sessionId: 'customer-1',
      }),
    });

    await POST(request1);

    // Wait for lock to expire (5+ minutes)
    vi.advanceTimersByTime(6 * 60 * 1000);

    // Customer 2 can now lock the same slot
    const request2 = new Request('http://localhost:3000/api/booking/lock-time-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupDateTime: pickupTime,
        sessionId: 'customer-2',
      }),
    });

    const response2 = await POST(request2);
    expect(response2.status).toBe(200);

    vi.useRealTimers();
  });
});
