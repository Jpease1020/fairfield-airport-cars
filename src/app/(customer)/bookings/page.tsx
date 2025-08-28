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
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

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

function CustomerBookingsPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
        await loadCustomerProfile(firebaseUser.uid);
        await loadCustomerBookings(firebaseUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const loadCustomerProfile = async (uid: string) => {
    try {
      const customerProfile = await getCustomerProfile(uid);
      setProfile(customerProfile);
    } catch (error) {
      console.error('Error loading customer profile:', error);
      setError('Failed to load profile');
    }
  };

  const loadCustomerBookings = async (uid: string) => {
    try {
      // TODO: Replace with actual API call to get real bookings
      setBookings([]);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
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
          <Text data-cms-id="initializing">{getCMSField(cmsData, 'initializing', 'Initializing bookings...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text data-cms-id="loading-bookings">{getCMSField(cmsData, 'loading-bookings', 'Loading your bookings...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
            <Text variant="muted" data-cms-id="login-required">{getCMSField(cmsData, 'login-required', 'Please log in to view your bookings.')}</Text>
          <Button onClick={() => router.push('/login')}>
            {getCMSField(cmsData, 'go-to-login', 'Go to Login')}
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
              data-cms-id="title"
              mode={mode}
            >
              {getCMSField(cmsData, 'title', 'My Bookings')}
            </H1>
            <Text 
              variant="muted"
              data-cms-id="subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'subtitle', 'View and manage your airport rides')}
            </Text>
          </Stack>
          <Button 
            onClick={handleBookNewRide} 
            variant="primary"
            data-cms-id="book-new-ride"
            interactionMode={mode}
          >
            {getCMSField(cmsData, 'book-new-ride', 'Book New Ride')}
          </Button>
        </Stack>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <ContentCard
            title={getCMSField(cmsData, 'no-bookings-title', 'No Bookings Yet')}
            content={
              <Stack spacing="lg" align="center">
                <Text variant="muted" align="center">
                  {getCMSField(cmsData, 'no-bookings', "You haven't made any bookings yet. Book your first ride!")}
                </Text>
                                      <Button 
                      onClick={handleBookNewRide} 
                      variant="primary"
                      data-cms-id="book-first-ride" 
                      interactionMode={mode}
                    >
                      {getCMSField(cmsData, 'book-first-ride', 'Book Your First Ride')}
                    </Button>
              </Stack>
            }
            variant="elevated"
          />
        ) : (
          <Stack spacing="lg">
            {bookings.map((booking) => (
              <Box key={booking.id} variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text weight="bold" size="lg" data-cms-id='booking-title' mode={mode}>
                      {getCMSField(cmsData, `booking-title`, `Booking #${booking.id}`)}
                    </Text>
                    <Badge variant={getStatusVariant(booking.status)} data-cms-id='booking-status'>
                      {getCMSField(cmsData, `booking-status`, getStatusText(booking.status))}
                    </Badge>
                  </Stack>
                  
                  <Stack direction="horizontal" spacing="md" align="center">
                    <Button
                      onClick={() => router.push(`/status/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      data-cms-id='view-status'
                    >
                      {getCMSField(cmsData, 'view-status', 'View Status')}
                    </Button>
                    <Button
                      onClick={() => router.push(`/manage/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      data-cms-id='manage-booking'
                    >
                      {getCMSField(cmsData, 'manage-booking', 'Manage')}
                    </Button>
                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => router.push(`/feedback/${booking.id}`)}
                        variant="outline"
                        size="sm"
                        data-cms-id='feedback'
                      >
                        {getCMSField(cmsData, 'feedback', 'Leave Feedback')}
                      </Button>
                    )}
                    {booking.status === 'completed' && (booking.balanceDue || 0) > 0 && (
                      <Button
                        onClick={() => router.push(`/payments/pay-balance/${booking.id}`)}
                        variant="primary"
                        size="sm"
                        data-cms-id='pay-balance'
                      >
                        {getCMSField(cmsData, 'pay-balance', `Pay Balance ($${(booking.balanceDue || 0).toFixed(2)})`)}
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

export default CustomerBookingsPage; 