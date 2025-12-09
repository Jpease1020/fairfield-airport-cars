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
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

function DriverTrackingPageContent() {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  const params = useParams();
  const bookingId = (params?.bookingId as string | undefined) ?? '';
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/booking/get-bookings-simple?id=${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
        } else {
          setError('Failed to load booking details');
        }
      } catch (_err) {
        setError('Error loading booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading booking details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container>
        <Alert variant="error" title="Booking Not Found">
          The requested booking could not be found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        <Stack spacing="sm">
          <Link href="/admin/driver/tracking" variant="secondary" size="sm">
            ← Back to Driver Tracking
          </Link>
        </Stack>
        
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
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}

export default DriverTrackingPageContent;
