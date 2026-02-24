'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFormData, BookingPhase, ValidationResult, TripDetails, CustomerInfo, PaymentInfo, QuoteData } from '@/types/booking';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { authFetch } from '@/lib/utils/auth-fetch';

interface BookingProviderType {
  // Current booking
  currentBooking: Booking | null;
  
  // Form state (replaces BookingFormProvider)
  formData: BookingFormData;
  currentPhase: BookingPhase;
  validation: ValidationResult;
  hasAttemptedValidation: boolean;
  setHasAttemptedValidation: (value: boolean) => void;
  
  // Form actions
  updateFormData: (_data: Partial<BookingFormData>) => void;
  updateTripDetails: (_data: Partial<TripDetails>) => void;
  updateCustomerInfo: (_data: Partial<CustomerInfo>) => void;
  updatePaymentInfo: (_data: Partial<PaymentInfo>) => void;
  
  // Phase management
  goToPhase: (_phase: BookingPhase) => void;
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  
  // Validation
  validateForm: () => ValidationResult;
  validateCurrentPhase: () => ValidationResult;
  validateQuickBookingForm: () => ValidationResult;
  isQuickBookingFormValid: () => boolean;
  isContactInfoComplete: () => boolean;
  hasFormData: () => boolean;
  clearAllErrors: () => void;
  clearStoredFormData: () => void;
  
  // Form submission
  submitForm: () => Promise<void>;
  submitQuickBookingForm: () => Promise<void>;
  resetForm: () => void;
  
  // Booking actions (existing)
  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>) => Promise<Booking>;
  getBooking: (_id: string) => Promise<Booking | null>;
  deleteBooking: (_id: string) => Promise<void>;
  
  // Real-time updates
  subscribeToBooking: (_id: string) => void;
  unsubscribeFromBooking: (_id: string) => void;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  warning: string | null;
  success: string | null;
  completedBookingId: string | null;
  
  // Quote management (15-minute expiration)
  currentQuote: QuoteData | null;
  setQuote: (quote: QuoteData | null) => void;
  submitBooking: (exceptionCode?: string) => Promise<{ success: boolean; newTotal?: number }>;
  completeFlightInfo: () => void;
  
  // Route calculation (for traffic-aware pricing)
  route: any;
  routeLoading: boolean;
  routeError: string | null;
  
  // Helper functions
  setCurrentBooking: (booking: Booking | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearWarning: () => void;
}

const BookingContext = createContext<BookingProviderType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
  existingBooking?: Booking; // For editing existing bookings
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children, existingBooking }) => {
  const router = useRouter();
  
  // Existing booking state
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state (replaces BookingFormProvider)
  const [formData, setFormData] = useState<BookingFormData>({
    trip: {
      pickup: { address: '', coordinates: null },
      dropoff: { address: '', coordinates: null },
      pickupDateTime: '',
      fareType: 'personal',
      flightInfo: {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: ''
      }
      // Note: fare is managed via currentQuote, not formData
    },
    customer: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      saveInfoForFuture: false,
      smsOptIn: false // Default unchecked for TCPA compliance (affirmative consent required)
    },
    payment: {
      depositAmount: null,
      balanceDue: 0,
      depositPaid: false,
      tipAmount: 0,
      tipPercent: 15,
      totalAmount: 0
    }
  });

  const [currentPhase, setCurrentPhase] = useState<BookingPhase>('trip-details');
