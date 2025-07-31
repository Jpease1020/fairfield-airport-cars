'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Card, 
  H2, 
  Text, 
  Button, 
  Grid, 
  GridItem,
  StatusMessage,
  LoadingSpinner
} from '@/ui';
import { getDriver, updateDriverStatus, updateDriverLocation } from '@/lib/services/driver-service';
import { getBookings, updateBookingStatus } from '@/lib/services/booking-service';

interface DriverDashboardProps {}

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadDriverData();
    loadBookings();
    getCurrentLocation();
  }, []);

  const loadDriverData = async () => {
    try {
      const driverData = await getDriver('gregg-main-driver');
      setDriver(driverData);
    } catch (err) {
      setError('Failed to load driver data');
    }
  };

  const loadBookings = async () => {
    try {
      const todayBookings = await getBookings();
      setBookings(todayBookings);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          updateDriverLocation('gregg-main-driver', latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const updateStatus = async (status: 'available' | 'busy' | 'offline') => {
    try {
      await updateDriverStatus('gregg-main-driver', status);
      setDriver((prev: any) => ({ ...prev, status }));
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'in-progress' | 'completed') => {
    try {
      await updateBookingStatus(bookingId, status);
      loadBookings(); // Reload bookings
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text>Loading driver dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="lg" maxWidth="xl">
      <Stack spacing="xl">
        {/* Driver Status */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Driver Dashboard - Gregg</H2>
            
            {error && (
              <StatusMessage type="error" message={error} />
            )}

            <Grid cols={3} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Status</Text>
                  <Text>{driver?.status || 'Unknown'}</Text>
                  <Stack direction="horizontal" spacing="sm">
                    <Button 
                      size="sm" 
                      variant={driver?.status === 'available' ? 'primary' : 'outline'}
                      onClick={() => updateStatus('available')}
                    >
                      Available
                    </Button>
                    <Button 
                      size="sm" 
                      variant={driver?.status === 'busy' ? 'primary' : 'outline'}
                      onClick={() => updateStatus('busy')}
                    >
                      Busy
                    </Button>
                    <Button 
                      size="sm" 
                      variant={driver?.status === 'offline' ? 'primary' : 'outline'}
                      onClick={() => updateStatus('offline')}
                    >
                      Offline
                    </Button>
                  </Stack>
                </Stack>
              </GridItem>

              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Vehicle</Text>
                  <Text>{driver?.vehicleInfo?.year} {driver?.vehicleInfo?.make} {driver?.vehicleInfo?.model}</Text>
                  <Text>Color: {driver?.vehicleInfo?.color}</Text>
                  <Text>Plate: {driver?.vehicleInfo?.licensePlate}</Text>
                </Stack>
              </GridItem>

              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Location</Text>
                  {currentLocation ? (
                    <>
                      <Text>Lat: {currentLocation.lat.toFixed(6)}</Text>
                      <Text>Lng: {currentLocation.lng.toFixed(6)}</Text>
                      <Button size="sm" variant="outline" onClick={getCurrentLocation}>
                        Update Location
                      </Button>
                    </>
                  ) : (
                    <Text>Location not available</Text>
                  )}
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Card>

        {/* Today's Bookings */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Today&apos;s Bookings</H2>
            
            {bookings.length === 0 ? (
              <Text>No bookings for today</Text>
            ) : (
              <Stack spacing="md">
                {bookings.map((booking) => (
                  <Card key={booking.id} variant="outlined" padding="md">
                    <Stack spacing="md">
                      <Grid cols={2} gap="md" responsive>
                        <GridItem>
                          <Stack spacing="sm">
                            <Text variant="lead">Customer: {booking.name}</Text>
                            <Text>Phone: {booking.phone}</Text>
                            <Text>Passengers: {booking.passengers}</Text>
                            <Text>Status: {booking.status}</Text>
                          </Stack>
                        </GridItem>
                        
                        <GridItem>
                          <Stack spacing="sm">
                            <Text variant="lead">Route</Text>
                            <Text>From: {booking.pickupLocation}</Text>
                            <Text>To: {booking.dropoffLocation}</Text>
                            <Text>Time: {new Date(booking.pickupDateTime).toLocaleString()}</Text>
                            <Text>Fare: ${booking.fare}</Text>
                          </Stack>
                        </GridItem>
                      </Grid>

                      <Stack direction="horizontal" spacing="sm">
                        {booking.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            Confirm Booking
                          </Button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                          >
                            Start Ride
                          </Button>
                        )}
                        
                        {booking.status === 'in-progress' && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Complete Ride
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 