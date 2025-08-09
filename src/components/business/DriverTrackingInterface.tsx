'use client';

import React, { useState } from 'react';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Badge, 
  Alert,
  Card,
  Grid,
  GridItem
} from '@/ui';
import { Booking } from '@/types/booking';

type DriverLocation = NonNullable<Booking['driverLocation']>;

interface DriverTrackingInterfaceProps {
  bookingId: string;
  driverName: string;
  driverId: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export const DriverTrackingInterface: React.FC<DriverTrackingInterfaceProps> = ({
  bookingId,
  driverName,
  driverId: _driverId,
  pickupLocation,
  dropoffLocation,
}) => { 
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Initialize real-time tracking for driver
  const {
    bookingStatus,
    loading,
    error,
    updateStatus,
  } = useRealTimeTracking(bookingId);

  // Get current location
  const getCurrentLocation = (): Promise<DriverLocation> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not available'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: DriverLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            timestamp: new Date(),
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  };

  // Start location tracking
  const handleStartTracking = async () => {
    try {
      setLocationError(null);
      
      // Get initial location
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Start continuous tracking
      // startLocationTracking(); // This line is removed
      setIsTrackingActive(true);
      
      console.log('Driver location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to start tracking');
    }
  };

  // Stop location tracking
  const handleStopTracking = () => {
    // stopLocationTracking(); // This line is removed
    setIsTrackingActive(false);
    console.log('Driver location tracking stopped');
  };

  // Update booking status
  const handleStatusUpdate = async (status: 'confirmed' | 'in-progress' | 'completed') => {
    try {
      await updateStatus(status);
      console.log(`Booking status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Get status display text
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Booking Confirmed';
      case 'driver-assigned':
        return 'Driver Assigned';
      case 'en-route':
        return 'En Route to Customer';
      case 'arrived':
        return 'Arrived at Pickup';
      case 'completed':
        return 'Ride Completed';
      default:
        return 'Unknown Status';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'info';
      case 'driver-assigned':
        return 'warning';
      case 'en-route':
        return 'success';
      case 'arrived':
        return 'success';
      case 'completed':
        return 'confirmed';
      default:
        return 'info';
    }
  };

  // Format coordinates
  const formatCoordinates = (location: DriverLocation) => {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  // Format speed
  const formatSpeed = (speed: number) => {
    if (speed === 0) return 'Stopped';
    const mph = Math.round(speed * 2.237); // Convert m/s to mph
    return `${mph} mph`;
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Text>Loading driver interface...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error" title="Connection Error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Header */}
        <Stack spacing="sm">
          <Text variant="h2">Driver Tracking Interface</Text>
          <Text variant="lead">Driver: {driverName}</Text>
          <Stack direction="horizontal" align="center" spacing="md">
            <Badge 
              variant={getStatusColor(bookingStatus?.status || 'confirmed')}
              size="lg"
            >
              {getStatusDisplay(bookingStatus?.status || 'confirmed')}
            </Badge>
          </Stack>
        </Stack>

        {/* Location Tracking Controls */}
        <Card>
          <Stack spacing="md">
            <Text variant="h3">Location Tracking</Text>
            
            {locationError && (
              <Alert variant="error" title="Location Error">
                {locationError}
              </Alert>
            )}

            <Stack direction="horizontal" spacing="md">
              {!isTrackingActive ? (
                <Button 
                  onClick={handleStartTracking}
                  variant="primary"
                  size="lg"
                >
                  Start Location Tracking
                </Button>
              ) : (
                <Button 
                  onClick={handleStopTracking}
                  variant="outline"
                  size="lg"
                >
                  Stop Location Tracking
                </Button>
              )}
            </Stack>

            {currentLocation && (
              <Stack spacing="sm">
                <Text variant="lead">Current Location:</Text>
                <Text>{formatCoordinates(currentLocation)}</Text>
                <Text>Speed: {formatSpeed(currentLocation.speed || 0)}</Text>
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Status Update Controls */}
        <Card>
          <Stack spacing="md">
            <Text variant="h3">Update Booking Status</Text>
            
            <Grid cols={2} gap="md">
              <GridItem>
                <Button
                  onClick={() => handleStatusUpdate('confirmed')}
                  variant={bookingStatus?.status === 'confirmed' ? 'primary' : 'outline'}
                  fullWidth
                  disabled={bookingStatus?.status === 'confirmed'}
                >
                  Driver Assigned
                </Button>
              </GridItem>
              
              <GridItem>
                <Button
                  onClick={() => handleStatusUpdate('in-progress')}
                  variant={bookingStatus?.status === 'in-progress' ? 'primary' : 'outline'}
                  fullWidth
                  disabled={bookingStatus?.status === 'in-progress'}
                >
                  En Route
                </Button>
              </GridItem>
              
              <GridItem>
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  variant={bookingStatus?.status === 'completed' ? 'primary' : 'outline'}
                  fullWidth
                  disabled={bookingStatus?.status === 'completed'}
                >
                  Completed
                </Button>
              </GridItem>
            </Grid>
          </Stack>
        </Card>

        {/* Trip Information */}
        <Card>
          <Stack spacing="md">
            <Text variant="h3">Trip Information</Text>
            
            <Stack spacing="sm">
              <Text>
                <strong>Pickup:</strong> {pickupLocation}
              </Text>
              <Text>
                <strong>Dropoff:</strong> {dropoffLocation}
              </Text>
              {bookingStatus?.estimatedArrival && (
                <Text>
                  <strong>ETA:</strong> {bookingStatus.estimatedArrival.toLocaleTimeString()}
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Connection Status */}
        {loading && (
          <Alert variant="warning" title="Connection Issue">
            Real-time updates may be delayed. Please check your connection.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}; 