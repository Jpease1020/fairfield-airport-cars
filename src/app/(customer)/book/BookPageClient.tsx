'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Stack, H2, Text } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { useBooking } from '@/providers/BookingProvider';

import BookingForm from './booking-form';

function BookPageClient() {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['customer-book'] || {};
  const { currentPhase, updateTripDetails, success } = useBooking();
  const showPageHeader = currentPhase !== 'flight-info';
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const pickup = searchParams.get('pickup');
    const dropoff = searchParams.get('dropoff');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    if (pickup || dropoff) {
      updateTripDetails({
        ...(pickup && { pickup: { address: pickup, coordinates: null } }),
        ...(dropoff && { dropoff: { address: dropoff, coordinates: null } }),
      });
    }
    if (date) sessionStorage.setItem('booking-pickup-date', date);
    if (time) sessionStorage.setItem('booking-pickup-time', time);
  }, [searchParams, updateTripDetails]);

  return (
    <Container maxWidth="full" padding="xl" data-testid="book-form-section">
      <Stack align="center">
        {showPageHeader && (
          <Stack spacing="md" align="center">
            <H2 align="center">
              {success
                ? (pageCmsData?.['booking-confirmed-page-title'] || 'Booking confirmed')
                : (pageCmsData?.['hero-title'] || 'Complete Your Booking')}
            </H2>
            <Text variant="lead" align="center">
              {success
                ? (pageCmsData?.['booking-confirmed-page-subtitle'] || 'Check your email to finalize your ride.')
                : (pageCmsData?.['hero-subtitle'] || 'Fill in your details below')}
            </Text>
          </Stack>
        )}
        <BookingForm cmsData={pageCmsData} />
      </Stack>
    </Container>
  );
}

export default BookPageClient;
