'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Grid, 
  GridItem,
  Badge,
  Button,
  LoadingSpinner,
  useToast,
  DataTable,
  ToastProvider
} from '@/ui';
import { Calendar, Clock, MapPin, User, Car } from 'lucide-react';

function DriverAvailabilityPageContent() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        setLoading(true);
        // Fetch bookings assigned to Gregg
        const response = await fetch('/api/admin/bookings?driverId=driver-001&status=confirmed');
        if (response.ok) {
          const data = await response.json();
          setUpcomingBookings(data.bookings || []);
        }
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        addToast('error', 'Failed to load upcoming bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, [addToast]);

  const handleToggleAvailability = async () => {
    try {
      // This would update Gregg's availability in the database
      setIsAvailable(!isAvailable);
      addToast('success', `Gregg is now ${!isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      addToast('error', 'Failed to update availability');
    }
  };

  const bookingColumns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (booking: any) => (
        <Stack spacing="xs">
          <Text weight="bold">{booking.name}</Text>
          <Text size="sm" variant="muted">{booking.phone}</Text>
        </Stack>
      )
    },
    {
      key: 'route',
      label: 'Route',
      render: (booking: any) => (
        <Stack spacing="xs">
          <Text size="sm">
            <MapPin size={14} /> {booking.pickupLocation}
          </Text>
          <Text size="sm" variant="muted">
            → {booking.dropoffLocation}
          </Text>
        </Stack>
      )
    },
    {
      key: 'datetime',
      label: 'Date & Time',
      render: (booking: any) => (
        <Stack spacing="xs">
          <Text size="sm">
            <Calendar size={14} /> {new Date(booking.pickupDateTime).toLocaleDateString()}
          </Text>
          <Text size="sm" variant="muted">
            <Clock size={14} /> {new Date(booking.pickupDateTime).toLocaleTimeString()}
          </Text>
        </Stack>
      )
    },
    {
      key: 'passengers',
      label: 'Passengers',
      render: (booking: any) => (
        <Stack direction="horizontal" align="center" spacing="sm">
          <User size={14} />
          <Text size="sm">{booking.passengers}</Text>
        </Stack>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (booking: any) => (
        <Stack direction="horizontal" align="center" spacing="sm">
          <Car size={14} />
          <Text size="sm">Toyota Camry</Text>
        </Stack>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking: any) => (
        <Badge 
          variant={booking.status === 'confirmed' ? 'success' : 'pending'} 
          size="sm"
        >
          {booking.status}
        </Badge>
      )
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" padding="xl">
        <Stack align="center" spacing="md">
          <LoadingSpinner size="lg" />
          <Text>Loading driver dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="md">
          <Text size="xl" weight="bold">Gregg's Driver Dashboard</Text>
          <Text variant="muted">Manage your availability and view upcoming bookings</Text>
        </Stack>

        {/* Availability Status */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold" size="lg">Availability Status</Text>
              <Badge 
                variant={isAvailable ? 'success' : 'error'} 
                size="lg"
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </Stack>
            
            <Text variant="muted">
              When you're unavailable, new bookings will be paused until you're back online.
            </Text>
            
            <Button
              variant={isAvailable ? 'outline' : 'primary'}
              onClick={handleToggleAvailability}
            >
              {isAvailable ? 'Go Offline' : 'Go Online'}
            </Button>
          </Stack>
        </Box>

        {/* Quick Stats */}
        <Grid cols={3} gap="lg">
          <GridItem>
            <Box variant="elevated" padding="md">
              <Stack align="center" spacing="sm">
                <Text size="xl" weight="bold">
                  {upcomingBookings.length}
                </Text>
                <Text size="sm" variant="muted">Upcoming Bookings</Text>
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box variant="elevated" padding="md">
              <Stack align="center" spacing="sm">
                <Text size="xl" weight="bold">4.8</Text>
                <Text size="sm" variant="muted">Average Rating</Text>
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box variant="elevated" padding="md">
              <Stack align="center" spacing="sm">
                <Text size="xl" weight="bold">1250</Text>
                <Text size="sm" variant="muted">Total Rides</Text>
              </Stack>
            </Box>
          </GridItem>
        </Grid>

        {/* Upcoming Bookings */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Upcoming Bookings</Text>
            
            {upcomingBookings.length === 0 ? (
              <Box variant="outlined" padding="md">
                <Stack align="center" spacing="sm">
                  <Text variant="muted">No upcoming bookings</Text>
                  <Text size="sm" variant="muted">New bookings will appear here</Text>
                </Stack>
              </Box>
            ) : (
              <DataTable
                data={upcomingBookings}
                columns={bookingColumns}
                pageSize={10}
              />
            )}
          </Stack>
        </Box>

        {/* Vehicle Information */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Vehicle Information</Text>
            <Grid cols={2} gap="lg">
              <GridItem>
                <Stack spacing="sm">
                  <Text weight="bold">Vehicle Details</Text>
                  <Text size="sm">2022 Toyota Camry</Text>
                  <Text size="sm" variant="muted">Color: Silver</Text>
                  <Text size="sm" variant="muted">License: ABC-123</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text weight="bold">Contact Information</Text>
                  <Text size="sm">Phone: +1234567890</Text>
                  <Text size="sm" variant="muted">Email: gregg@fairfieldairportcars.com</Text>
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default function DriverAvailabilityPage() {
  return (
    <ToastProvider>
      <DriverAvailabilityPageContent />
    </ToastProvider>
  );
} 