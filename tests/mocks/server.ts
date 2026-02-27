/**
 * MSW Server for RTL-Heavy Testing
 * 
 * Provides realistic API mocking for React Testing Library tests.
 * Focuses on real user scenarios and realistic responses.
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Realistic test data
const REALISTIC_QUOTES = {
  fairfieldToJFK: {
    fare: 95.50,
    distanceMiles: 42.3,
    durationMinutes: 58,
    fareType: 'personal',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    expiresInMinutes: 15
  },
  stamfordToLGA: {
    fare: 78.25,
    distanceMiles: 38.7,
    durationMinutes: 52,
    fareType: 'personal',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    expiresInMinutes: 15
  },
  businessFare: {
    fare: 115.75,
    distanceMiles: 42.3,
    durationMinutes: 58,
    fareType: 'business',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    expiresInMinutes: 15
  }
};

export const server = setupServer(
  // Quote API - realistic responses with error handling
  http.post('/api/booking/quote', async ({ request }) => {
    try {
      const body = await request.json() as any;
      
      // Simulate realistic delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for error conditions
      if (body.origin === 'error-test') {
        return HttpResponse.json(
          { error: 'Google Maps API unavailable' },
          { status: 503 }
        );
      }
      
      // Determine fare based on route and fare type
      let quote;
      if (body.origin?.includes('Fairfield') && body.destination?.includes('JFK')) {
        // Fairfield to JFK route - use different pricing for personal vs business
        if (body.fareType === 'business') {
          quote = REALISTIC_QUOTES.businessFare;
        } else {
          quote = REALISTIC_QUOTES.fairfieldToJFK;
        }
      } else if (body.origin?.includes('Stamford') && body.destination?.includes('LGA')) {
        quote = REALISTIC_QUOTES.stamfordToLGA;
      } else {
        // Generic quote - use fareType to determine pricing
        const baseFare = body.fareType === 'business' ? 105.50 : 85.00;
        quote = {
          fare: baseFare,
          distanceMiles: 35.0,
          durationMinutes: 45,
          fareType: body.fareType || 'personal',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          expiresInMinutes: 15
        };
      }
      
      return HttpResponse.json(quote);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to process quote request' },
        { status: 500 }
      );
    }
  }),

  // Booking submission API
  http.post('/api/booking/submit', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate realistic delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Validate required fields
    if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
      return HttpResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }
    
    if (!body.trip?.pickup?.address || !body.trip?.dropoff?.address) {
      return HttpResponse.json(
        { error: 'Missing trip information' },
        { status: 400 }
      );
    }
    
    // Return success
    return HttpResponse.json({
      success: true,
      bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Booking confirmed successfully'
    });
  }),

  http.post('/api/booking/validate-phase', async ({ request }) => {
    const body = await request.json() as any;
    const phase = body?.phase;
    const formData = body?.formData ?? {};
    const trip = formData?.trip ?? {};
    const customer = formData?.customer ?? {};
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    const requireTripCore = () => {
      if (!trip?.pickup?.address?.trim()) {
        const msg = 'Pickup location is required';
        errors.push(msg);
        fieldErrors['pickup-location-input'] = msg;
      }
      if (!trip?.dropoff?.address?.trim()) {
        const msg = 'Dropoff location is required';
        errors.push(msg);
        fieldErrors['dropoff-location-input'] = msg;
      }
      if (!trip?.pickupDateTime) {
        const msg = 'Pickup date and time is required';
        errors.push(msg);
        fieldErrors['pickup-datetime-input'] = msg;
      }
    };

    if (phase === 'trip-details' || phase === 'quick-booking' || phase === 'payment') {
      requireTripCore();
    }

    if (phase === 'contact-info' || phase === 'payment') {
      if (!customer?.name?.trim()) {
        const msg = 'Name is required';
        errors.push(msg);
        fieldErrors['name-input'] = msg;
      }
      if (!customer?.email?.trim()) {
        const msg = 'Email is required';
        errors.push(msg);
        fieldErrors['email-input'] = msg;
      }
      if (!customer?.phone?.trim()) {
        const msg = 'Phone number is required';
        errors.push(msg);
        fieldErrors['phone-input'] = msg;
      }
    }

    return HttpResponse.json({
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        fieldErrors,
      }
    });
  }),

  // Availability check API
  http.post('/api/booking/check-time-slot', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate realistic delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return HttpResponse.json({
      success: true,
      isAvailable: true,
      conflictingBookings: 0,
      timeRange: {
        start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    });
  }),

  // Google Maps API (mocked)
  http.get('https://maps.googleapis.com/maps/api/distancematrix/json', () => {
    return HttpResponse.json({
      status: 'OK',
      origin_addresses: ['Fairfield Station, Fairfield, CT, USA'],
      destination_addresses: ['JFK Airport, Queens, NY, USA'],
      rows: [{
        elements: [{
          status: 'OK',
          distance: { text: '42.3 mi', value: 68000 },
          duration: { text: '58 mins', value: 3480 },
          duration_in_traffic: { text: '1h 5mins', value: 3900 }
        }]
      }]
    });
  }),

  // Fallback for any other requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  })
);
