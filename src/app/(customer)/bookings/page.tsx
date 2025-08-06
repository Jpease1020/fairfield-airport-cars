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
  EditableText,
  Alert,
  Badge,
  H1,
  ContentCard
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';

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
}

function CustomerBookingsPage() {
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
      // Mock data for now - replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: '1',
          pickupLocation: 'Fairfield Airport',
          dropoffLocation: 'Downtown Fairfield',
          pickupDateTime: '2024-01-15T10:00:00Z',
          status: 'completed',
          fare: 45.00,
          driverName: 'John Smith',
          vehicleInfo: 'Black Sedan - ABC123',
          createdAt: '2024-01-10T08:00:00Z'
        },
        {
          id: '2',
          pickupLocation: 'Downtown Fairfield',
          dropoffLocation: 'Fairfield Airport',
          pickupDateTime: '2024-01-20T14:00:00Z',
          status: 'confirmed',
          fare: 50.00,
          driverName: 'Sarah Johnson',
          vehicleInfo: 'White SUV - XYZ789',
          createdAt: '2024-01-12T09:00:00Z'
        },
        {
          id: '3',
          pickupLocation: 'Fairfield Airport',
          dropoffLocation: 'Hotel Downtown',
          pickupDateTime: '2024-01-25T16:00:00Z',
          status: 'pending',
          fare: 35.00,
          createdAt: '2024-01-14T11:00:00Z'
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    }
  };

  const getStatusColor = (status: string) => {
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

  const handleViewBooking = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const handleTrackBooking = (bookingId: string) => {
    router.push(`/tracking/${bookingId}`);
  };

  const handleBookNewRide = () => {
    router.push('/book');
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing bookings...</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading your bookings...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Please log in to view your bookings.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Error Loading Bookings"
        subtitle={error}
      >
        <Container>
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="My Bookings"
      subtitle="View and manage your airport rides"
    >
      <Stack spacing="xl">
        {/* Header with Book New Ride button */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1>
              <EditableText field="customer.bookings.title" defaultValue="My Bookings">
                My Bookings
              </EditableText>
            </H1>
            <Text variant="muted">
              <EditableText field="customer.bookings.subtitle" defaultValue="View and manage your airport rides">
                View and manage your airport rides
              </EditableText>
            </Text>
          </Stack>
          <Button onClick={handleBookNewRide} variant="primary">
            <EditableText field="customer.bookings.book_new_ride" defaultValue="Book New Ride">
              Book New Ride
            </EditableText>
          </Button>
        </Stack>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <ContentCard
            title="No Bookings Yet"
            content={
              <Stack spacing="lg" align="center">
                <Text variant="muted" align="center">
                  <EditableText field="customer.bookings.no_bookings" defaultValue="You haven't made any bookings yet. Book your first ride!">
                    You haven't made any bookings yet. Book your first ride!
                  </EditableText>
                </Text>
                <Button onClick={handleBookNewRide} variant="primary">
                  <EditableText field="customer.bookings.book_first_ride" defaultValue="Book Your First Ride">
                    Book Your First Ride
                  </EditableText>
                </Button>
              </Stack>
            }
            variant="elevated"
          />
        ) : (
          <Stack spacing="lg">
            {bookings.map((booking) => (
              <ContentCard
                key={booking.id}
                title={`Booking #${booking.id}`}
                content={
                  <Stack spacing="md">
                                         <Stack direction="horizontal" justify="space-between" align="center">
                       <Badge variant={getStatusColor(booking.status)}>
                         {getStatusText(booking.status)}
                       </Badge>
                       <Text weight="bold" size="lg">
                         ${booking.fare.toFixed(2)}
                       </Text>
                     </Stack>
                    
                    <Stack spacing="sm">
                      <Text><strong>From:</strong> {booking.pickupLocation}</Text>
                      <Text><strong>To:</strong> {booking.dropoffLocation}</Text>
                      <Text><strong>Date:</strong> {new Date(booking.pickupDateTime).toLocaleDateString()}</Text>
                      <Text><strong>Time:</strong> {new Date(booking.pickupDateTime).toLocaleTimeString()}</Text>
                      {booking.driverName && (
                        <Text><strong>Driver:</strong> {booking.driverName}</Text>
                      )}
                      {booking.vehicleInfo && (
                        <Text><strong>Vehicle:</strong> {booking.vehicleInfo}</Text>
                      )}
                    </Stack>

                    <Stack direction="horizontal" spacing="sm">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewBooking(booking.id)}
                        size="sm"
                      >
                        <EditableText field="customer.bookings.view_details" defaultValue="View Details">
                          View Details
                        </EditableText>
                      </Button>
                      {booking.status === 'confirmed' || booking.status === 'in-progress' ? (
                        <Button 
                          variant="primary" 
                          onClick={() => handleTrackBooking(booking.id)}
                          size="sm"
                        >
                          <EditableText field="customer.bookings.track_ride" defaultValue="Track Ride">
                            Track Ride
                          </EditableText>
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                }
                variant="elevated"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </AdminPageWrapper>
  );
}

export default CustomerBookingsPage; 