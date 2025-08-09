// Test setup file for Vitest
import { vi, expect } from 'vitest';
import React from 'react';

// TypeScript declarations for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
    toHaveTextContent(text: string): T;
    toHaveValue(value: string): T;
    toHaveAttribute(attribute: string, value?: string): T;
  }
}

// Add DOM matchers for Vitest (replacing jest-dom)
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },
  toHaveTextContent(received, expectedText) {
    const textContent = received?.textContent || '';
    const pass = textContent.includes(expectedText);
    return {
      pass,
      message: () => `expected element to have text content "${expectedText}", but got "${textContent}"`,
    };
  },
  toHaveValue(received, expectedValue) {
    const value = (received as HTMLInputElement)?.value || '';
    const pass = value === expectedValue;
    return {
      pass,
      message: () => `expected element to have value "${expectedValue}", but got "${value}"`,
    };
  },
  toHaveAttribute(received, attribute, expectedValue) {
    const element = received as HTMLElement;
    const hasAttribute = element.hasAttribute(attribute);
    const actualValue = element.getAttribute(attribute);
    const pass = hasAttribute && (expectedValue === undefined || actualValue === expectedValue);
    return {
      pass,
      message: () => `expected element to have attribute "${attribute}"${expectedValue ? ` with value "${expectedValue}"` : ''}, but got "${actualValue}"`,
    };
  },
});

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({ user: { email: 'test@example.com' } });
    return () => {};
  }),
  GoogleAuthProvider: vi.fn(() => ({})),
  // Add missing exports that might be used
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteUser: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: vi.fn(() => ({})),
  PhoneAuthProvider: vi.fn(() => ({})),
  RecaptchaVerifier: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Prevent Firebase Messaging from initializing in jsdom environment
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
}));

// Mock Google Maps
global.window.google = {
  maps: {
    places: {
      Autocomplete: vi.fn(),
      AutocompletePrediction: vi.fn(),
    },
    DistanceMatrixService: vi.fn(),
  },
} as any;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children);
  },
})); 

// Mock our Firebase utils module so hooks can call auth.onAuthStateChanged safely
vi.mock('@/lib/utils/firebase', () => ({
  auth: {
    onAuthStateChanged: (callback: any) => {
      // Simulate unauthenticated by default
      callback(null);
      return () => {};
    },
    signOut: vi.fn(),
  },
  db: {},
}));