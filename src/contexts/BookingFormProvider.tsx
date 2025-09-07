'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from './LocationContext';
import { useBooking } from './BookingProvider';
import { BookingFormData, BookingPhase, ValidationResult, TripDetails, CustomerInfo, PaymentInfo, Booking } from '@/types/booking';

interface BookingFormProviderType {
  // Form state
  formData: BookingFormData;
  currentPhase: BookingPhase;
  validation: ValidationResult;
  
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
  
  // Loading states
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

const BookingFormContext = createContext<BookingFormProviderType | undefined>(undefined);

interface BookingFormProviderProps {
  children: ReactNode;
  existingBooking?: Booking; // For editing existing bookings
}

export const BookingFormProvider: React.FC<BookingFormProviderProps> = ({ 
  children, 
  existingBooking 
}) => {
  const { locationData, isLocationValid, locationErrors } = useLocation();
  const { createBooking, updateBooking } = useBooking();
  
  // Form state
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with existing booking
  useEffect(() => {
    if (existingBooking) {
      // Load existing booking data
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

  // Sync with location context
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      trip: {
        ...prev.trip,
        pickup: locationData.pickup,
        dropoff: locationData.dropoff
      }
    }));
  }, [locationData]);

  // Update form data
  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateTripDetails = (data: Partial<TripDetails>) => {
    setFormData(prev => ({
      ...prev,
      trip: { ...prev.trip, ...data }
    }));
  };

  const updateCustomerInfo = (data: Partial<CustomerInfo>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data }
    }));
  };

  const updatePaymentInfo = (data: Partial<PaymentInfo>) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, ...data }
    }));
  };

  // Phase management
  const goToPhase = (phase: BookingPhase) => {
    setCurrentPhase(phase);
  };

  const goToNextPhase = () => {
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

  // Validation
  const validateCurrentPhase = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

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
        if (!isLocationValid) {
          errors.push(...locationErrors);
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
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate all phases
    const tripValidation = validateCurrentPhase();
    if (currentPhase === 'trip-details') {
      errors.push(...tripValidation.errors);
      warnings.push(...tripValidation.warnings);
    }

    // Add other phase validations as needed
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
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
  };

  const validation = validateCurrentPhase();

  const value: BookingFormProviderType = {
    formData,
    currentPhase,
    validation,
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
    error,
    success,
  };

  return (
    <BookingFormContext.Provider value={value}>
      {children}
    </BookingFormContext.Provider>
  );
};

export const useBookingForm = (): BookingFormProviderType => {
  const context = useContext(BookingFormContext);
  if (context === undefined) {
    throw new Error('useBookingForm must be used within a BookingFormProvider');
  }
  return context;
};
