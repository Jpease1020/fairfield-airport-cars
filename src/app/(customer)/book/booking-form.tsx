'use client';

import React from 'react';
import { StatusMessage, ToastProvider } from '@/ui';
import { BookingProvider } from '@/providers/BookingProvider';
import { BookingFormContainer } from '@/components/booking/BookingFormContainer';
import { BookingFormPhases } from '@/components/booking/BookingFormPhases';
import { useBooking } from '@/providers/BookingProvider';

interface BookingFormProps {
  booking?: any;
  cmsData: any;
}

function BookingFormContent({ booking, cmsData }: BookingFormProps) {
  const { error, success } = useBooking();

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
      <BookingProvider existingBooking={props.booking}>
        <BookingFormContent {...props} />
      </BookingProvider>
    </ToastProvider>
  );
}

