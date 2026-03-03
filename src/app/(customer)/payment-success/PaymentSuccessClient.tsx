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
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { authFetch } from '@/lib/utils/auth-fetch';

export default function PaymentSuccessClient() {  
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.customer || {};
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
        
        const pickupAddress =
          bookingData?.trip?.pickup?.address || bookingData.pickupLocation || '';
        const dropoffAddress =
          bookingData?.trip?.dropoff?.address || bookingData.dropoffLocation || '';
        const pickupDateTime =
          bookingData?.trip?.pickupDateTime || bookingData.pickupDateTime || '';
        const fare =
          bookingData?.trip?.fare || bookingData.fare || bookingData.totalAmount || 0;

        // Create the actual booking now that payment is confirmed.
        // This uses the canonical submit endpoint and does not rely on deprecated /api/booking.
        const response = await authFetch('/api/booking/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: bookingData.quoteId,
            exceptionCode: bookingData.exceptionCode,
            fare,
            customer: {
              name: bookingData?.customer?.name || bookingData.name || '',
              email: bookingData?.customer?.email || bookingData.email || '',
              phone: bookingData?.customer?.phone || bookingData.phone || '',
              notes: bookingData?.customer?.notes || bookingData.notes || '',
              smsOptIn: bookingData?.customer?.smsOptIn ?? false,
            },
            trip: {
              pickup: {
                address: pickupAddress,
                coordinates: bookingData?.trip?.pickup?.coordinates || null,
              },
              dropoff: {
                address: dropoffAddress,
                coordinates: bookingData?.trip?.dropoff?.coordinates || null,
              },
              pickupDateTime,
              fareType: bookingData?.trip?.fareType || bookingData.fareType || 'personal',
              flightInfo: bookingData?.trip?.flightInfo || bookingData.flightInfo || {
                hasFlight: false,
                airline: '',
                flightNumber: '',
                arrivalTime: '',
                terminal: '',
              },
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to create booking');
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
    const source = searchParams?.get('source');
    const _urlBookingId = searchParams?.get('bookingId');
    
    if (source === 'square') {
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
          <H1 align="center">
              {cmsData?.['title'] || 'Processing Your Payment...'}
          </H1>
          <Text align="center">
            {cmsData?.['description'] || 'Please wait while we confirm your payment and create your booking.'}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <H1 align="center">
            {cmsData?.['title'] || 'Payment Processing Error'}
          </H1>
          <Text align="center">
            {error || cmsData?.['description'] || 'There was an error processing your payment.'}
          </Text>
          <Button onClick={() => router.push('/book')} variant="primary"  text={cmsData?.['tryAgain'] || 'Try Again'}/>
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
        
        <H1 align="center">
          {cmsData?.['success-title'] || 'Payment Successful!'}
        </H1>
        
        <Text align="center">
          {cmsData?.['success-description'] || 'Your deposit has been processed and your booking is confirmed.'}
        </Text>

        {bookingId && (
          <Box variant="outlined" padding="lg">
            <Stack spacing="sm">
              <Text weight="bold">
                {cmsData?.['success-booking-id'] || 'Booking ID:'}
              </Text>
              <Text size="lg" variant="body">{bookingId}</Text>
            </Stack>
          </Box>
        )}

        <Stack direction="horizontal" spacing="md">
          <Button 
            onClick={() => {
              if (bookingId) {
                router.push(`/tracking/${bookingId}`);
              } else {
                console.error('No bookingId available for tracking');
              }
            }} 
            variant="primary" 
 
             
            text={cmsData?.['track-ride'] || 'Track My Ride'}
          />
          
          <Button 
            onClick={() => {
              router.push('/bookings');
            }} 
            variant="secondary" 
 
             
            text={cmsData?.['view-bookings'] || 'View All Bookings'} 
          />
        </Stack>
      </Stack>
    </Container>
  );
}
