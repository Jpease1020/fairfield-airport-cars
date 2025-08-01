'use client';

import React from 'react';
import { Container, Stack, H2, Text } from '@/ui';
import BookingForm from './booking-form';

function BookPageContent() {
  return (
    <Container maxWidth="xl" padding="xl" data-testid="book-form-section">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H2 align="center">Complete Your Booking</H2>
          <Text variant="lead" align="center">Fill in your details below</Text>
        </Stack>
        <BookingForm />
      </Stack>
    </Container>
  );
}

export default BookPageContent;
