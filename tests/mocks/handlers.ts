import { http, HttpResponse } from 'msw';

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
  // Test endpoint for MSW verification
  http.get('/api/test-endpoint', () => {
    return HttpResponse.json({
      message: 'Hello from MSW!',
      success: true
    });
  }),

  // CMS API
  http.get('/api/admin/cms/pages', () => {
    return HttpResponse.json(mockCMSData);
  }),

  // Business Settings API
  http.get('/api/admin/business-settings', () => {
    return HttpResponse.json(mockBusinessSettings);
  }),

  // Booking APIs - Updated to match actual endpoints
  http.get('/api/booking', () => {
    return HttpResponse.json({
      success: true,
      message: 'Booking API is working'
    });
  }),

  http.get('/api/booking/estimate-fare', () => {
    return HttpResponse.json({
      success: true,
      message: 'Estimate fare endpoint is working'
    });
  }),

  http.get('/api/booking/check-time-slot', () => {
    return HttpResponse.json({
      success: true,
      message: 'Check time slot endpoint is working'
    });
  }),

  http.post('/api/booking/estimate-fare', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      fare: 150,
      distance: '45 miles',
      duration: '1 hour 15 minutes'
    });
  }),

  http.post('/api/booking/create-booking-simple', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'test-booking-123',
      status: 'confirmed',
      ...(body as object)
    });
  }),

  http.get('/api/booking/get-bookings-simple', () => {
    return HttpResponse.json([mockBookingData]);
  }),

  // Places Autocomplete API
  http.post('/api/places-autocomplete', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      predictions: [
        { description: 'Fairfield Station, Fairfield, CT' },
        { description: 'JFK Airport, Queens, NY' },
        { description: 'LaGuardia Airport, Queens, NY' }
      ]
    });
  }),

  // Payment APIs
  http.get('/api/payment/create-checkout-session', () => {
    return HttpResponse.json({
      success: true,
      message: 'Create checkout session endpoint is working'
    });
  }),

  http.get('/api/payment/complete-payment', () => {
    return HttpResponse.json({
      success: true,
      message: 'Complete payment endpoint is working'
    });
  }),

  http.get('/api/payment/square-webhook', () => {
    return HttpResponse.json({
      success: true,
      message: 'Square webhook endpoint is working'
    });
  }),

  http.post('/api/payment/create-checkout-session', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      checkoutUrl: 'https://squareup.com/checkout/test-session',
      sessionId: 'test-session-123'
    });
  }),

  http.post('/api/payment/complete-payment', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      paymentId: 'test-payment-123'
    });
  }),

  // Notifications API
  http.get('/api/notifications/send-confirmation', () => {
    return HttpResponse.json({
      success: true,
      message: 'Send confirmation endpoint is working'
    });
  }),

  http.get('/api/notifications/send-feedback-request', () => {
    return HttpResponse.json({
      success: true,
      message: 'Send feedback request endpoint is working'
    });
  }),

  http.post('/api/notifications/send-confirmation', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      messageId: 'test-msg-123'
    });
  }),

  // Admin APIs
  http.get('/api/admin/analytics/summary', () => {
    return HttpResponse.json({
      totalBookings: 150,
      totalRevenue: 22500,
      averageFare: 150
    });
  }),

  // Admin Login API
  http.post('/api/admin/login', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      user: { 
        email: body?.email || 'admin@fairfieldairportcar.com',
        uid: 'admin-user-123'
      }
    });
  }),

  // Admin Dashboard APIs
  http.get('/api/admin/bookings', () => {
    return HttpResponse.json([mockBookingData]);
  }),

  http.get('/api/admin/drivers', () => {
    return HttpResponse.json([
      {
        id: 'driver-1',
        name: 'John Driver',
        phone: '203-555-0123',
        status: 'available'
      }
    ]);
  }),

  http.get('/api/admin/payments', () => {
    return HttpResponse.json([
      {
        id: 'payment-1',
        amount: 150,
        status: 'completed',
        bookingId: 'test-booking-123'
      }
    ]);
  }),

  // Booking APIs - Additional endpoints
  http.post('/api/booking', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      bookingId: 'test-booking-123',
      paymentUrl: 'https://checkout.square.com/test'
    });
  }),

  http.get('/api/booking/:id', () => {
    return HttpResponse.json(mockBookingData);
  }),

  // Tracking API
  http.get('/api/tracking/:bookingId', () => {
    return HttpResponse.json({
      bookingId: 'test-booking-123',
      status: 'in-progress',
      driverName: 'Gregg',
      driverPhone: '203-555-0123',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'ABC123'
      },
      currentLocation: {
        latitude: 41.1408,
        longitude: -73.2613,
        timestamp: new Date().toISOString()
      },
      estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      pickupDateTime: '2024-12-25T10:00:00Z',
      lastUpdated: new Date().toISOString()
    });
  }),

  // Reviews/Feedback API
  http.post('/api/reviews/submit', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      reviewId: 'review-123'
    });
  }),

  // Service APIs (previously mocked with Jest)
  http.post('/api/services/square/create-checkout', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      checkoutUrl: 'https://squareup.com/checkout/test-session',
      sessionId: 'test-session-123'
    });
  }),

  http.post('/api/services/square/verify-webhook', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      verified: true
    });
  }),

  http.post('/api/services/twilio/send-sms', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      messageId: 'test-sms-123'
    });
  }),

  http.post('/api/services/email/send', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      messageId: 'test-email-123'
    });
  }),

  // Error simulation handlers
  http.post('/api/booking/estimate-fare', async () => {
    // Simulate network error
    return new HttpResponse(null, { status: 500 });
  }),

  http.post('/api/booking/create-booking-simple', async () => {
    // Simulate validation error
    return HttpResponse.json(
      { error: 'Invalid booking data' },
      { status: 400 }
    );
  })
]; 