'use client';

import React from 'react';
import { useBooking } from '@/providers/BookingProvider';
import { TripDetailsPhase } from './TripDetailsPhase';
import { ContactInfoPhase } from './ContactInfoPhase';
import { PaymentPhase } from './PaymentPhase';
import { BookingSuccessConfirmation } from './BookingSuccessConfirmation';

interface BookingFormPhasesProps {
  cmsData: any;
}

export const BookingFormPhases: React.FC<BookingFormPhasesProps> = ({ cmsData }) => {
  const {
    currentPhase,
    formData,
    validation,
    goToNextPhase,
    goToPreviousPhase,
    updateTripDetails,
    updateCustomerInfo,
    updatePaymentInfo,
    isSubmitting,
    error,
    success
  } = useBooking();

  // Extract data from formData for easier access
  const { trip, customer, payment } = formData;

  return (
    <>
      {/* Phase 1: Trip Details */}
      {currentPhase === 'trip-details' && (
        <TripDetailsPhase
          cmsData={cmsData}
        />
      )}

      {/* Phase 2: Contact Info Collection */}
      {currentPhase === 'contact-info' && (
        <ContactInfoPhase
          customerData={customer}
          onCustomerUpdate={updateCustomerInfo}
          onBack={goToPreviousPhase}
          onContinue={goToNextPhase}
          validation={validation}
          cmsData={cmsData}
        />
      )}

      {/* Phase 3: Payment */}
      {currentPhase === 'payment' && (
        <PaymentPhase
          cmsData={cmsData}
        />
      )}

      {/* Success Confirmation Page */}
      {success && (
        <BookingSuccessConfirmation
          pickupLocation={trip.pickup.address}
          dropoffLocation={trip.dropoff.address}
          pickupDateTime={trip.pickupDateTime}
          fare={trip.fare}
          tipAmount={payment.tipAmount}
          depositAmount={payment.depositAmount}
          completedBookingId={null}
          cmsData={cmsData}
        />
      )}
    </>
  );
};
