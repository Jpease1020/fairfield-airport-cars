'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Alert,
  Badge,
  LoadingSpinner,
  GridSection
} from '@/ui';
import { DriverLocationTracker } from '@/components/business/DriverLocationTracker';
import { driverLocationService, type DriverLocation, type DriverStatus } from '@/lib/services/driver-location-service';
import { useAuth } from '@/hooks/useAuth';

export default function DriverTrackingPage() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock driver ID - in production this would come from user profile
  const driverId = user?.uid || 'demo-driver-123';

  // Handle location updates
  const handleLocationUpdate = (location: DriverLocation) => {
    setCurrentLocation(location);
    setLastUpdate(new Date());
    console.log('📍 Location updated:', location);
  };

  // Handle status updates
  const handleStatusUpdate = (status: DriverStatus) => {
    setDriverStatus(status);
    console.log('🔄 Status updated:', status);
  };

  // Load initial driver data
  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current driver location
        const location = await driverLocationService.getDriverLocation(driverId);
        if (location) {
          setCurrentLocation(location);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading driver data:', err);
        setError('Failed to load driver data');
        setLoading(false);
      }
    };

    if (driverId) {
      loadDriverData();
    }
  }, [driverId]);

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading driver tracking...</Text>
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
        {/* Page Header */}
        <Stack spacing="sm">
          <Text weight="bold" size="xl">Driver Tracking Dashboard</Text>
          <Text variant="muted">
            Track your location and manage your availability
          </Text>
          {lastUpdate && (
            <Text variant="muted" size="sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Stack>

        {/* Driver Info */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Driver Information</Text>
            
            <GridSection variant="content" columns={2}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Driver ID</Text>
                <Text weight="bold">{driverId}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Status</Text>
                <Badge 
                  variant={
                    driverStatus?.status === 'available' ? 'success' :
                    driverStatus?.status === 'busy' ? 'warning' :
                    driverStatus?.status === 'en-route' ? 'info' :
                    driverStatus?.status === 'arrived' ? 'success' : 'default'
                  }
                >
                  {driverStatus?.status || 'Unknown'}
                </Badge>
              </Stack>
            </GridSection>

            {driverStatus?.currentBookingId && (
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Current Booking</Text>
                <Text weight="bold">{driverStatus.currentBookingId}</Text>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Location Tracker */}
        <DriverLocationTracker
          driverId={driverId}
          bookingId={driverStatus?.currentBookingId}
          onLocationUpdate={handleLocationUpdate}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Current Location Display */}
        {currentLocation && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg">Current Location</Text>
              
              <GridSection variant="content" columns={2}>
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Latitude</Text>
                  <Text weight="bold">{currentLocation.lat.toFixed(6)}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Longitude</Text>
                  <Text weight="bold">{currentLocation.lng.toFixed(6)}</Text>
                </Stack>
              </GridSection>

              <GridSection variant="content" columns={2}>
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Speed</Text>
                  <Text weight="bold">{currentLocation.speed.toFixed(1)} mph</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Heading</Text>
                  <Text weight="bold">{currentLocation.heading.toFixed(0)}°</Text>
                </Stack>
              </GridSection>

              <GridSection variant="content" columns={2}>
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Accuracy</Text>
                  <Text weight="bold">{currentLocation.accuracy.toFixed(1)}m</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Moving</Text>
                  <Badge variant={currentLocation.isMoving ? 'success' : 'default'}>
                    {currentLocation.isMoving ? 'Yes' : 'No'}
                  </Badge>
                </Stack>
              </GridSection>

              {currentLocation.altitude && (
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Altitude</Text>
                  <Text weight="bold">{currentLocation.altitude.toFixed(0)}m</Text>
                </Stack>
              )}

              {currentLocation.batteryLevel && (
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Battery Level</Text>
                  <Text weight="bold">{currentLocation.batteryLevel.toFixed(0)}%</Text>
                </Stack>
              )}
            </Stack>
          </Box>
        )}

        {/* Instructions */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">📱 Driver App Instructions</Text>
            
            <Stack spacing="sm">
              <Text weight="bold">Getting Started</Text>
              <Text size="sm" variant="muted">
                1. Start GPS tracking to begin location updates
              </Text>
              <Text size="sm" variant="muted">
                2. Update your status when accepting bookings
              </Text>
              <Text size="sm" variant="muted">
                3. Keep the app running for real-time tracking
              </Text>
            </Stack>

            <Stack spacing="sm">
              <Text weight="bold">Status Management</Text>
              <Text size="sm" variant="muted">
                • Available: Ready to accept new bookings
              </Text>
              <Text size="sm" variant="muted">
                • Busy: Currently on a booking
              </Text>
              <Text size="sm" variant="muted">
                • En Route: Driving to pickup location
              </Text>
              <Text size="sm" variant="muted">
                • Arrived: At pickup/dropoff location
              </Text>
            </Stack>

            <Stack spacing="sm">
              <Text weight="bold">Location Tracking</Text>
              <Text size="sm" variant="muted">
                • GPS tracking updates every 30 seconds
              </Text>
              <Text size="sm" variant="muted">
                • Location data is encrypted and secure
              </Text>
              <Text size="sm" variant="muted">
                • Battery usage is optimized for efficiency
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* Privacy Notice */}
        <Alert variant="info">
          <Stack spacing="xs">
            <Text weight="bold">Privacy & Security</Text>
            <Text size="sm">
              Your location data is only shared with the booking system when you're on an active booking. 
              Location tracking can be stopped at any time.
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Container>
  );
} 