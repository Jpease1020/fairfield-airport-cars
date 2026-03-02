/**
 * Application constants
 */

export const APP_CONFIG = {
  name: 'Fairfield Airport Cars',
  version: '1.0.0',
  description: 'Premium airport transportation service',
} as const;

/**
 * Business contact information
 * Used throughout the app for customer-facing contact details
 */
export const BUSINESS_CONTACT = {
  // Primary contact for rides and bookings
  phone: '(646) 221-6370',
  // Email addresses - note: domain is 'fairfieldairportcar.com' (no 's')
  ridesEmail: 'rides@fairfieldairportcar.com',
  supportEmail: 'support@fairfieldairportcar.com',
} as const;

/**
 * Email service configuration
 * VERIFIED_EMAIL_FROM must match a verified sender in SendGrid
 * Current verified sender: rides@fairfieldairportcar.com
 */
export const EMAIL_CONFIG = {
  // Must match SendGrid verified sender exactly
  verifiedSender: 'rides@fairfieldairportcar.com',
  // Default from name shown in emails
  fromName: 'Fairfield Airport Cars',
  // BCC for all booking emails (for records)
  // Note: typed as string[] so nodemailer can use it (readonly array not compatible)
  bccRecipients: ['rides@fairfieldairportcar.com'] as string[],
};

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
  bookingSubmit: '/api/booking/submit',
  bookingQuote: '/api/booking/quote',
  bookingValidatePhase: '/api/booking/validate-phase',
  paymentProcess: '/api/payment/process-payment',
  trackingEta: '/api/tracking/eta',
  places: '/api/places-autocomplete',
  timeSlot: '/api/booking/check-time-slot',
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
  requiresApproval: 'requires_approval',
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

export const KNOWN_AIRPORTS = [
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    coordinates: { lat: 40.6413111, lng: -73.7781391 },
    radiusMiles: 5,
  },
  {
    code: 'LGA',
    name: 'LaGuardia Airport',
    coordinates: { lat: 40.7769271, lng: -73.8739659 },
    radiusMiles: 4,
  },
  {
    code: 'EWR',
    name: 'Newark Liberty International Airport',
    coordinates: { lat: 40.6895314, lng: -74.1744624 },
    radiusMiles: 5,
  },
  {
    code: 'HPN',
    name: 'Westchester County Airport',
    coordinates: { lat: 41.067005, lng: -73.707574 },
    radiusMiles: 3,
  },
  {
    code: 'BDL',
    name: 'Bradley International Airport',
    coordinates: { lat: 41.938889, lng: -72.683056 },
    radiusMiles: 5,
  },
  {
    code: 'HVN',
    name: 'Tweed New Haven Airport',
    coordinates: { lat: 41.263889, lng: -72.886667 },
    radiusMiles: 3,
  },
  {
    code: 'BDR',
    name: 'Igor I. Sikorsky Memorial Airport',
    coordinates: { lat: 41.163467, lng: -73.126168 },
    radiusMiles: 2,
  },
  {
    code: 'ISP',
    name: 'Long Island MacArthur Airport',
    coordinates: { lat: 40.789319, lng: -73.100211 },
    radiusMiles: 3,
  },
] as const;
