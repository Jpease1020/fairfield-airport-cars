'use client';

import React from 'react';
import { Container, Stack, H2, Text } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { useBooking } from '@/providers/BookingProvider';

import BookingForm from './booking-form';

function BookPageClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['customer-book'] || {};
  
  // Get current phase to conditionally show/hide header
  const { currentPhase } = useBooking();
  
  // Hide page header when on flight-info phase (it has its own header)
  const showPageHeader = currentPhase !== 'flight-info';

  return (
    <Container maxWidth="full" padding="xl" data-testid="book-form-section">
      <Stack align="center">
        {showPageHeader && (
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              cmsId="hero-title"
              
            >
              {pageCmsData?.['hero-title'] || 'Complete Your Booking'}
            </H2>
            <Text 
              variant="lead" 
              align="center" 
              cmsId="hero-subtitle"
              
            >
              {pageCmsData?.['hero-subtitle'] || 'Fill in your details below'}
            </Text>
          </Stack>
        )}
        <BookingForm cmsData={pageCmsData} />
      </Stack>
    </Container>
  );
}

export default BookPageClient;
