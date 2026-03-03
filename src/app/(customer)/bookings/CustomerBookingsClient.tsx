'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { authFetch } from '@/lib/utils/auth-fetch';
import {
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  Alert,
  Badge,
  Box,
  H1,
  ContentCard,
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface Booking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  fare: number;
  driverName?: string;
  vehicleInfo?: string;
  createdAt: string;
  balanceDue?: number;
}

type AuthMode = 'session' | 'firebase' | 'none';

export default function CustomerBookingsClient() {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['customer-bookings'] || {};
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    const transformBookings = (data: any[]): Booking[] =>
      data.map((booking: any) => ({
        id: booking.id,
        pickupLocation: booking.trip?.pickup?.address || booking.pickupLocation || 'N/A',
        dropoffLocation: booking.trip?.dropoff?.address || booking.dropoffLocation || 'N/A',
        pickupDateTime: booking.trip?.pickupDateTime || booking.pickupDateTime || '',
        status: booking.status || 'pending',
        fare: booking.trip?.fare || booking.fare || 0,
        driverName: booking.driverName || booking.driver?.name,
        vehicleInfo: booking.vehicleInfo || booking.driver?.vehicleInfo,
        createdAt: booking.createdAt || '',
        balanceDue: booking.balanceDue,
      }));

    const loadBookings = async () => {
      try {
        const response = await authFetch('/api/booking/get-customer-bookings');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.success && Array.isArray(data.bookings)) {
            setBookings(transformBookings(data.bookings));
            setAuthMode('session');
            setLoading(false);
            return;
          }
        }

        if (response.status && response.status !== 401) {
          throw new Error('Failed to fetch bookings');
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load bookings');
          setLoading(false);
        }
        return;
      }

      unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
        if (!isMounted) return;
        if (!firebaseUser) {
          setAuthMode('none');
          setLoading(false);
          return;
        }

        try {
          const response = await authFetch('/api/booking/get-customer-bookings');
          if (!response.ok) {
            throw new Error('Failed to fetch bookings');
          }

          const data = await response.json();
          if (data.success && Array.isArray(data.bookings)) {
            setBookings(transformBookings(data.bookings));
            setAuthMode('firebase');
          }
        } catch (error) {
          setError('Failed to load bookings');
        } finally {
          setLoading(false);
        }
      });
    };

    loadBookings();

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'confirmed':
        return 'confirmed';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleBookNewRide = () => {
    router.push('/book');
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{pageCmsData?.['initializing'] || 'Initializing bookings...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{pageCmsData?.['loading-bookings'] || 'Loading your bookings...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (authMode === 'none') {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Access your bookings with a secure link or code.</Text>
          <Button onClick={() => router.push('/find-booking')}>Find My Booking</Button>
          <Button onClick={() => router.push('/auth/login')} variant="outline">
            Admin Login
          </Button>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl">
        <Stack spacing="md">
          <H1>{pageCmsData?.['bookings-title'] || 'My Bookings'}</H1>
          <Text variant="muted">
            {pageCmsData?.['bookings-description'] || 'View and manage your upcoming and past rides.'}
          </Text>
        </Stack>

        {bookings.length === 0 ? (
          <Box variant="outlined" padding="lg">
            <Stack spacing="md" align="center">
              <Text>{pageCmsData?.['no-bookings'] || 'No bookings found.'}</Text>
              <Button onClick={handleBookNewRide}>{pageCmsData?.['book-new-ride'] || 'Book a Ride'}</Button>
            </Stack>
          </Box>
        ) : (
          <Stack spacing="lg">
            {bookings.map((booking) => (
              <ContentCard
                key={booking.id}
                padding="lg"
                content={
                  <Stack spacing="md">
                    <Stack direction="horizontal" spacing="md" align="center" justify="space-between">
                      <Text weight="bold">Booking #{booking.id}</Text>
                      <Badge variant={getStatusVariant(booking.status)}>{getStatusText(booking.status)}</Badge>
                    </Stack>

                    <Stack spacing="sm">
                      <Text><strong>Pickup:</strong> {booking.pickupLocation}</Text>
                      <Text><strong>Dropoff:</strong> {booking.dropoffLocation}</Text>
                      <Text><strong>Pickup Time:</strong> {booking.pickupDateTime || 'TBD'}</Text>
                      {booking.driverName && (
                        <Text><strong>Driver:</strong> {booking.driverName}</Text>
                      )}
                      {booking.vehicleInfo && (
                        <Text><strong>Vehicle:</strong> {booking.vehicleInfo}</Text>
                      )}
                      {booking.balanceDue !== undefined && booking.balanceDue > 0 && (
                        <Text><strong>Balance Due:</strong> ${booking.balanceDue.toFixed(2)}</Text>
                      )}
                    </Stack>

                    <Stack direction="horizontal" spacing="md">
                      <Button onClick={() => router.push(`/booking/${booking.id}`)} variant="outline">
                        View Details
                      </Button>
                      <Button onClick={() => router.push(`/manage/${booking.id}`)} variant="outline">
                        Manage
                      </Button>
                    </Stack>
                  </Stack>
                }
              />
            ))}
          </Stack>
        )}

        <Button onClick={handleBookNewRide} variant="primary">
          {pageCmsData?.['book-new-ride'] || 'Book a Ride'}
        </Button>
      </Stack>
    </Container>
  );
}
