'use client';

import React from 'react';
import { Container, Stack, Form } from '@/ui';

interface BookingFormContainerProps {
  children: React.ReactNode;
}

export const BookingFormContainer: React.FC<BookingFormContainerProps> = ({ children }) => {
  return (
    <Container maxWidth="7xl" padding="xl" data-testid="booking-form-container">
      <Form onSubmit={(e) => e.preventDefault()} id="booking-form" data-testid="booking-form">
        <Stack spacing="xl" data-testid="booking-form-stack">
          {children}
        </Stack>
      </Form>
    </Container>
  );
};
