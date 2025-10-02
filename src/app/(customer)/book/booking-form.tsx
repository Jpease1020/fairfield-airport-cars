'use client';

import React from 'react';
import styled from 'styled-components';
import { StatusMessage, ToastProvider, Container, Stack, Form } from '@/ui';
import { BookingFormPhases } from '@/components/booking/BookingFormPhases';
import { useBooking } from '@/providers/BookingProvider';

// Styled container that removes max-width and padding on mobile
const BookingFormContainer = styled(Container)`
  @media (max-width: 768px) {
    max-width: none !important;
    padding: 0 !important;
  }
`;

interface BookingFormProps {
  booking?: any;
  cmsData: any;
}

function BookingFormContent({ booking, cmsData }: BookingFormProps) {
  const { error, success } = useBooking();

  return (
    <BookingFormContainer maxWidth="7xl" padding="xl" data-testid="booking-form-container">
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
    </BookingFormContainer>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <ToastProvider>
      <BookingFormContent {...props} />
    </ToastProvider>
  );
}

