import { http } from 'msw';

// Mock data for tests
export const mockBookingData = {
  id: 'test-booking-123',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '203-555-0123',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00:00.000Z',
  passengers: 2,
  fare: 150,
  status: 'confirmed'
};

export const mockCMSData = {
  bookingForm: {
    title: 'Book Your Airport Transfer',
    subtitle: 'Reliable, comfortable transportation to and from Fairfield Airport',
    submitButton: 'Book Now',
    calculateButton: 'Calculate Fare'
  },
  homePage: {
    hero: {
      title: 'Premium Airport Transportation',
      subtitle: 'Reliable, professional, and luxurious transportation to and from all major airports'
    },
    features: {
      items: [
        {
          title: 'Professional Drivers',
          description: 'Licensed, insured, and experienced drivers',
          icon: 'car'
        },
        {
          title: '24/7 Service',
          description: 'Available around the clock for your convenience',
          icon: 'clock'
        },
        {
          title: 'Fixed Pricing',
          description: 'No hidden fees or surge pricing',
          icon: 'dollar-sign'
        }
      ]
    }
  }
};

export const mockBusinessSettings = {
  company: {
    name: 'Fairfield Airport Cars',
    email: 'info@fairfieldairportcars.com',
    phone: '203-555-0123'
  },
  booking: {
    minAdvanceHours: 2,
    maxPassengers: 8
  }
};

// API Handlers - Updated to use MSW v2 syntax
export const handlers = [
  // CMS API
  http.get('/api/admin/cms/pages', () => {
    return Response.json(mockCMSData);
  }),

  // Business Settings API
  http.get('/api/admin/business-settings', () => {
    return Response.json(mockBusinessSettings);
  }),

  // Booking APIs - Updated to match actual endpoints
  http.post('/api/booking/estimate-fare', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      fare: 150,
      distance: '45 miles',
      duration: '1 hour 15 minutes'
    });
  }),

  http.post('/api/booking/create-booking-simple', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      id: 'test-booking-123',
      status: 'confirmed',
      ...(body as object)
    });
  }),

  http.get('/api/booking/get-bookings-simple', () => {
    return Response.json([mockBookingData]);
  }),

  // Places Autocomplete API
  http.post('/api/places-autocomplete', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      predictions: [
        { description: 'Fairfield Station, Fairfield, CT' },
        { description: 'JFK Airport, Queens, NY' },
        { description: 'LaGuardia Airport, Queens, NY' }
      ]
    });
  }),

  // Payment APIs
  http.post('/api/payment/create-checkout-session', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      checkoutUrl: 'https://squareup.com/checkout/test-session',
      sessionId: 'test-session-123'
    });
  }),

  http.post('/api/payment/complete-payment', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      success: true,
      paymentId: 'test-payment-123'
    });
  }),

  // Notifications API
  http.post('/api/notifications/send-confirmation', async ({ request }) => {
    const body = await request.json();
    return Response.json({
      success: true,
      messageId: 'test-msg-123'
    });
  }),

  // Admin APIs
  http.get('/api/admin/analytics/summary', () => {
    return Response.json({
      totalBookings: 150,
      totalRevenue: 22500,
      averageFare: 150
    });
  }),

  // Error simulation handlers
  http.post('/api/booking/estimate-fare', async () => {
    // Simulate network error
    return new Response(null, { status: 500 });
  }),

  http.post('/api/booking/create-booking-simple', async () => {
    // Simulate validation error
    return Response.json(
      { error: 'Invalid booking data' },
      { status: 400 }
    );
  })
]; 