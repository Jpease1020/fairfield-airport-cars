import '@testing-library/jest-dom';

// Polyfill fetch for JSDOM
import 'whatwg-fetch';

// Mock window.alert
global.alert = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(), replace: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Firebase - comprehensive mocking for firebase-client
jest.mock('@/lib/utils/firebase-client', () => ({
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ test: 'data' }) }),
        set: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}), delete: jest.fn().mockResolvedValue({})
      }),
      add: jest.fn().mockResolvedValue({ id: 'test-doc-123' }),
      where: jest.fn().mockReturnValue({ orderBy: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue({ docs: [] }) }) })
    })
  },
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'test-user-123', email: 'test@example.com' } }),
    signOut: jest.fn().mockResolvedValue({})
  },
  app: {}
}));

// Mock Firebase main file (if it imports firebase-client)
jest.mock('@/lib/utils/firebase', () => ({
  db: {
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
  },
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
  app: {}
}));

// Mock CMS hook
jest.mock('@/hooks/useCMS', () => ({
  useCMS: () => ({
    config: { bookingForm: { title: 'Book Your Airport Transfer', subtitle: 'Reliable, comfortable transportation' } },
    loading: false, error: null
  })
}));

// Mock booking service
jest.mock('@/lib/services/booking-service', () => ({
  createBooking: jest.fn().mockResolvedValue({ id: 'test-booking-123' }),
  estimateFare: jest.fn().mockResolvedValue({ fare: 150, distance: '45 miles' }),
  isTimeSlotAvailable: jest.fn().mockResolvedValue(true)
}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = originalConsoleError; // Keep error logging
});

afterAll(() => {
  console.log = originalConsoleLog;
}); 