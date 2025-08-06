'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DriverTrackingInterface } from '@/components/business/DriverTrackingInterface';
import { 
  Container, 
  Stack, 
  Text, 
  LoadingSpinner,
  Alert,
  Link
} from '@/ui';

function DriverTrackingPageContent() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/booking/get-booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
        } else {
          setError('Failed to load booking details');
        }
      } catch (error) {
        console.error('Error loading booking details:', error);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading booking details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
          <Text>
            <Link href="/admin/drivers" variant="primary">
              Back to Driver Dashboard
            </Link>
          </Text>
        </Stack>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>Booking not found</Text>
          </Alert>
          <Text>
            <Link href="/admin/drivers" variant="primary">
              Back to Driver Dashboard
            </Link>
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="lg" maxWidth="xl">
      <Stack spacing="lg">
        <Text variant="h2">Driver Tracking</Text>
        <Text variant="lead">
          Booking #{bookingId} - {bookingDetails.name}
        </Text>
        
        <DriverTrackingInterface
          bookingId={bookingId}
          driverName={bookingDetails.driverName || 'Driver'}
          driverId={bookingDetails.driverId || 'driver-1'}
          pickupLocation={bookingDetails.pickupLocation}
          dropoffLocation={bookingDetails.dropoffLocation}
        />
      </Stack>
    </Container>
  );
}

export default function DriverTrackingPage() {
  return <DriverTrackingPageContent />;
} 