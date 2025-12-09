'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, getCustomerProfile } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/services/auth-service';
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
  ContentCard
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

export default function CustomerBookingsClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['customer-bookings'] || {};
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await loadCustomerProfile(firebaseUser.uid);
        if (profile) {
          await loadCustomerBookings(firebaseUser.uid);
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const loadCustomerProfile = async (uid: string): Promise<User | null> => {
    try {
      const customerProfile = await getCustomerProfile(uid);
      setProfile(customerProfile);
      return customerProfile;
    } catch (error) {
      console.error('Error loading customer profile:', error);
      setError('Failed to load profile');
      return null;
    }
  };

  const loadCustomerBookings = async (uid: string) => {
    try {
      if (!profile) {
        setBookings([]);
        return;
      }

      // Use email or phone from profile to fetch bookings
      const identifier = profile.email || profile.phone;
      if (!identifier) {
        setBookings([]);
        return;
      }

      const queryParam = profile.email ? 'email' : 'phone';
      const response = await fetch(`/api/booking/get-customer-bookings?${queryParam}=${encodeURIComponent(identifier)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.bookings)) {
        // Transform API response to match Booking interface
        const transformedBookings: Booking[] = data.bookings.map((booking: any) => ({
          id: booking.id,
          pickupLocation: booking.trip?.pickup?.address || booking.pickupLocation || 'N/A',
          dropoffLocation: booking.trip?.dropoff?.address || booking.dropoffLocation || 'N/A',
          pickupDateTime: booking.trip?.pickupDateTime || booking.pickupDateTime || '',
          status: booking.status || 'pending',
          fare: booking.trip?.fare || booking.fare || 0,
          driverName: booking.driverName || booking.driver?.name,
          vehicleInfo: booking.vehicleInfo || booking.driver?.vehicleInfo,
          createdAt: booking.createdAt || '',
          balanceDue: booking.balanceDue
        }));
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
      setBookings([]);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'confirmed': return 'confirmed';
      case 'in-progress': return 'warning';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
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
          <Text cmsId="initializing">{pageCmsData?.['initializing'] || 'Initializing bookings...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text cmsId="loading-bookings">{pageCmsData?.['loading-bookings'] || 'Loading your bookings...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted" cmsId="login-required">{pageCmsData?.['login-required'] || 'Please log in to view your bookings.'}</Text>
          <Button onClick={() => router.push('/auth/login')} cmsId="go-to-login" >
            {pageCmsData?.['go-to-login'] || 'Go to Login'}
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
    <>
      <Stack spacing="xl">
        {/* Header with Book New Ride button */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1 
              cmsId="title"
              
            >
              {pageCmsData?.['title'] || 'My Bookings'}
            </H1>
            <Text   
              variant="muted"
              cmsId="subtitle"
              
            >
              {pageCmsData?.['subtitle'] || 'View and manage your airport rides'}
            </Text>
          </Stack>
          <Button 
            onClick={handleBookNewRide} 
            variant="primary"
            cmsId="book-new-ride"
            
          >
            {pageCmsData?.['book-new-ride'] || 'Book New Ride'}
          </Button>
        </Stack>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <ContentCard
            title={pageCmsData?.['no-bookings-title'] || 'No Bookings Yet'}
            content={
              <Stack spacing="lg" align="center">
                <Text variant="muted" align="center">
                  {pageCmsData?.['no-bookings'] || "You haven't made any bookings yet. Book your first ride!"}
                </Text>
                <Button 
                  onClick={handleBookNewRide} 
                  variant="primary"
                  cmsId="book-first-ride" 
                  data-testid="book-first-ride-button"
                  
                >
                  {pageCmsData?.['book-first-ride'] || 'Book Your First Ride'}
                </Button>
              </Stack>
            }
            variant="elevated"
            data-testid="no-bookings-card"
          />
        ) : (
          <Stack spacing="lg" data-testid="bookings-list">
            {bookings.map((booking) => (
              <Box key={booking.id} variant="elevated" padding="lg" data-testid={`booking-${booking.id}`}>
                <Stack spacing="md">
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text weight="bold" size="lg" cmsId='booking-title' >
                      {pageCmsData?.['booking-title'] || `Booking #${booking.id}`}
                    </Text>
                    <Badge variant={getStatusVariant(booking.status)} cmsId='booking-status' data-testid={`booking-status-${booking.id}`}>
                      {pageCmsData?.['booking-status'] || getStatusText(booking.status)}
                    </Badge>
                  </Stack>
                  
                  <Stack spacing="sm">
                    <Text size="sm">
                      <strong>From:</strong> {booking.pickupLocation}
                    </Text>
                    <Text size="sm">
                      <strong>To:</strong> {booking.dropoffLocation}
                    </Text>
                    {booking.pickupDateTime && (
                      <Text size="sm">
                        <strong>Date/Time:</strong> {new Date(booking.pickupDateTime).toLocaleString()}
                      </Text>
                    )}
                    <Text size="sm">
                      <strong>Fare:</strong> ${booking.fare.toFixed(2)}
                    </Text>
                  </Stack>
                  
                  <Stack direction="horizontal" spacing="md" align="center">
                    <Button
                      onClick={() => router.push(`/booking/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      cmsId='view-details'
                      data-testid={`view-details-${booking.id}`}
                    >
                      {pageCmsData?.['view-details'] || 'View Details'}
                    </Button>
                    <Button
                      onClick={() => router.push(`/booking/${booking.id}/edit`)}
                      variant="outline"
                      size="sm"
                      cmsId='edit-booking'
                      data-testid={`edit-booking-${booking.id}`}
                      disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                    >
                      {pageCmsData?.['edit-booking'] || 'Edit'}
                    </Button>
                    <Button
                      onClick={() => router.push(`/manage/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      cmsId='manage-booking'
                      data-testid={`manage-booking-${booking.id}`}
                    >
                      {pageCmsData?.['manage-booking'] || 'Manage'}
                    </Button>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button
                        onClick={() => router.push(`/cancel?bookingId=${booking.id}`)}
                        variant="outline"
                        size="sm"
                        cmsId='cancel-booking'
                        data-testid={`cancel-booking-${booking.id}`}
                      >
                        {pageCmsData?.['cancel-booking'] || 'Cancel'}
                      </Button>
                    )}
                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => router.push(`/feedback/${booking.id}`)}
                        variant="outline"
                        size="sm"
                        cmsId='feedback'
                        data-testid={`feedback-${booking.id}`}
                      >
                          {pageCmsData?.['feedback'] || 'Leave Feedback'}
                      </Button>
                    )}
                    {booking.status === 'completed' && (booking.balanceDue || 0) > 0 && (
                      <Button
                        onClick={() => router.push(`/payments/pay-balance/${booking.id}`)}
                        variant="primary"
                        size="sm"
                        cmsId='pay-balance'
                        data-testid={`pay-balance-${booking.id}`}
                      >
                        {pageCmsData?.['pay-balance'] || `Pay Balance ($${(booking.balanceDue || 0).toFixed(2)})`}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </>
  );
}
