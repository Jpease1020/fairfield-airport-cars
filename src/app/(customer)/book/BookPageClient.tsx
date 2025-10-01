'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Stack, H2, Text } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

import BookingForm from './booking-form';

function BookPageClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['customer-book'] || {};
  
  // Get URL parameters
  const searchParams = useSearchParams();
  
  // Initialize form data from URL parameters
  useEffect(() => {
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    // Store date and time in sessionStorage for the booking form to use
    if (date) {
      sessionStorage.setItem('booking-pickup-date', date);
    }
    if (time) {
      sessionStorage.setItem('booking-pickup-time', time);
    }
  }, [searchParams]);

  return (
    <Container maxWidth="full" padding="xl" data-testid="book-form-section">
      <Stack spacing="xl" align="center">
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
        <BookingForm cmsData={pageCmsData} />
      </Stack>
    </Container>
  );
}

export default BookPageClient;
