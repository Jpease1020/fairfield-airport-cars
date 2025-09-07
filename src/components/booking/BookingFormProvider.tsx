'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useBookingForm } from '@/hooks/useBookingForm';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';

interface BookingFormContextType {
  // State
  currentPhase: string;
  showPaymentForm: boolean;
  bookingId: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: any;
  dropoffCoords: any;
  pickupDateTime: string;
  fareType: string;
  flightInfo: any;
  fare: number | null;
  baseFare: number | null;
  tipAmount: number;
  tipPercent: number;
  depositAmount: number | null;
  isProcessingPayment: boolean;
  paymentError: string | null;
  name: string;
  email: string;
  phone: string;
  notes: string;
  saveInfoForFuture: boolean;
  isCalculating: boolean;
  error: string | null;
  success: string | null;

  // Setters
  setPickupLocation: (value: string) => void;
  setDropoffLocation: (value: string) => void;
  setPickupCoords: (value: any) => void;
  setDropoffCoords: (value: any) => void;
  setPickupDateTime: (value: string) => void;
  setFareType: (value: 'personal' | 'business') => void;
  setFlightInfo: (value: any) => void;
  setFare: (value: number | null) => void;
  setBaseFare: (value: number | null) => void;
  setTipAmount: (value: number) => void;
  setTipPercent: (value: number) => void;
  setDepositAmount: (value: number | null) => void;
  setIsProcessingPayment: (value: boolean) => void;
  setPaymentError: (value: string | null) => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setNotes: (value: string) => void;
  setSaveInfoForFuture: (value: boolean) => void;
  setIsCalculating: (value: boolean) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
  setShowPaymentForm: (value: boolean) => void;
  setBookingId: (value: string | null) => void;

  // Computed values
  getTotalFare: () => number;
  calculateDeposit: (fareAmount: number) => number;

  // Actions
  handleTipChange: (amount: number, percent: number) => void;
  goToPhase: (phase: 'trip-details' | 'contact-info' | 'payment') => void;
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  resetForm: () => void;

  // Payment processing
  createBooking: any;
  processPayment: any;
  handleProcessPayment: () => Promise<void>;
  processPaymentFunction: (() => Promise<void>) | null;
  setProcessPaymentFunction: (fn: (() => Promise<void>) | null) => void;
  isBookingComplete: boolean;
  setIsBookingComplete: (value: boolean) => void;
  completedBookingId: string | null;
  setCompletedBookingId: (value: string | null) => void;
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined);

export const useBookingFormContext = () => {
  const context = useContext(BookingFormContext);
  if (!context) {
    throw new Error('useBookingFormContext must be used within a BookingFormProvider');
  }
  return context;
};

interface BookingFormProviderProps {
  children: ReactNode;
  booking?: any;
}

export const BookingFormProvider: React.FC<BookingFormProviderProps> = ({ children, booking }) => {
  const bookingForm = useBookingForm();
  
  // Payment processing hook
  const { processPayment } = usePaymentProcessing({
    onSuccess: (result: any) => {
      console.log('Payment successful:', result);
      bookingForm.setSuccess('Payment processed successfully! Your booking is confirmed.');
    },
    onError: (error: string) => {
      console.error('Payment error:', error);
      bookingForm.setPaymentError(error);
    }
  });

  // Store the payment processing function from SquarePaymentForm
  const [processPaymentFunction, setProcessPaymentFunction] = React.useState<(() => Promise<void>) | null>(null);

  // State for successful booking
  const [isBookingComplete, setIsBookingComplete] = React.useState(false);
  const [completedBookingId, setCompletedBookingId] = React.useState<string | null>(null);

  // Handle payment processing
  const handleProcessPayment = async () => {
    try {
      bookingForm.setIsProcessingPayment(true);
      bookingForm.setError(null);
      
      // First collect the payment token from Square form
      if (!processPaymentFunction) {
        throw new Error('Payment system not ready. Please wait a moment and try again.');
      }
      
      console.log('🎯 Starting atomic booking + payment process...');
      
      // Process payment through SquarePaymentForm - this will create booking AND process payment
      await processPaymentFunction();
      
      console.log('✅ Atomic booking + payment completed successfully');
      
      // Mark booking as complete
      setIsBookingComplete(true);
      
    } catch (error) {
      console.error('Atomic booking + payment failed:', error);
      bookingForm.setError(error instanceof Error ? error.message : 'Failed to create booking and process payment. Please try again.');
    } finally {
      bookingForm.setIsProcessingPayment(false);
    }
  };

  const contextValue: BookingFormContextType = {
    ...bookingForm,
    createBooking: async () => {
      // This will be implemented when we integrate with the booking service
      throw new Error('createBooking not implemented yet');
    },
    processPayment,
    handleProcessPayment,
    processPaymentFunction,
    setProcessPaymentFunction,
    isBookingComplete,
    setIsBookingComplete,
    completedBookingId,
    setCompletedBookingId,
  };

  return (
    <BookingFormContext.Provider value={contextValue}>
      {children}
    </BookingFormContext.Provider>
  );
};
