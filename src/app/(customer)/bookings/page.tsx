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
  passengers?: number;
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
          <Text>{getCMSField(cmsData, 'pages.bookings.loading.initializing', 'Initializing bookings...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{getCMSField(cmsData, 'pages.bookings.loading.loading_bookings', 'Loading your bookings...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">{getCMSField(cmsData, 'pages.bookings.login_required', 'Please log in to view your bookings.')}</Text>
          <Button onClick={() => router.push('/login')}>
            {getCMSField(cmsData, 'pages.bookings.go_to_login', 'Go to Login')}
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
              data-cms-id="pages.bookings.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.bookings.title', 'My Bookings')}
            </H1>
            <Text 
              variant="muted"
              data-cms-id="pages.bookings.subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.bookings.subtitle', 'View and manage your airport rides')}
            </Text>
          </Stack>
          <Button 
            onClick={handleBookNewRide} 
            variant="primary"
            data-cms-id="pages.bookings.book_new_ride"
            interactionMode={mode}
          >
            {getCMSField(cmsData, 'pages.bookings.book_new_ride', 'Book New Ride')}
          </Button>
        </Stack>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <ContentCard
            title={getCMSField(cmsData, 'pages.bookings.no_bookings_title', 'No Bookings Yet')}
            content={
              <Stack spacing="lg" align="center">
                <Text variant="muted" align="center">
                  {getCMSField(cmsData, 'pages.bookings.no_bookings', "You haven't made any bookings yet. Book your first ride!")}
                </Text>
                                      <Button 
                      onClick={handleBookNewRide} 
                      variant="primary"
                      data-cms-id="pages.bookings.book_first_ride"
                      interactionMode={mode}
                    >
                      {getCMSField(cmsData, 'pages.bookings.book_first_ride', 'Book Your First Ride')}
                    </Button>
              </Stack>
            }
            variant="elevated"
          />
        ) : (
          <Stack spacing="lg">
            {bookings.map((booking) => (
              <Box key={booking.id} variant="elevated" padding="lg" data-cms-id={`pages.bookings.booking.${booking.id}`}>
                <Stack spacing="md">
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text weight="bold" size="lg" data-cms-id={`pages.bookings.booking.${booking.id}.title`} mode={mode}>
                      {getCMSField(cmsData, `pages.bookings.booking.${booking.id}.title`, `Booking #${booking.id}`)}
                    </Text>
                    <Badge variant={getStatusVariant(booking.status)} data-cms-id={`pages.bookings.booking.${booking.id}.status`}>
                      {getCMSField(cmsData, `pages.bookings.booking.${booking.id}.statusText`, getStatusText(booking.status))}
                    </Badge>
                  </Stack>
                  
                  <Stack direction="horizontal" spacing="md" align="center">
                    <Button
                      onClick={() => router.push(`/status/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      data-cms-id={`pages.bookings.booking.${booking.id}.viewStatus`}
                    >
                      {getCMSField(cmsData, 'pages.bookings.booking.viewStatus', 'View Status')}
                    </Button>
                    <Button
                      onClick={() => router.push(`/manage/${booking.id}`)}
                      variant="outline"
                      size="sm"
                      data-cms-id={`pages.bookings.booking.${booking.id}.manage`}
                    >
                      {getCMSField(cmsData, 'pages.bookings.booking.manage', 'Manage')}
                    </Button>
                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => router.push(`/feedback/${booking.id}`)}
                        variant="outline"
                        size="sm"
                        data-cms-id={`pages.bookings.booking.${booking.id}.feedback`}
                      >
                        {getCMSField(cmsData, 'pages.bookings.booking.feedback', 'Leave Feedback')}
                      </Button>
                    )}
                    {booking.status === 'completed' && (booking.balanceDue || 0) > 0 && (
                      <Button
                        onClick={() => router.push(`/payments/pay-balance/${booking.id}`)}
                        variant="primary"
                        size="sm"
                        data-cms-id={`pages.bookings.booking.${booking.id}.payBalance`}
                      >
                        {getCMSField(cmsData, 'pages.bookings.booking.payBalance', `Pay Balance ($${(booking.balanceDue || 0).toFixed(2)})`)}
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