const [isSubmitting, setIsSubmitting] = useState(false);
const [success, setSuccess] = useState<string | null>(null);
const [warning, setWarning] = useState<string | null>(null);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate route with traffic data (for traffic-aware pricing)
  const { route, loading: routeLoading, error: routeError } = useRouteCalculation(
    formData.trip.pickup.coordinates,
    formData.trip.dropoff.coordinates,
    formData.trip.pickupDateTime
  );

  // Set full quote data (replaces setFare)
  const setQuote = useCallback((quote: QuoteData | null) => {
    setCurrentQuote(quote);
    // Note: fare is now managed via currentQuote only, not duplicated in formData
  }, []);

  // Initialize form data from session storage (for page refresh persistence)
  useEffect(() => {
    const storedFormData = sessionStorage.getItem('booking-form-data');
    
    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Failed to parse stored booking form data:', error);
      }
    }
    setIsInitialized(true);
  }, []); // Only run once on mount

  // Debounced save to session storage (separate from quote expiration)
  // Form data persists until tab closes, independent of 15-minute quote expiration
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load
    
    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem('booking-form-data', JSON.stringify(formData));
      } catch (error) {
        console.error('Failed to save booking form data to session storage:', error);
      }
    }, 500); // 500ms debounce to avoid excessive writes
    
    return () => clearTimeout(timeoutId);
  }, [formData, isInitialized]);

  // Initialize form with existing booking
  useEffect(() => {
    if (existingBooking) {
      setFormData({
        trip: {
          pickup: {
            address: existingBooking.trip.pickup.address || '',
            coordinates: existingBooking.trip.pickup.coordinates || null
          },
          dropoff: {
            address: existingBooking.trip.dropoff.address || '',
            coordinates: existingBooking.trip.dropoff.coordinates || null
          },
          pickupDateTime: existingBooking.trip.pickupDateTime || '',
          fareType: existingBooking.trip.fareType || 'personal',
          flightInfo: existingBooking.trip.flightInfo || {
            hasFlight: false,
            airline: '',
            flightNumber: '',
            arrivalTime: '',
            terminal: ''
          },
          fare: existingBooking.trip.fare || null,
          baseFare: existingBooking.trip.baseFare || null,
          tipAmount: existingBooking.trip.tipAmount || 0,
          tipPercent: existingBooking.trip.tipPercent || 15,
          totalFare: existingBooking.trip.totalFare || 0
        },
        customer: {
          name: existingBooking.customer.name || '',
          email: existingBooking.customer.email || '',
          phone: existingBooking.customer.phone || '',
          notes: existingBooking.customer.notes || '',
          saveInfoForFuture: existingBooking.customer.saveInfoForFuture || false,
          smsOptIn: existingBooking.customer.smsOptIn ?? true
        },
        payment: {
          depositAmount: existingBooking.payment.depositAmount || null,
          balanceDue: existingBooking.payment.balanceDue || 0,
          depositPaid: existingBooking.payment.depositPaid || false,
          tipAmount: existingBooking.payment.tipAmount || 0,
          tipPercent: existingBooking.payment.tipPercent || 15,
          totalAmount: existingBooking.payment.totalAmount || 0
        }
      });
    }
  }, [existingBooking]);

  // Form data update functions
  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateTripDetails = useCallback((data: Partial<TripDetails>) => {
    setFormData(prev => ({
      ...prev,
      trip: { ...prev.trip, ...data }
    }));
    
    // Clear quote when trip details change (quote is tied to specific trip details)
    // This ensures users get a fresh quote when they change pickup/dropoff/date/time/fareType
    setCurrentQuote(null);
    
    // Clear any existing errors when user starts interacting
    setError(null);
    setHasAttemptedValidation(false); // Reset validation state so errors don't show
    // Don't set hasAttemptedValidation here - only when user tries to proceed
  }, []);

  const updateCustomerInfo = useCallback((data: Partial<CustomerInfo>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data }
    }));
    // Clear any existing errors when user starts interacting
    setError(null);
    setHasAttemptedValidation(false); // Reset validation state so errors don't show
    // Don't set hasAttemptedValidation here - only when user tries to proceed
  }, []);

  const updatePaymentInfo = useCallback((data: Partial<PaymentInfo>) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, ...data }
    }));
    // Clear any existing errors when user starts interacting
    setError(null);
    setHasAttemptedValidation(false); // Reset validation state so errors don't show
    // Don't set hasAttemptedValidation here - only when user tries to proceed
  }, []);

  // Validation helper functions
  const validateEmail = useCallback((email: string): boolean => {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const validateUSPhone = useCallback((phone: string): boolean => {
    if (!phone || !phone.trim()) return false;
    // Strip all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // US phone numbers: 10 digits, or 11 digits if starts with 1
    if (digitsOnly.length === 10) return true;
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return true;
    return false;
  }, []);

  // Validation logic - always runs validation, but only shows errors when hasAttemptedValidation is true
  const validateCurrentPhase = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string> = {};

    // Always run validation, but only show errors if user has attempted validation
    // This allows validation to work on button click while keeping errors hidden until user tries to proceed

    switch (currentPhase) {
      case 'trip-details':
        if (!formData.trip.pickup.address.trim()) {
          const errorMsg = 'Pickup location is required';
          errors.push(errorMsg);
          fieldErrors['pickup-location-input'] = errorMsg;
        } else if (formData.trip.pickup.coordinates === null) {
          const errorMsg = 'Please select pickup location from suggestions';
          errors.push(errorMsg);
          fieldErrors['pickup-location-input'] = errorMsg;
        }
        
        if (!formData.trip.dropoff.address.trim()) {
          const errorMsg = 'Dropoff location is required';
          errors.push(errorMsg);
          fieldErrors['dropoff-location-input'] = errorMsg;
        } else if (formData.trip.dropoff.coordinates === null) {
          const errorMsg = 'Please select dropoff location from suggestions';
          errors.push(errorMsg);
          fieldErrors['dropoff-location-input'] = errorMsg;
        }
        
        if (!formData.trip.pickupDateTime) {
          const errorMsg = 'Pickup date and time is required';
          errors.push(errorMsg);
          fieldErrors['pickup-datetime-input'] = errorMsg;
        } else {
          // Validate that pickup date/time is at least 24 hours in the future
          try {
            const pickupDate = new Date(formData.trip.pickupDateTime);
            const now = new Date();
            const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
            
            if (isNaN(pickupDate.getTime())) {
              const errorMsg = 'Invalid date/time format';
              errors.push(errorMsg);
              fieldErrors['pickup-datetime-input'] = errorMsg;
            } else if (pickupDate < minDateTime) {
              const errorMsg = 'Please book at least 24 hours in advance';
              errors.push(errorMsg);
              fieldErrors['pickup-datetime-input'] = errorMsg;
            }
          } catch (dateError) {
            const errorMsg = 'Invalid date/time format';
            errors.push(errorMsg);
            fieldErrors['pickup-datetime-input'] = errorMsg;
          }
        }
        
        // Check for quote
        if (!currentQuote) {
          const errorMsg = 'Please wait for fare calculation to complete';
          errors.push(errorMsg);
          warnings.push(errorMsg);
        }
        break;
        
      case 'contact-info':
        if (!formData.customer.name.trim()) {
          const errorMsg = 'Name is required';
          errors.push(errorMsg);
          fieldErrors['name-input'] = errorMsg;
        }
        
        if (!formData.customer.email.trim()) {
          const errorMsg = 'Email is required';
          errors.push(errorMsg);
          fieldErrors['email-input'] = errorMsg;
        } else if (!validateEmail(formData.customer.email)) {
          const errorMsg = 'Please enter a valid email address';
          errors.push(errorMsg);
          fieldErrors['email-input'] = errorMsg;
        }
        
        if (!formData.customer.phone.trim()) {
          const errorMsg = 'Phone number is required';
          errors.push(errorMsg);
          fieldErrors['phone-input'] = errorMsg;
        } else if (!validateUSPhone(formData.customer.phone)) {
          const errorMsg = 'Please enter a valid US phone number';
          errors.push(errorMsg);
          fieldErrors['phone-input'] = errorMsg;
        }
        break;
        
      case 'payment':
        // Check for quote before allowing submission
        if (!currentQuote) {
          const errorMsg = 'Please wait for fare calculation to complete';
          errors.push(errorMsg);
          warnings.push(errorMsg);
        }
        
        // Validate that all previous phase data is still present
        if (!formData.trip.pickup.address.trim() || formData.trip.pickup.coordinates === null) {
          const errorMsg = 'Pickup location is required';
          errors.push(errorMsg);
          fieldErrors['pickup-location-input'] = errorMsg;
        }
        
        if (!formData.trip.dropoff.address.trim() || formData.trip.dropoff.coordinates === null) {
          const errorMsg = 'Dropoff location is required';
          errors.push(errorMsg);
          fieldErrors['dropoff-location-input'] = errorMsg;
        }
        
        if (!formData.trip.pickupDateTime) {
          const errorMsg = 'Pickup date and time is required';
          errors.push(errorMsg);
          fieldErrors['pickup-datetime-input'] = errorMsg;
        }
        
        if (!formData.customer.name.trim()) {
          const errorMsg = 'Name is required';
          errors.push(errorMsg);
          fieldErrors['name-input'] = errorMsg;
        }
        
        if (!formData.customer.email.trim() || !validateEmail(formData.customer.email)) {
          const errorMsg = 'Valid email is required';
          errors.push(errorMsg);
          fieldErrors['email-input'] = errorMsg;
        }
        
        if (!formData.customer.phone.trim() || !validateUSPhone(formData.customer.phone)) {
          const errorMsg = 'Valid phone number is required';
          errors.push(errorMsg);
          fieldErrors['phone-input'] = errorMsg;
        }
        
        // Ensure fare is valid
        if (currentQuote && (!currentQuote.fare || currentQuote.fare <= 0)) {
          const errorMsg = 'Invalid fare amount';
          errors.push(errorMsg);
          warnings.push(errorMsg);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: hasAttemptedValidation ? errors : [], // Only show errors if user has attempted validation
      warnings: hasAttemptedValidation ? warnings : [], // Only show warnings if user has attempted validation
      fieldErrors: hasAttemptedValidation ? fieldErrors : {} // Only show field errors if user has attempted validation
    };
  }, [hasAttemptedValidation, currentPhase, formData, currentQuote, validateEmail, validateUSPhone]);

  // Phase management
  const goToPhase = useCallback((phase: BookingPhase) => {
    setCurrentPhase(phase);
  }, []);

  const goToNextPhase = useCallback(() => {
    setHasAttemptedValidation(true);
    const validation = validateCurrentPhase();
    
    if (validation.isValid) {
      // Move to next phase
      const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing', 'flight-info'];
      const currentIndex = phases.indexOf(currentPhase);
      if (currentIndex < phases.length - 1) {
        setCurrentPhase(phases[currentIndex + 1]);
      }
    } else {
      // Show errors and scroll to first error field or error message
      setError(validation.errors.join(', '));
      
      // On mobile, prioritize scrolling to the error message so user can see it
      // On desktop, scroll to the first error field
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      
      setTimeout(() => {
        if (isMobile) {
          // Try to find the error message element first (below the button)
          const errorMessageId = currentPhase === 'trip-details' 
            ? 'trip-details-error-message'
            : currentPhase === 'contact-info'
            ? 'contact-info-error-message'
            : currentPhase === 'payment'
            ? 'payment-validation-error-message'
            : null;
          
          if (errorMessageId) {
            const errorMessage = document.getElementById(errorMessageId) || 
                                document.querySelector(`[data-testid="${errorMessageId}"]`);
            if (errorMessage) {
              errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
          }
        }
        
        // Fallback: scroll to first error field
        if (validation.fieldErrors && Object.keys(validation.fieldErrors).length > 0) {
          const firstErrorFieldId = Object.keys(validation.fieldErrors)[0];
          const errorElement = document.getElementById(firstErrorFieldId) || 
                             document.querySelector(`[data-testid="${firstErrorFieldId}"]`) ||
                             document.querySelector(`[id="${firstErrorFieldId}"]`);
          
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Try to focus the input if it's focusable
            if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
              errorElement.focus();
            } else {
              // Try to find input inside the element
              const input = errorElement.querySelector('input, textarea, select');
              if (input && (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
                input.focus();
              }
            }
          }
        }
      }, 150); // Slightly longer delay to ensure DOM is updated
    }
  }, [currentPhase, validateCurrentPhase]);

  const goToPreviousPhase = useCallback(() => {
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing', 'flight-info'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  }, [currentPhase]);

  // Quick booking form validation - matches trip-details phase validation
  const validateQuickBookingForm = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string> = {};

    // Always run validation, but only show errors if user has attempted validation
    // This allows validation to work on button click while keeping errors hidden until user tries to proceed

    // Validate required fields - same as trip-details phase
    if (!formData.trip.pickup.address.trim()) {
      const errorMsg = 'Pickup location is required';
      errors.push(errorMsg);
      fieldErrors['pickup-location-input'] = errorMsg;
    } else if (formData.trip.pickup.coordinates === null) {
      const errorMsg = 'Please select pickup location from suggestions';
      errors.push(errorMsg);
      fieldErrors['pickup-location-input'] = errorMsg;
    }
    
    if (!formData.trip.dropoff.address.trim()) {
      const errorMsg = 'Dropoff location is required';
      errors.push(errorMsg);
      fieldErrors['dropoff-location-input'] = errorMsg;
    } else if (formData.trip.dropoff.coordinates === null) {
      const errorMsg = 'Please select dropoff location from suggestions';
      errors.push(errorMsg);
      fieldErrors['dropoff-location-input'] = errorMsg;
    }
    
    if (!formData.trip.pickupDateTime) {
      const errorMsg = 'Pickup date and time is required';
      errors.push(errorMsg);
      fieldErrors['pickup-datetime-input'] = errorMsg;
    } else {
      // Validate that pickup date/time is at least 24 hours in the future
      try {
        const pickupDate = new Date(formData.trip.pickupDateTime);
        const now = new Date();
        const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        if (isNaN(pickupDate.getTime())) {
          const errorMsg = 'Invalid date/time format';
          errors.push(errorMsg);
          fieldErrors['pickup-datetime-input'] = errorMsg;
        } else if (pickupDate < minDateTime) {
          const errorMsg = 'Please book at least 24 hours in advance';
          errors.push(errorMsg);
          fieldErrors['pickup-datetime-input'] = errorMsg;
        }
      } catch (dateError) {
        const errorMsg = 'Invalid date/time format';
        errors.push(errorMsg);
        fieldErrors['pickup-datetime-input'] = errorMsg;
      }
    }
    
    // Check for quote (optional for quick booking, but good to have)
    if (!currentQuote) {
      const errorMsg = 'Please wait for fare calculation to complete';
      warnings.push(errorMsg);
    }
    
    return {
      isValid: errors.length === 0,
      errors: hasAttemptedValidation ? errors : [], // Only show errors if user has attempted validation
      warnings: hasAttemptedValidation ? warnings : [], // Only show warnings if user has attempted validation
      fieldErrors: hasAttemptedValidation ? fieldErrors : {} // Only show field errors if user has attempted validation
    };
  };

  // Check if quick booking form is valid (for button state)
  const isQuickBookingFormValid = (): boolean => {
    return formData.trip.pickup.address.trim() !== '' &&
           formData.trip.dropoff.address.trim() !== '' &&
           formData.trip.pickupDateTime !== '' &&
           formData.trip.pickup.coordinates !== null &&
           formData.trip.dropoff.coordinates !== null;
  };

  // Check if contact info is complete (for button state)
  const isContactInfoComplete = (): boolean => {
    return formData.customer.name.trim() !== '' &&
           formData.customer.email.trim() !== '' &&
           formData.customer.phone.trim() !== '';
  };

  // Check if form has any data (for unsaved changes warning)
  const hasFormData = (): boolean => {
    return formData.trip.pickup.address.trim() !== '' ||
           formData.trip.dropoff.address.trim() !== '' ||
           formData.trip.pickupDateTime !== '' ||
           formData.customer.name.trim() !== '' ||
           formData.customer.email.trim() !== '' ||
           formData.customer.phone.trim() !== '';
  };

  // Clear all form errors
  const clearAllErrors = () => {
    setError(null);
    setHasAttemptedValidation(false);
    setWarning(null);
  };

  // Clear stored form data
  const clearStoredFormData = () => {
    sessionStorage.removeItem('booking-form-data');
  };

  const validateForm = (): ValidationResult => {
    setHasAttemptedValidation(true);
    return validateCurrentPhase();
  };

  // Form submission
  const submitForm = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const validation = validateForm();
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (existingBooking?.id) {
        await updateBooking(existingBooking.id, formData);
        setSuccess('Booking updated successfully!');
      } else {
        await createBooking(formData);
        setSuccess('Booking created successfully!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit booking using current quote (secure pricing)
  const submitBooking = async (exceptionCode?: string): Promise<{ success: boolean; newTotal?: number }> => {
    setIsSubmitting(true);
    setError(null);
    setWarning(null);
    setSuccess(null);

    // For exception bookings, skip quote validation
    if (!exceptionCode && !currentQuote) {
      setIsSubmitting(false);
      setError('Please get a quote before submitting booking.');
      return { success: false };
    }
    
    // For exception bookings, skip quote expiry check
    if (!exceptionCode && currentQuote) {
      // Check if quote has expired
      const now = new Date();
      const expiryDate = new Date(currentQuote.expiresAt);
      if (now > expiryDate) {
        setIsSubmitting(false);
        setError('Your quote has expired. Please get a new quote.');
        setCurrentQuote(null); // Clear expired quote
        return { success: false };
      }
    }

    try {
      // Ensure pickupDateTime is a full ISO string
      let pickupDateTime = formData.trip.pickupDateTime;
      if (pickupDateTime && !pickupDateTime.includes(':00.')) {
        // Convert from datetime-local format (YYYY-MM-DDTHH:mm) to full ISO
        pickupDateTime = new Date(pickupDateTime).toISOString();
      }

      const requestBody: any = {
        customer: formData.customer,
        trip: {
          ...formData.trip,
          pickupDateTime
        }
      };

      // Add exception code if provided (bypasses service area validation)
      if (exceptionCode) {
        requestBody.exceptionCode = exceptionCode;
        // For exception bookings, use fare from formData or currentQuote
        requestBody.fare = formData.trip.fare || currentQuote?.fare || 0;
      } else {
        // Normal booking requires quote
        if (!currentQuote) {
          setIsSubmitting(false);
          setError('Please get a quote before submitting booking.');
          return { success: false };
        }
        requestBody.quoteId = currentQuote.quoteId;
        requestBody.fare = currentQuote.fare;
      }

      const res = await authFetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to submit booking' }));
        
        // Handle specific errors
        if (data.code === 'QUOTE_EXPIRED' || data.code === 'QUOTE_NOT_FOUND') {
          setError('Your fare has expired. Please request a new quote.');
          return { success: false };
        }
        
        if (data.code === 'FARE_MISMATCH') {
          setError('Fare has changed. Please request a new quote.');
          return { success: false };
        }
        
        if (data.code === 'ROUTE_CHANGED') {
          setError('Trip details have changed. Please request a new quote.');
          return { success: false };
        }
        
        // Handle booking conflict/time slot errors
        const errorText = (data.details || data.error || '').toString();
        const fullErrorText = `${data.error || ''} ${errorText}`.trim();
        
        // Check for service area error codes
        const errorCode = data.code;
        if (errorCode === 'MISSING_AIRPORT_ENDPOINT') {
          const errorMsg = 'We currently only offer trips between Fairfield County, CT and airports. Please make sure either your pickup or dropoff is an airport (e.g. JFK, LGA, EWR, BDL, HVN, HPN).';
          setError(errorMsg);
          setIsSubmitting(false);
          return { success: false };
        } else if (errorCode === 'OUT_OF_SERVICE_SOFT') {
          const errorMsg = 'This trip is slightly outside our normal self-service area. Please call or text us to see if we can accommodate it.';
          setError(errorMsg);
          setIsSubmitting(false);
          return { success: false };
        } else if (errorCode === 'OUT_OF_SERVICE_HARD') {
          const errorMsg = "We focus on Fairfield County, CT and nearby airports, and we're not able to serve this route.";
          setError(errorMsg);
          setIsSubmitting(false);
          return { success: false };
        }
        
        // Check for conflict errors (case-insensitive, check both error and details)
        if (fullErrorText.match(/time slot conflicts|not available|conflicts with existing|already booked/i)) {
          // Extract suggested times - handle multiple formats:
          // "Suggested times: 05:15-07:15"
          // "Suggested times: 05:15-07:15, 08:00-10:00"
          // "05:15-07:15"
          const suggestedMatch = fullErrorText.match(/[Ss]uggested times?:?\s*([^\n.,]+)/i) || 
                                 fullErrorText.match(/(\d{1,2}:\d{2}-\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}-\d{1,2}:\d{2})*)/);
          const suggestedTimes = suggestedMatch ? suggestedMatch[1].trim() : '';
          
          const conflictMessage = suggestedTimes 
            ? `⚠️ This time slot is already booked. Suggested available times: ${suggestedTimes}. Please go back and select a different time.`
            : '⚠️ This time slot is already booked. Please go back and select a different time.';
          
          console.error('❌ [BOOKING] Time slot conflict detected:', {
            error: data.error,
            details: data.details,
            suggestedTimes,
            conflictMessage
          });
          
          setError(conflictMessage);
          setIsSubmitting(false);
          return { success: false };
        }
        
        // Show detailed error if available
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to submit booking');
        console.error('❌ [BOOKING] Submission failed:', {
          error: data.error,
          details: data.details,
          fullErrorText,
          errorMsg
        });
        setError(errorMsg);
        setIsSubmitting(false);
        return { success: false };
      }

      const responseData = await res.json();
      setCompletedBookingId(responseData.bookingId || null);
      if (responseData.emailWarning) {
        setWarning(responseData.emailWarning);
      }
      // Go to flight-info phase instead of showing success immediately
      setCurrentPhase('flight-info');
      return { success: true };
    } catch (_e) {
      const offlineMessage =
        'We can\'t confirm your booking right now because we\'re offline. Please check your connection and try again—your details are still in the form.';
      const connectivityMessage =
        'We couldn\'t reach our scheduling system, so your booking is not yet confirmed. Please try again shortly or text us so we can lock in your ride.';

      if (typeof navigator !== 'undefined' && navigator?.onLine === false) {
        setError(offlineMessage);
      } else {
        setError(connectivityMessage);
      }
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeFlightInfo = useCallback(() => {
    setSuccess('Booking submitted — confirm via email.');
    // Stay in flight-info phase but show success state
  }, []);
  

  // No need for quote validation - fare is always valid when current

  // Reset form
  const resetForm = () => {
    setFormData({
      trip: {
        pickup: { address: '', coordinates: null },
        dropoff: { address: '', coordinates: null },
        pickupDateTime: '',
        fareType: 'personal',
        flightInfo: {
          hasFlight: false,
          airline: '',
          flightNumber: '',
          arrivalTime: '',
          terminal: ''
        }
      },
      customer: {
        name: '',
        email: '',
        phone: '',
        notes: '',
        saveInfoForFuture: false,
        smsOptIn: false // Default unchecked for TCPA compliance (affirmative consent required)
      },
      payment: {
        depositAmount: null,
        balanceDue: 0,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 15,
        totalAmount: 0
      }
    });
    setCurrentQuote(null); // Clear quote on reset
    setCurrentPhase('trip-details');
    setWarning(null);
    setError(null);
    setSuccess(null);
    setHasAttemptedValidation(false);
    clearStoredFormData(); // Also clear stored data
  };

  // Submit quick booking form (for hero form)
  const submitQuickBookingForm = async () => {
    setHasAttemptedValidation(true);
    const validation = validateQuickBookingForm();
    
    if (validation.isValid) {
      // Navigate to booking page with form data
      // The form data is already in the provider, so we just need to navigate
      router.push('/book');
    } else {
      setError(validation.errors.join(', '));
      
      // On mobile, prioritize scrolling to the error message
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      
      setTimeout(() => {
        if (isMobile) {
          // Try to find the error message element first
          const errorMessage = document.getElementById('quick-book-validation-error') || 
                              document.querySelector(`[data-testid="quick-book-validation-error"]`);
          if (errorMessage) {
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        
        // Fallback: scroll to the first error field
        const firstErrorFieldId = validation.fieldErrors ? Object.keys(validation.fieldErrors)[0] : undefined;
        if (firstErrorFieldId) {
          // Map validation field IDs to actual DOM element IDs/data-testids
          const fieldIdMap: Record<string, string[]> = {
            'pickup-location-input': ['pickup-location', 'quick-book-pickup-input'],
            'dropoff-location-input': ['dropoff-location', 'quick-book-dropoff-input'],
            'pickup-datetime-input': ['pickup-datetime-date', 'pickup-datetime-time', 'quick-book-datetime-input'],
          };
          
          const possibleIds = fieldIdMap[firstErrorFieldId] || [firstErrorFieldId];
          let errorElement: HTMLElement | null = null;
          
          // Try to find the element by ID or data-testid
          for (const id of possibleIds) {
            errorElement = document.getElementById(id) || 
                          document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
            if (errorElement) break;
          }
          
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the input if it's focusable
            if (errorElement instanceof HTMLInputElement) {
              errorElement.focus();
            } else {
              // Try to find an input within the element
              const input = errorElement.querySelector('input');
              if (input) {
                input.focus();
              }
            }
          }
        }
      }, 150); // Slightly longer delay to ensure DOM is updated
    }
  };

  // Compute validation reactively
  const validation = useMemo(() => validateCurrentPhase(), [validateCurrentPhase]);

  // Create a new booking
  const createBooking = async (data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authFetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing booking
  const updateBooking = async (id: string, data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/booking/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a booking by ID
  const getBooking = async (id: string): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/booking/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a booking
  const deleteBooking = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/booking/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      if (currentBooking?.id === id) {
        setCurrentBooking(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time booking updates
  const subscribeToBooking = (id: string) => {
    // TODO: Implement real-time subscription
    console.log(`Subscribing to booking ${id}`);
  };

  // Unsubscribe from booking updates
  const unsubscribeFromBooking = (id: string) => {
    // TODO: Implement real-time unsubscription
    console.log(`Unsubscribing from booking ${id}`);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

const clearWarning = () => {
  setWarning(null);
};

  const value: BookingProviderType = {
    // Existing booking properties
    currentBooking,
    createBooking,
    updateBooking,
    getBooking,
    deleteBooking,
    subscribeToBooking,
    unsubscribeFromBooking,
    isLoading,
    error,
    warning,
    setCurrentBooking,
    setError,
    clearError,
    clearWarning,
    
    // New form properties
    formData,
    currentPhase,
    validation,
    hasAttemptedValidation,
    setHasAttemptedValidation,
    updateFormData,
    updateTripDetails,
    updateCustomerInfo,
    updatePaymentInfo,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    validateForm,
    validateCurrentPhase,
    validateQuickBookingForm,
    isQuickBookingFormValid,
    isContactInfoComplete,
    hasFormData,
    clearAllErrors,
    clearStoredFormData,
    submitForm,
    submitQuickBookingForm,
    resetForm,
    isSubmitting,
    success,
    completedBookingId,
    currentQuote,
    setQuote,
    submitBooking,
    completeFlightInfo,
    route,
    routeLoading,
    routeError,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingProviderType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
