/**
 * End-to-End Booking Creation Integration Test
 * 
 * This test verifies the complete booking flow from creation to retrieval,
 * ensuring data structure consistency across the entire system.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase-server';

describe('Booking Creation - End-to-End Integration', () => {
  const TEST_BOOKING_DATA = {
    fare: 95.50,
    customer: {
      name: 'Test User E2E',
      email: 'test-e2e@example.com',
      phone: '555-111-2222',
      notes: 'Integration test booking'
    },
    trip: {
      pickup: {
        address: '123 Test St, Fairfield, CT',
        coordinates: { lat: 41.1408, lng: -73.2613 }
      },
      dropoff: {
        address: 'JFK Airport, Queens, NY',
        coordinates: { lat: 40.6413, lng: -73.7781 }
      },
      pickupDateTime: new Date('2025-12-25T10:00:00').toISOString(),
      fareType: 'personal' as const,
      flightInfo: {
        hasFlight: true,
        airline: 'Test Airlines',
        flightNumber: 'TA123',
        arrivalTime: '09:30 AM',
        terminal: '4'
      }
    }
  };

  let createdBookingId: string | null = null;

  // Cleanup function to remove test booking
  afterAll(async () => {
    if (createdBookingId) {
      try {
        await deleteDoc(doc(db, 'bookings', createdBookingId));
        console.log(`✅ Cleaned up test booking: ${createdBookingId}`);
      } catch (error) {
        console.error('⚠️ Failed to cleanup test booking:', error);
      }
    }
  });

  it('should create booking via API with nested structure', async () => {
    const response = await fetch('http://localhost:3000/api/booking/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_BOOKING_DATA)
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.bookingId).toBeDefined();
    expect(typeof data.bookingId).toBe('string');
    
    createdBookingId = data.bookingId;
  });

  it('should retrieve booking via API with clean nested structure only', async () => {
    expect(createdBookingId).toBeDefined();
    
    const response = await fetch(`http://localhost:3000/api/booking/get-bookings-simple?id=${createdBookingId}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.booking).toBeDefined();
    
    const booking = data.booking;
    
    // ✅ VERIFY NESTED STRUCTURE EXISTS
    expect(booking.trip).toBeDefined();
    expect(booking.customer).toBeDefined();
    expect(booking.payment).toBeDefined();
    
    // ✅ VERIFY NESTED TRIP DATA
    expect(booking.trip.pickup).toBeDefined();
    expect(booking.trip.pickup.address).toBe(TEST_BOOKING_DATA.trip.pickup.address);
    expect(booking.trip.pickup.coordinates).toEqual(TEST_BOOKING_DATA.trip.pickup.coordinates);
    
    expect(booking.trip.dropoff).toBeDefined();
    expect(booking.trip.dropoff.address).toBe(TEST_BOOKING_DATA.trip.dropoff.address);
    expect(booking.trip.dropoff.coordinates).toEqual(TEST_BOOKING_DATA.trip.dropoff.coordinates);
    
    expect(booking.trip.fareType).toBe(TEST_BOOKING_DATA.trip.fareType);
    expect(booking.trip.fare).toBe(TEST_BOOKING_DATA.fare);
    
    // ✅ VERIFY NESTED CUSTOMER DATA
    expect(booking.customer.name).toBe(TEST_BOOKING_DATA.customer.name);
    expect(booking.customer.email).toBe(TEST_BOOKING_DATA.customer.email);
    expect(booking.customer.phone).toBe(TEST_BOOKING_DATA.customer.phone);
    expect(booking.customer.notes).toBe(TEST_BOOKING_DATA.customer.notes);
    
    // ✅ VERIFY NESTED PAYMENT DATA
    expect(booking.payment.balanceDue).toBe(TEST_BOOKING_DATA.fare);
    expect(booking.payment.depositPaid).toBe(false);
    expect(booking.payment.depositAmount).toBe(0);
    
    // ✅ VERIFY FLIGHT INFO WAS SAVED
    expect(booking.trip.flightInfo).toBeDefined();
    expect(booking.trip.flightInfo.hasFlight).toBe(true);
    expect(booking.trip.flightInfo.airline).toBe(TEST_BOOKING_DATA.trip.flightInfo.airline);
    expect(booking.trip.flightInfo.flightNumber).toBe(TEST_BOOKING_DATA.trip.flightInfo.flightNumber);
    
    // ✅ VERIFY BOOKING STATUS
    expect(booking.status).toMatch(/confirmed|pending/); // Confirmed if driver available, pending if not
    expect(booking.driverName).toBeDefined();
    
    // ✅ VERIFY TIMESTAMPS
    expect(booking.createdAt).toBeDefined();
    expect(booking.updatedAt).toBeDefined();
  });

  it('should handle booking without flight info gracefully', async () => {
    const bookingWithoutFlight = {
      ...TEST_BOOKING_DATA,
      customer: {
        ...TEST_BOOKING_DATA.customer,
        email: 'test-no-flight@example.com'
      },
      trip: {
        ...TEST_BOOKING_DATA.trip,
        flightInfo: {
          hasFlight: false,
          airline: '',
          flightNumber: '',
          arrivalTime: '',
          terminal: ''
        }
      }
    };

    const response = await fetch('http://localhost:3000/api/booking/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingWithoutFlight)
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    const tempBookingId = data.bookingId;
    
    // Retrieve and verify
    const getResponse = await fetch(`http://localhost:3000/api/booking/get-bookings-simple?id=${tempBookingId}`);
    const getData = await getResponse.json();
    
    expect(getData.booking.trip.flightInfo.hasFlight).toBe(false);
    
    // Cleanup
    await deleteDoc(doc(db, 'bookings', tempBookingId));
  });

  it('should validate that booking data is directly accessible without fallbacks', async () => {
    expect(createdBookingId).toBeDefined();
    
    const response = await fetch(`http://localhost:3000/api/booking/get-bookings-simple?id=${createdBookingId}`);
    const data = await response.json();
    const booking = data.booking;
    
    // ✅ VERIFY CLEAN NESTED STRUCTURE - NO FALLBACKS NEEDED
    expect(booking.trip.pickup.address).toBe(TEST_BOOKING_DATA.trip.pickup.address);
    expect(booking.trip.dropoff.address).toBe(TEST_BOOKING_DATA.trip.dropoff.address);
    expect(booking.customer.name).toBe(TEST_BOOKING_DATA.customer.name);
    expect(booking.trip.fare).toBe(TEST_BOOKING_DATA.fare);
    
    // ✅ VERIFY NO LEGACY FLAT FIELDS EXIST
    expect(booking.pickupLocation).toBeUndefined();
    expect(booking.dropoffLocation).toBeUndefined();
    expect(booking.name).toBeUndefined();
    expect(booking.email).toBeUndefined();
    expect(booking.phone).toBeUndefined();
    expect(booking.fare).toBeUndefined(); // Only booking.trip.fare should exist
  });
});
