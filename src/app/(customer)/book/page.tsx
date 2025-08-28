'use client';

import React from 'react';
import { Container, Stack, H2, Text } from '@/design/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import BookingForm from './booking-form';

function BookPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  return (
    <Container maxWidth="full" padding="xl" data-testid="book-form-section">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H2 
            align="center" 
            data-cms-id="hero-title"
            mode={mode}
          >
            {getCMSField(cmsData, 'hero-title', 'Complete Your Booking')}
          </H2>
          <Text 
            variant="lead" 
            align="center" 
            data-cms-id="hero-subtitle"
            mode={mode}
          >
            {getCMSField(cmsData, 'hero-subtitle', 'Fill in your details below')}
          </Text>
        </Stack>
        <BookingForm />
      </Stack>
    </Container>
  );
}

export default BookPageContent;
