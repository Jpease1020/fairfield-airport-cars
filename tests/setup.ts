/**
 * Clean Test Setup for RTL-Heavy Testing
 *
 * Optimized for React Testing Library with realistic mocks
 * and proper provider setup for integration testing.
 */

import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Import test utilities
import './utils/test-providers';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    const React = require('react');
    return React.createElement('img', { src, alt, ...props });
  }
}));

// Mock Google Maps with realistic behavior
vi.mock('@vis.gl/react-google-maps', () => ({
  useMapsLibrary: vi.fn(() => ({
    Autocomplete: vi.fn().mockImplementation(() => ({
      addListener: vi.fn(),
      getPlace: vi.fn(() => ({
        formatted_address: 'JFK Airport, Queens, NY',
        geometry: {
          location: {
            lat: () => 40.6413,
            lng: () => -73.7781
          }
        }
      }))
    }))
  })),
  useMap: vi.fn(() => null),
  APIProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn((db, collection, id) => ({ id, collection })),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ id: 'test-quote-id', fare: 95.50 }),
    id: 'test-quote-id'
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn((db, name) => ({ id: name, path: name })),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
    empty: true,
    size: 0
  })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Call callback immediately with null user
    if (callback) {
      callback(null);
    }
    // Return unsubscribe function
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn()
}));

// Mock storage with realistic behavior
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key: string) => {
      const store = (global as any).__sessionStorage || {};
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (!(global as any).__sessionStorage) {
        (global as any).__sessionStorage = {};
      }
      (global as any).__sessionStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      const store = (global as any).__sessionStorage || {};
      delete store[key];
    }),
    clear: vi.fn(() => {
      (global as any).__sessionStorage = {};
    })
  },
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => {
      const store = (global as any).__localStorage || {};
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (!(global as any).__localStorage) {
        (global as any).__localStorage = {};
      }
      (global as any).__localStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      const store = (global as any).__localStorage || {};
      delete store[key];
    }),
    clear: vi.fn(() => {
      (global as any).__localStorage = {};
    })
  },
  writable: true
});

// Setup MSW for realistic API mocking
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  // Clear storage between tests
  (global as any).__sessionStorage = {};
  (global as any).__localStorage = {};
});

afterAll(() => {
  server.close();
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock fetch for realistic API testing - REMOVED to let MSW handle it
// global.fetch = vi.fn();