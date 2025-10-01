'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
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
  
  // Form submission
  submitForm: () => Promise<void>;
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
  const searchParams = useSearchParams();
  
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

  // Initialize form data from URL parameters (replaces LocationContext functionality)
  useEffect(() => {
    const pickup = searchParams.get('pickup');
    const dropoff = searchParams.get('dropoff');
    const storedDate = sessionStorage.getItem('booking-pickup-date');
    const storedTime = sessionStorage.getItem('booking-pickup-time');
    
    if (pickup) {
      setFormData(prev => ({
        ...prev,
        trip: {
          ...prev.trip,
          pickup: { ...prev.trip.pickup, address: pickup }
        }
      }));
    }
    
    if (dropoff) {
      setFormData(prev => ({
        ...prev,
        trip: {
          ...prev.trip,
          dropoff: { ...prev.trip.dropoff, address: dropoff }
        }
      }));
    }
    
    if (storedDate && storedTime) {
      const pickupDateTime = `${storedDate}T${storedTime}`;
      setFormData(prev => ({
        ...prev,
        trip: {
          ...prev.trip,
          pickupDateTime
        }
      }));
      
      // Clear the stored values after using them
      sessionStorage.removeItem('booking-pickup-date');
      sessionStorage.removeItem('booking-pickup-time');
    }
  }, [searchParams]);

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

  const updateTripDetails = (data: Partial<TripDetails>) => {
    setFormData(prev => ({
      ...prev,
      trip: { ...prev.trip, ...data }
    }));
    setHasAttemptedValidation(true);
  };

  const updateCustomerInfo = (data: Partial<CustomerInfo>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data }
    }));
    setHasAttemptedValidation(true);
  };

  const updatePaymentInfo = (data: Partial<PaymentInfo>) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, ...data }
    }));
    setHasAttemptedValidation(true);
  };

  // Phase management
  const goToPhase = (phase: BookingPhase) => {
    setCurrentPhase(phase);
  };

  const goToNextPhase = () => {
    setHasAttemptedValidation(true);
    
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    }
  };

  const goToPreviousPhase = () => {
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
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
        if (!formData.payment.depositAmount) {
          errors.push('Deposit amount is required');
        }
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
    submitForm,
    resetForm,
    isSubmitting,
    success,
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
