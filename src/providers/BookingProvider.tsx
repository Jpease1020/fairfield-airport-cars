'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFormData, BookingPhase, ValidationResult, TripDetails, CustomerInfo, PaymentInfo } from '@/types/booking';

interface BookingProviderType {
  // Current booking
  currentBooking: Booking | null;
  
  // Form state (replaces BookingFormProvider)
  formData: BookingFormData;
  currentPhase: BookingPhase;
  validation: ValidationResult;
  hasAttemptedValidation: boolean;
  
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
  success: string | null;
  
  // Fare management (simplified)
  currentFare: number | null;
  setFare: (fare: number | null) => void;
  submitBooking: () => Promise<{ success: boolean; newTotal?: number }>;
  
  // Helper functions
  setCurrentBooking: (booking: Booking | null) => void;
  clearError: () => void;
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
      },
      fare: null,
      baseFare: null,
      tipAmount: 0,
      tipPercent: 15,
      totalFare: 0
    },
    customer: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      saveInfoForFuture: false
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
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [currentFare, setCurrentFare] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Save form data to session storage only on manual save (to avoid infinite loops)
  // Removed automatic session storage save to prevent circular updates

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
          saveInfoForFuture: existingBooking.customer.saveInfoForFuture || false
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

  // Phase management
  const goToPhase = useCallback((phase: BookingPhase) => {
    setCurrentPhase(phase);
  }, []);

  const goToNextPhase = useCallback(() => {
    setHasAttemptedValidation(true);
    
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    }
  }, [currentPhase]);

  const goToPreviousPhase = useCallback(() => {
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  }, [currentPhase]);

  // Quick booking form validation
  const validateQuickBookingForm = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Only show validation errors if user has attempted validation
    if (!hasAttemptedValidation) {
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    // Validate required fields
    if (!formData.trip.pickup.address.trim()) {
      errors.push('Pickup location is required');
    }
    if (!formData.trip.dropoff.address.trim()) {
      errors.push('Dropoff location is required');
    }
    if (!formData.trip.pickupDateTime) {
      errors.push('Pickup date and time is required');
    }

    // Location validation
    if (formData.trip.pickup.address.trim() !== '' && formData.trip.pickup.coordinates === null) {
      errors.push('Please select pickup location from suggestions');
    }
    if (formData.trip.dropoff.address.trim() !== '' && formData.trip.dropoff.coordinates === null) {
      errors.push('Please select dropoff location from suggestions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
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
  };

  // Clear stored form data
  const clearStoredFormData = () => {
    sessionStorage.removeItem('booking-form-data');
  };

  // Validation logic (with hasAttemptedValidation check)
  const validateCurrentPhase = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Only show validation errors if user has attempted validation
    if (!hasAttemptedValidation) {
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    switch (currentPhase) {
      case 'trip-details':
        if (!formData.trip.pickup.address.trim()) {
          errors.push('Pickup location is required');
        }
        if (!formData.trip.dropoff.address.trim()) {
          errors.push('Dropoff location is required');
        }
        if (!formData.trip.pickupDateTime) {
          errors.push('Pickup date and time is required');
        }
        // Location validation
        if (formData.trip.pickup.address.trim() !== '' && formData.trip.pickup.coordinates === null) {
          errors.push('Please select pickup location from suggestions');
        }
        if (formData.trip.dropoff.address.trim() !== '' && formData.trip.dropoff.coordinates === null) {
          errors.push('Please select dropoff location from suggestions');
        }
        break;
        
      case 'contact-info':
        if (!formData.customer.name.trim()) {
          errors.push('Name is required');
        }
        if (!formData.customer.email.trim()) {
          errors.push('Email is required');
        }
        if (!formData.customer.phone.trim()) {
          errors.push('Phone number is required');
        }
        break;
        
      case 'payment':
        // No deposit required and no fare validation needed - just basic form validation
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
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
  const submitBooking = async (): Promise<{ success: boolean; newTotal?: number }> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!currentFare) {
      setIsSubmitting(false);
      setError('Please calculate fare before submitting booking.');
      return { success: false };
    }

    try {
      const res = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fare: currentFare,
          customer: formData.customer,
          trip: formData.trip
        })
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
        
        setError(data.error || 'Failed to submit booking');
        return { success: false };
      }

      setSuccess('Booking submitted successfully!');
      return { success: true };
    } catch (e) {
      setError('Network error while submitting booking');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };
  

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
        },
        fare: null,
        baseFare: null,
        tipAmount: 0,
        tipPercent: 15,
        totalFare: 0
      },
      customer: {
        name: '',
        email: '',
        phone: '',
        notes: '',
        saveInfoForFuture: false
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
    setCurrentPhase('trip-details');
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
    }
  };

  const validation = validateCurrentPhase();

  // Create a new booking
  const createBooking = async (data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/booking', {
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
      const response = await fetch(`/api/booking/${id}`, {
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
      const response = await fetch(`/api/booking/${id}`);
      
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
      const response = await fetch(`/api/booking/${id}`, {
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
    setCurrentBooking,
    clearError,
    
    // New form properties
    formData,
    currentPhase,
    validation,
    hasAttemptedValidation,
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
    hasFormData,
    clearAllErrors,
    clearStoredFormData,
    submitForm,
    submitQuickBookingForm,
    resetForm,
    isSubmitting,
    success,
    currentFare,
    setFare: setCurrentFare,
    submitBooking,
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
