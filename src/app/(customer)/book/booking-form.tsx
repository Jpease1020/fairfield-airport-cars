'use client';

import React from 'react';
import { StatusMessage, ToastProvider, Container, Stack, Form } from '@/ui';
import { BookingFormPhases } from '@/components/booking/BookingFormPhases';
import { useBooking } from '@/providers/BookingProvider';

interface BookingFormProps {
  booking?: any;
  cmsData: any;
}

function BookingFormContent({ booking, cmsData }: BookingFormProps) {
  const { error, success } = useBooking();

  return (
    <Container maxWidth="7xl" padding="xl" data-testid="booking-form-container">
      <Form onSubmit={(e) => e.preventDefault()} id="booking-form" data-testid="booking-form">
        <Stack spacing="xl" data-testid="booking-form-stack">
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
        </Stack>
      </Form>
    </Container>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <ToastProvider>
      <BookingFormContent {...props} />
    </ToastProvider>
  );
}

