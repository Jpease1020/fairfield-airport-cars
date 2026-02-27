import {
  Booking,
  BookingFormData,
  BookingPhase,
  CustomerInfo,
  PaymentInfo,
  QuoteData,
  TripDetails,
  ValidationResult,
} from '@/types/booking';
import { RouteInfo } from '@/hooks/useRouteCalculation';

export interface BookingProviderType {
  currentBooking: Booking | null;

  formData: BookingFormData;
  currentPhase: BookingPhase;
  validation: ValidationResult;
  hasAttemptedValidation: boolean;
  setHasAttemptedValidation: (_value: boolean) => void;

  updateFormData: (_data: Partial<BookingFormData>) => void;
  updateTripDetails: (_data: Partial<TripDetails>) => void;
  updateCustomerInfo: (_data: Partial<CustomerInfo>) => void;
  updatePaymentInfo: (_data: Partial<PaymentInfo>) => void;

  goToPhase: (_phase: BookingPhase) => void;
  goToNextPhase: () => Promise<void>;
  goToPreviousPhase: () => void;

  validateForm: () => ValidationResult;
  validateCurrentPhase: () => ValidationResult;
  validateQuickBookingForm: () => ValidationResult;
  isQuickBookingFormValid: () => boolean;
  isContactInfoComplete: () => boolean;
  hasFormData: () => boolean;
  clearAllErrors: () => void;
  clearStoredFormData: () => void;

  submitForm: () => Promise<void>;
  submitQuickBookingForm: () => Promise<void>;
  resetForm: () => void;

  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>) => Promise<Booking>;
  getBooking: (_id: string) => Promise<Booking | null>;
  deleteBooking: (_id: string) => Promise<void>;

  subscribeToBooking: (_id: string) => void;
  unsubscribeFromBooking: (_id: string) => void;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  warning: string | null;
  success: string | null;
  completedBookingId: string | null;

  currentQuote: QuoteData | null;
  setQuote: (_quote: QuoteData | null) => void;
  submitBooking: (_exceptionCode?: string) => Promise<{ success: boolean; newTotal?: number }>;
  completeFlightInfo: () => void;

  route: RouteInfo | null;
  routeLoading: boolean;
  routeError: string | null;

  setCurrentBooking: (_booking: Booking | null) => void;
  setError: (_error: string | null) => void;
  clearError: () => void;
  clearWarning: () => void;
}
