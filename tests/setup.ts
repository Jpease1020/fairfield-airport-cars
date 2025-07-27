// Test setup file for Jest and Playwright
import '@testing-library/jest-dom';
import React from 'react';

// Mock all external services globally
jest.mock('@/lib/services/square-service', () => ({
  createCheckoutSession: jest.fn().mockResolvedValue({
    checkoutUrl: 'https://squareup.com/checkout/test-session',
    sessionId: 'test-session-123'
  }),
  verifyWebhookSignature: jest.fn().mockReturnValue(true),
  processPayment: jest.fn().mockResolvedValue({
    success: true,
    paymentId: 'test-payment-123'
  })
}));

jest.mock('@/lib/services/twilio-service', () => ({
  sendSMS: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-sms-123'
  }),
  sendReminder: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-reminder-123'
  })
}));

jest.mock('@/lib/services/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-email-123'
  }),
  sendConfirmation: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-confirmation-123'
  })
}));

jest.mock('@/lib/utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-user-123',
        email: 'test@example.com'
      }
    }),
    signOut: jest.fn().mockResolvedValue({})
  },
  firestore: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ test: 'data' })
        }),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }),
      add: jest.fn().mockResolvedValue({ id: 'test-doc-123' }),
      where: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            docs: []
          })
        })
      })
    })
  }
}));

jest.mock('@/lib/services/ai-assistant', () => ({
  processAIQuestion: jest.fn().mockResolvedValue({
    response: 'Test AI response',
    fallback: false
  }),
  getLocalResponse: jest.fn().mockReturnValue('Local fallback response')
}));

jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    places: {
      autocomplete: jest.fn().mockResolvedValue({
        data: {
          predictions: [
            { description: 'Fairfield Station, Fairfield, CT' },
            { description: 'JFK Airport, Queens, NY' }
          ]
        }
      })
    },
    distancematrix: jest.fn().mockResolvedValue({
      data: {
        rows: [{
          elements: [{
            distance: { text: '45 miles', value: 72420 },
            duration: { text: '1 hour 15 minutes', value: 4500 }
          }]
        }]
      }
    })
  }))
}));

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Test AI response from OpenAI'
            }
          }]
        })
      }
    }
  }))
}));

// Mock StandardNavigation component to avoid usePathname issues
jest.mock('@/components/layout/navigation/StandardNavigation', () => ({
  StandardNavigation: () => '<nav data-testid="mock-navigation">Mock Navigation</nav>',
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock environment variables for testing
// process.env.NODE_ENV = 'test'; // NODE_ENV is read-only
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.SQUARE_ACCESS_TOKEN = 'test-square-token';
process.env.TWILIO_ACCOUNT_SID = 'test-twilio-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Mock browser APIs for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Web Speech API
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onresult: null,
    onerror: null,
    onend: null
  }))
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn().mockReturnValue([
      { name: 'Test Voice', lang: 'en-US' }
    ])
  }
});

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Resize Observer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for API testing
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('{"success": true}')
  })
);

// Test utilities
export const mockBookingData = {
  id: 'test-booking-123',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '555-123-4567',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00:00Z',
  status: 'pending',
  fare: 150,
  passengers: 2,
  createdAt: '2024-12-20T10:00:00Z'
};

export const mockAdminUser = {
  uid: 'admin-user-123',
  email: 'justin@fairfieldairportcar.com',
  displayName: 'Justin Admin'
};

export const mockCMSContent = {
  pages: {
    home: {
      hero: {
        title: 'Fairfield Airport Car Service',
        subtitle: 'Premium transportation to all major airports',
        ctaText: 'Book Now'
      },
      features: {
        title: 'Why Choose Us',
        items: [
          {
            title: 'Reliable Service',
            description: 'On-time pickups guaranteed',
            icon: 'clock'
          }
        ]
      }
    },
    booking: {
      title: 'Book Your Ride',
      subtitle: 'Reserve your airport transportation',
      fullNameLabel: 'Full Name',
      emailLabel: 'Email Address'
    }
  }
};

// Cleanup function for tests
export const cleanupTestData = async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
  
  // Clear localStorage and sessionStorage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
};

// Setup and teardown
beforeEach(async () => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up after each test
  await cleanupTestData();
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds for async tests 