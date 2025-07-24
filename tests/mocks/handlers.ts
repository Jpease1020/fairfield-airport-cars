import { rest } from 'msw';

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

// API Handlers - Updated to use MSW v1 syntax
export const handlers = [
  // CMS API
  rest.get('/api/admin/cms/pages', (req, res, ctx) => {
    return res(ctx.json(mockCMSData));
  }),

  // Business Settings API
  rest.get('/api/admin/business-settings', (req, res, ctx) => {
    return res(ctx.json(mockBusinessSettings));
  }),

  // Booking APIs - Updated to match actual endpoints
  rest.post('/api/booking/estimate-fare', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      fare: 150,
      distance: '45 miles',
      duration: '1 hour 15 minutes'
    }));
  }),

  rest.post('/api/booking/create-booking-simple', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      id: 'test-booking-123',
      status: 'confirmed',
      ...body
    }));
  }),

  rest.get('/api/booking/get-bookings-simple', (req, res, ctx) => {
    return res(ctx.json([mockBookingData]));
  }),

  // Places Autocomplete API
  rest.post('/api/places-autocomplete', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      predictions: [
        { description: 'Fairfield Station, Fairfield, CT' },
        { description: 'JFK Airport, Queens, NY' },
        { description: 'LaGuardia Airport, Queens, NY' }
      ]
    }));
  }),

  // Payment APIs
  rest.post('/api/payment/create-checkout-session', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      checkoutUrl: 'https://squareup.com/checkout/test-session',
      sessionId: 'test-session-123'
    }));
  }),

  rest.post('/api/payment/complete-payment', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      success: true,
      paymentId: 'test-payment-123'
    }));
  }),

  // Notifications API
  rest.post('/api/notifications/send-confirmation', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      success: true,
      messageId: 'test-msg-123'
    }));
  }),

  // Admin APIs
  rest.get('/api/admin/analytics/summary', (req, res, ctx) => {
    return res(ctx.json({
      totalBookings: 150,
      totalRevenue: 22500,
      averageFare: 150
    }));
  }),

  // Error simulation handlers
  rest.post('/api/booking/estimate-fare', async (req, res, ctx) => {
    // Simulate network error
    return res(ctx.status(500));
  }),

  rest.post('/api/booking/create-booking-simple', async (req, res, ctx) => {
    // Simulate validation error
    return res(
      ctx.json({ error: 'Invalid booking data' }),
      ctx.status(400)
    );
  })
]; 