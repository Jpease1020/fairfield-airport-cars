/**
 * Application constants
 */

export const APP_CONFIG = {
  name: 'Fairfield Airport Cars',
  version: '1.0.0',
  description: 'Premium airport transportation service',
  supportEmail: 'support@fairfieldairportcars.com',
  supportPhone: '(203) 555-0123',
} as const;

export const BOOKING_CONFIG = {
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
  defaultDepositPercent: 0.3,
  maxTipPercent: 2.0,
  defaultTipPercent: 0.15,
  cancellationWindowHours: 3,
} as const;

export const PAYMENT_CONFIG = {
  currency: 'USD',
  minAmount: 100, // $1.00 in cents
  maxAmount: 100000, // $1000.00 in cents
  processingFeePercent: 0.029, // 2.9%
  processingFeeFixed: 30, // $0.30 in cents
} as const;

export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: true,
    minLength: 10,
    pattern: /^[+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
} as const;

export const API_ENDPOINTS = {
  booking: '/api/booking',
  payment: '/api/payment',
  places: '/api/places-autocomplete',
  fare: '/api/booking/estimate-fare',
  timeSlot: '/api/booking/check-time-slot',
  analytics: '/api/admin/analytics',
} as const;

export const ROUTES = {
  home: '/',
  book: '/book',
  bookings: '/bookings',
  admin: '/admin',
  contact: '/contact',
  help: '/help',
  privacy: '/privacy',
  terms: '/terms',
  success: '/success',
  cancel: '/cancel',
} as const;

export const STORAGE_KEYS = {
  bookingData: 'fairfield-booking-data',
  userPreferences: 'fairfield-user-preferences',
  lastSearch: 'fairfield-last-search',
  authToken: 'fairfield-auth-token',
} as const;

export const TOAST_DURATIONS = {
  success: 5000,
  error: 7000,
  warning: 6000,
  info: 4000,
} as const;

export const LOADING_STATES = {
  calculating: 'calculating',
  processing: 'processing',
  submitting: 'submitting',
  loading: 'loading',
  saving: 'saving',
} as const;

export const BOOKING_PHASES = {
  tripDetails: 'trip-details',
  contactInfo: 'contact-info',
  payment: 'payment',
  paymentProcessing: 'payment-processing',
} as const;

export const BOOKING_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  inProgress: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
  refunded: 'refunded',
} as const;

export const ERROR_MESSAGES = {
  networkError: 'Network error. Please check your connection and try again.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  authError: 'Authentication failed. Please log in again.',
  paymentError: 'Payment failed. Please check your payment information.',
  bookingError: 'Booking failed. Please try again.',
  genericError: 'Something went wrong. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  bookingConfirmed: 'Booking confirmed! You will receive a confirmation email shortly.',
  paymentSuccessful: 'Payment processed successfully!',
  profileUpdated: 'Profile updated successfully!',
  passwordChanged: 'Password changed successfully!',
  bookingCancelled: 'Booking cancelled successfully!',
} as const;
