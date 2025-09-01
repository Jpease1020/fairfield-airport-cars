'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Box, 
  Text, 
  H1, 
  Button, 
  LoadingSpinner,
} from '@/ui';
import { getCMSField } from '@/design/hooks/useCMSData';

interface PaymentSuccessClientProps {
  cmsData: any;
}

export default function PaymentSuccessClient({ cmsData }: PaymentSuccessClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Get the pending booking data from session storage
        const pendingBookingData = sessionStorage.getItem('pendingBooking');
        if (!pendingBookingData) {
          setError('No pending booking found. Please start over.');
          setStatus('error');
          return;
        }

        const bookingData = JSON.parse(pendingBookingData);
        
        // Create the actual booking now that payment is confirmed
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            pickupLocation: bookingData.pickupLocation,
            dropoffLocation: bookingData.dropoffLocation,
            pickupDateTime: bookingData.pickupDateTime,
            notes: bookingData.notes,
            fare: bookingData.fare,
            tipAmount: bookingData.tipAmount,
            tipPercent: bookingData.tipPercent,
            totalAmount: bookingData.totalAmount,
            flightInfo: bookingData.flightInfo,
            fareType: bookingData.fareType,
            saveInfoForFuture: bookingData.saveInfoForFuture,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create booking');
        }

        const data = await response.json();
        setBookingId(data.bookingId);
        
        // Clear the pending booking data
        sessionStorage.removeItem('pendingBooking');
        
        setStatus('success');
      } catch (err) {
        console.error('Error processing payment success:', err);
        setError('Failed to complete booking. Please contact support.');
        setStatus('error');
      }
    };

    // Check if this is a return from Square payment
    const source = searchParams.get('source');
    const urlBookingId = searchParams.get('bookingId');
    
    if (source === 'square') {
      // If we have a bookingId from URL, we can use that for reference
      if (urlBookingId) {
        console.log('Payment completed for booking:', urlBookingId);
      }
      processPaymentSuccess();
    } else {
      // If not from Square, redirect to booking page
      router.push('/book');
    }
  }, [router, searchParams]);

  if (status === 'processing') {
    return (
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <H1 align="center" data-cms-id="processing-title">
            {getCMSField(cmsData, 'title', 'Processing Your Payment...')}
          </H1>
          <Text align="center" data-cms-id="processing-description">
            {getCMSField(cmsData, 'description', 'Please wait while we confirm your payment and create your booking.')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <H1 align="center" data-cms-id="error-title">
            {getCMSField(cmsData, 'title', 'Payment Processing Error')}
          </H1>
          <Text align="center" data-cms-id="error-description">
            {error || getCMSField(cmsData, 'description', 'There was an error processing your payment.')}
          </Text>
          <Button onClick={() => router.push('/book')} variant="primary">
            {getCMSField(cmsData, 'tryAgain', 'Try Again')}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="2xl" padding="xl">
      <Stack spacing="xl" align="center">
        <Box variant="filled" padding="xl">
          <Text size="xl">✅</Text>
        </Box>
        
        <H1 align="center" data-cms-id="success-title">
          {getCMSField(cmsData, 'title', 'Payment Successful!')}
        </H1>
        
        <Text align="center" data-cms-id="success-description">
          {getCMSField(cmsData, 'description', 'Your deposit has been processed and your booking is confirmed.')}
        </Text>

        {bookingId && (
          <Box variant="outlined" padding="lg">
            <Stack spacing="sm">
              <Text weight="bold" data-cms-id="success-booking-id">
                {getCMSField(cmsData, 'bookingId', 'Booking ID:')}
              </Text>
              <Text size="lg" variant="body">{bookingId}</Text>
            </Stack>
          </Box>
        )}

        <Stack direction="horizontal" spacing="md">
          <Button onClick={() => router.push(`/tracking/${bookingId}`)} variant="primary">
            {getCMSField(cmsData, 'trackRide', 'Track My Ride')}
          </Button>
          
          <Button onClick={() => router.push('/bookings')} variant="secondary">
            {getCMSField(cmsData, 'viewBookings', 'View All Bookings')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
