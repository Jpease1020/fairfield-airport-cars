'use client';

import React from 'react';
import { StatusMessage, ToastProvider } from '@/ui';
import { BookingFormProvider as NewBookingFormProvider } from '@/contexts/BookingFormProvider';
import { BookingFormContainer } from '@/components/booking/BookingFormContainer';
import { BookingFormPhases } from '@/components/booking/BookingFormPhases';
import { useBookingForm } from '@/contexts/BookingFormProvider';

interface BookingFormProps {
  booking?: any;
  cmsData: any;
}

function BookingFormContent({ booking, cmsData }: BookingFormProps) {
  const { error, success } = useBookingForm();

  return (
    <BookingFormContainer>
      {/* Error and Success Messages */}
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          id="booking-error-message" 
          data-testid="booking-error-message" 
        />
      )}
      
      {success && (
        <StatusMessage 
          type="success" 
          message={success} 
          id="booking-success-message" 
          data-testid="booking-success-message" 
        />
      )}
      
      <BookingFormPhases cmsData={cmsData} />
    </BookingFormContainer>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <ToastProvider>
      <NewBookingFormProvider existingBooking={props.booking}>
        <BookingFormContent {...props} />
      </NewBookingFormProvider>
    </ToastProvider>
  );
}

