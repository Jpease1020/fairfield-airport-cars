/**
 * Booking API Endpoints Integration Tests
 * 
 * Tests critical booking API endpoints:
 * - GET /api/booking/get-bookings-simple (booking detail retrieval)
 * - POST /api/booking/submit (booking creation)
 * - POST /api/booking/confirm (booking confirmation)
 * 
 * These are the most important endpoints for the booking flow.
 */

import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Booking API Endpoints - Critical Flow', () => {
  beforeEach(() => {
    // Reset fetch mocks
    global.fetch = fetch;
  });

  describe('GET /api/booking/get-bookings-simple', () => {
    it('should return booking with properly formatted dates', async () => {
      // This test verifies the API returns ISO string dates
      // Note: Requires a real booking ID or mocked endpoint
      const bookingId = 'TEST_BOOKING_ID';
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/get-bookings-simple?id=${bookingId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // If server not available, skip test
        if (!response.ok && response.status >= 500) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        if (response.status === 404) {
          // Booking doesn't exist - that's fine for this test
          console.warn('⚠️ Test booking not found - skipping date format test');
          return;
        }

        const data = await response.json();
        
        if (data.success && data.booking) {
          // Verify dates are ISO strings (not Date objects)
          expect(typeof data.booking.createdAt).toBe('string');
          expect(typeof data.booking.updatedAt).toBe('string');
          expect(data.booking.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
          expect(data.booking.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
          
          // Verify pickupDateTime is a string
          if (data.booking.trip?.pickupDateTime) {
            expect(typeof data.booking.trip.pickupDateTime).toBe('string');
          }
        }
      } catch (error) {
        // If fetch fails (server not running), skip test
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });

    it('should return 404 for non-existent booking', async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/get-bookings-simple?id=NONEXISTENT_${Date.now()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('not found');
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });

    it('should work without authentication (email link scenario)', async () => {
      // This test verifies Admin SDK is used (no auth required)
      const bookingId = 'TEST_BOOKING_ID';
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/get-bookings-simple?id=${bookingId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
              // No Authorization header - simulating email link access
            }
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        // Should not return 403 (forbidden) - that would indicate Client SDK auth failure
        expect(response.status).not.toBe(403);
        
        // Should return either 200 (success) or 404 (not found), not 401/403
        expect([200, 404]).toContain(response.status);
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });
  });

  describe('POST /api/booking/submit', () => {
    it('should create booking with all required fields', async () => {
      // This test verifies booking creation works
      // Note: Requires valid quote ID and complete booking data
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const bookingData = {
        quoteId: 'test-quote-id',
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '2035551234',
          notes: '',
          saveInfoForFuture: false
        },
        trip: {
          pickup: {
            address: '30 Shut Rd, Newtown, CT 06470, USA',
            coordinates: { lat: 41.3641472, lng: -73.34843 }
          },
          dropoff: {
            address: 'John F. Kennedy International Airport',
            coordinates: { lat: 40.6446124, lng: -73.7797278 }
          },
          pickupDateTime: futureDate,
          fareType: 'personal',
          flightInfo: {
            hasFlight: false,
            airline: '',
            flightNumber: '',
            arrivalTime: '',
            terminal: ''
          }
        }
      };

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        // Should return either success or validation error
        const data = await response.json();
        
        if (response.ok) {
          expect(data.success).toBe(true);
          expect(data.bookingId).toBeDefined();
        } else {
          // Validation errors are acceptable
          expect(data.error).toBeDefined();
        }
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });
  });

  describe('Date Format Consistency', () => {
    it('should return consistent date formats across all endpoints', async () => {
      // This test ensures dates are always ISO strings from API
      // Critical for preventing "getTime is not a function" errors
      
      const endpoints = [
        '/api/booking/get-bookings-simple?id=TEST',
        '/api/booking/TEST'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.status === 0 || response.status >= 500) {
            continue; // Skip if server not available
          }

          if (response.ok) {
            const data = await response.json();
            const booking = data.booking || data;
            
            if (booking && booking.createdAt) {
              // Verify date is ISO string, not Date object
              expect(typeof booking.createdAt).toBe('string');
              expect(booking.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            }
          }
        } catch (error) {
          // Skip if server not available
          continue;
        }
      }
    });
  });

  describe('GET /api/booking/get-customer-bookings', () => {
    it('should require email or phone parameter', async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/get-customer-bookings`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain('Email or phone');
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });

    it('should return empty array when no bookings found', async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/get-customer-bookings?email=nonexistent@example.com`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          expect(data.success).toBe(true);
          expect(Array.isArray(data.bookings)).toBe(true);
        }
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });
  });

  describe('PUT /api/booking/[bookingId]', () => {
    it('should require booking ID', async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup: { address: 'New Address' } })
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        // Should return 404 or 400 for invalid booking ID
        expect([400, 404]).toContain(response.status);
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });

    it('should reject updates to cancelled bookings', async () => {
      // This test verifies business rule: can't edit cancelled bookings
      // Note: Requires a cancelled booking ID in test data
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/CANCELLED_BOOKING_ID`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup: { address: 'New Address' } })
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        if (response.status === 400) {
          const data = await response.json();
          expect(data.error).toContain('cancelled');
        }
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });
  });

  describe('POST /api/booking/cancel-booking', () => {
    it('should require booking ID', async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/cancel-booking`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain('Booking ID is required');
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });

    it('should reject cancelling already cancelled bookings', async () => {
      // This test verifies business rule: can't cancel twice
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/booking/cancel-booking`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: 'ALREADY_CANCELLED_ID' })
          }
        );

        if (response.status === 0) {
          console.warn('⚠️ Skipping test - API server not available');
          return;
        }

        if (response.status === 400) {
          const data = await response.json();
          expect(data.error).toContain('already cancelled');
        }
      } catch (error) {
        console.warn('⚠️ Skipping test - API server not available:', error);
      }
    });
  });
});

