import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

// Mock external services
jest.mock('@/lib/square-service', () => ({
  createCheckoutSession: jest.fn().mockResolvedValue({
    checkoutUrl: 'https://squareup.com/checkout/test-session',
    sessionId: 'test-session-123'
  })
}));

jest.mock('@/lib/twilio-service', () => ({
  sendSMS: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-sms-123'
  })
}));

jest.mock('@/lib/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-email-123'
  })
}));

jest.mock('@/lib/booking-service', () => ({
  createBooking: jest.fn().mockResolvedValue({
    id: 'test-booking-123',
    status: 'pending'
  }),
  getBooking: jest.fn().mockResolvedValue({
    id: 'test-booking-123',
    name: 'Test Customer',
    status: 'confirmed'
  }),
  updateBooking: jest.fn().mockResolvedValue({
    success: true
  })
}));

jest.mock('@/lib/cms-service', () => ({
  getCMSConfiguration: jest.fn().mockResolvedValue({
    pages: {
      home: {
        hero: { title: 'Test Title' }
      }
    }
  }),
  updateCMSConfiguration: jest.fn().mockResolvedValue({
    success: true
  })
}));

describe('API Endpoint Tests', () => {
  
  describe('POST /api/estimate-fare', () => {
    it('should calculate fare for valid locations', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          pickupLocation: 'Fairfield Station, Fairfield, CT',
          dropoffLocation: 'JFK Airport, Queens, NY'
        }
      });

      // Mock Google Maps API response
      const mockDistanceMatrix = {
        rows: [{
          elements: [{
            distance: { text: '45 miles', value: 72420 },
            duration: { text: '1 hour 15 minutes', value: 4500 }
          }]
        }]
      };

      // Mock the Google Maps service
      jest.doMock('@googlemaps/google-maps-services-js', () => ({
        Client: jest.fn().mockImplementation(() => ({
          distancematrix: jest.fn().mockResolvedValue({
            data: mockDistanceMatrix
          })
        }))
      }));

      // Import and call the API route
      const { default: handler } = await import('@/app/api/estimate-fare/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.fare).toBeDefined();
      expect(data.distance).toBe('45 miles');
      expect(data.duration).toBe('1 hour 15 minutes');
    });

    it('should handle invalid locations', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          pickupLocation: 'Invalid Location',
          dropoffLocation: 'Another Invalid Location'
        }
      });

      // Mock Google Maps API error
      jest.doMock('@googlemaps/google-maps-services-js', () => ({
        Client: jest.fn().mockImplementation(() => ({
          distancematrix: jest.fn().mockRejectedValue(new Error('Invalid locations'))
        }))
      }));

      const { default: handler } = await import('@/app/api/estimate-fare/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/create-checkout-session', () => {
    it('should create payment session for valid booking', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          bookingId: 'test-booking-123',
          amount: 150,
          customerEmail: 'test@example.com'
        }
      });

      const { default: handler } = await import('@/app/api/create-checkout-session/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.checkoutUrl).toBe('https://squareup.com/checkout/test-session');
      expect(data.sessionId).toBe('test-session-123');
    });

    it('should handle payment creation errors', async () => {
      // Mock Square service error
      const { createCheckoutSession } = require('@/lib/square-service');
      createCheckoutSession.mockRejectedValueOnce(new Error('Payment failed'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          bookingId: 'test-booking-123',
          amount: 150,
          customerEmail: 'test@example.com'
        }
      });

      const { default: handler } = await import('@/app/api/create-checkout-session/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/send-confirmation', () => {
    it('should send SMS and email confirmation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          bookingId: 'test-booking-123',
          customerPhone: '555-123-4567',
          customerEmail: 'test@example.com',
          bookingDetails: {
            name: 'Test Customer',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: '2024-12-25T10:00:00Z'
          }
        }
      });

      const { default: handler } = await import('@/app/api/send-confirmation/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.smsMessageId).toBe('test-sms-123');
      expect(data.emailMessageId).toBe('test-email-123');
    });

    it('should handle SMS sending errors', async () => {
      // Mock Twilio service error
      const { sendSMS } = require('@/lib/twilio-service');
      sendSMS.mockRejectedValueOnce(new Error('SMS failed'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          bookingId: 'test-booking-123',
          customerPhone: '555-123-4567',
          customerEmail: 'test@example.com',
          bookingDetails: {
            name: 'Test Customer',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: '2024-12-25T10:00:00Z'
          }
        }
      });

      const { default: handler } = await import('@/app/api/send-confirmation/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/ai-assistant', () => {
    it('should process AI questions and return responses', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          question: 'How many bookings do I have today?',
          context: {
            currentPage: 'admin',
            userRole: 'admin'
          }
        }
      });

      // Mock OpenAI response
      jest.doMock('openai', () => ({
        OpenAI: jest.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{
                  message: {
                    content: 'You have 5 bookings today.'
                  }
                }]
              })
            }
          }
        }))
      }));

      const { default: handler } = await import('@/app/api/ai-assistant/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.response).toBeDefined();
    });

    it('should fallback to local responses when OpenAI fails', async () => {
      // Mock OpenAI failure
      jest.doMock('openai', () => ({
        OpenAI: jest.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: jest.fn().mockRejectedValue(new Error('OpenAI API error'))
            }
          }
        }))
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          question: 'What are your business hours?',
          context: {
            currentPage: 'admin',
            userRole: 'admin'
          }
        }
      });

      const { default: handler } = await import('@/app/api/ai-assistant/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.response).toBeDefined();
      expect(data.fallback).toBe(true);
    });
  });

  describe('GET /api/cms/pages', () => {
    it('should return CMS configuration', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          section: 'home'
        }
      });

      const { default: handler } = await import('@/app/api/cms/pages/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pages.home).toBeDefined();
      expect(data.pages.home.hero.title).toBe('Test Title');
    });
  });

  describe('PUT /api/cms/pages', () => {
    it('should update CMS configuration', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        body: {
          pages: {
            home: {
              hero: {
                title: 'Updated Title',
                subtitle: 'Updated Subtitle'
              }
            }
          }
        }
      });

      const { default: handler } = await import('@/app/api/cms/pages/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/square-webhook', () => {
    it('should process payment webhooks', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'x-square-signature': 'test-signature'
        },
        body: {
          type: 'payment.created',
          data: {
            object: {
              payment: {
                id: 'test-payment-123',
                amount_money: {
                  amount: 15000
                }
              }
            }
          }
        }
      });

      // Mock signature verification
      jest.doMock('@/lib/square-service', () => ({
        ...jest.requireActual('@/lib/square-service'),
        verifyWebhookSignature: jest.fn().mockReturnValue(true)
      }));

      const { default: handler } = await import('@/app/api/square-webhook/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject invalid webhook signatures', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'x-square-signature': 'invalid-signature'
        },
        body: {
          type: 'payment.created',
          data: {
            object: {
              payment: {
                id: 'test-payment-123',
                amount_money: {
                  amount: 15000
                }
              }
            }
          }
        }
      });

      // Mock signature verification failure
      jest.doMock('@/lib/square-service', () => ({
        ...jest.requireActual('@/lib/square-service'),
        verifyWebhookSignature: jest.fn().mockReturnValue(false)
      }));

      const { default: handler } = await import('@/app/api/square-webhook/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {}
      });

      const { default: handler } = await import('@/app/api/estimate-fare/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: 'invalid json'
      });

      const { default: handler } = await import('@/app/api/estimate-fare/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });

    it('should handle unsupported HTTP methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      const { default: handler } = await import('@/app/api/estimate-fare/route');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
}); 