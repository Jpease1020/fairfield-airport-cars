'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container,
  Stack,
  Text,
  Box,
  Button,
  Alert,
  Badge,
  LoadingSpinner,
  GridSection
} from '@/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';
import { driverLocationService, type DriverLocation, type DriverStatus } from '@/lib/services/driver-location-service';

// Styled components for driver tracking
const TrackingCard = styled.div<{ $isActive: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$isActive ? colors.success[200] : colors.gray[200]};
  background: ${props => props.$isActive ? colors.success[50] : colors.gray[50]};
`;

const LocationDisplay = styled.div`
  font-family: 'Courier New', monospace;
  background: ${colors.gray[100]};
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

interface DriverLocationTrackerProps {
  driverId: string;
  bookingId?: string;
  onLocationUpdate?: (location: DriverLocation) => void;
  onStatusUpdate?: (status: DriverStatus) => void;
}

export function DriverLocationTracker({
  driverId,
  bookingId,
  onLocationUpdate,
  onStatusUpdate
}: DriverLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Initialize driver tracking
  useEffect(() => {
    initializeTracking();
    return () => {
      stopTracking();
    };
  }, [driverId]);

  const initializeTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Firebase tracking
      await driverLocationService.initializeDriverTracking(driverId);

      // Set up location update callback
      driverLocationService.onLocationUpdate(driverId, (location) => {
        setCurrentLocation(location);
        setLastUpdate(new Date());
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      });

      // Set up status update callback
      driverLocationService.onStatusUpdate(driverId, (status) => {
        setDriverStatus(status);
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
      });

      console.log('✅ Driver tracking initialized');
    } catch (err) {
      console.error('Error initializing tracking:', err);
      setError('Failed to initialize tracking');
    } finally {
      setLoading(false);
    }
  };

  const startGPSTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: DriverLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date(),
            heading: 0, // Will be calculated from previous position
            speed: 0, // Will be calculated from previous position
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            batteryLevel: getBatteryLevel(),
            isMoving: false // Will be determined by speed
          };

          // Calculate heading and speed from previous position
          if (currentLocation) {
            location.heading = calculateHeading(currentLocation, location);
            location.speed = calculateSpeed(currentLocation, location);
            location.isMoving = location.speed > 0;
          }

          setCurrentLocation(location);
          setLastUpdate(new Date());
          setIsTracking(true);

          // Update location in Firebase
          driverLocationService.updateDriverLocation(driverId, location);

          if (onLocationUpdate) {
            onLocationUpdate(location);
          }
        },
        (error) => {
          console.error('GPS error:', error);
          setError(`GPS error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      setWatchId(watchId);
      console.log('📍 GPS tracking started');
    } catch (err) {
      console.error('Error starting GPS tracking:', err);
      setError('Failed to start GPS tracking');
    } finally {
      setLoading(false);
    }
  }, [driverId, currentLocation, onLocationUpdate]);

  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    driverLocationService.stopDriverTracking(driverId);
    
    console.log('🛑 GPS tracking stopped');
  }, [watchId, driverId]);

  const updateDriverStatus = async (status: DriverStatus['status']) => {
    try {
      await driverLocationService.updateDriverStatus(driverId, status, bookingId);
      console.log('🔄 Driver status updated:', status);
    } catch (err) {
      console.error('Error updating driver status:', err);
      setError('Failed to update driver status');
    }
  };

  // Calculate heading between two points
  const calculateHeading = (from: DriverLocation, to: DriverLocation): number => {
    const dLng = to.lng - from.lng;
    const y = Math.sin(dLng) * Math.cos(to.lat);
    const x = Math.cos(from.lat) * Math.sin(to.lat) - Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLng);
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360
    heading = (heading + 360) % 360;
    
    return heading;
  };

  // Calculate speed between two points
  const calculateSpeed = (from: DriverLocation, to: DriverLocation): number => {
    const timeDiff = (to.timestamp.getTime() - from.timestamp.getTime()) / 1000; // seconds
    if (timeDiff === 0) return 0;

    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    const speedMph = (distance / timeDiff) * 3600; // Convert to mph
    
    return Math.max(0, speedMph);
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Get battery level (if available)
  const getBatteryLevel = (): number | undefined => {
    if ('getBattery' in navigator) {
      // @ts-ignore - Battery API is not fully typed
      navigator.getBattery().then((battery: any) => {
        return battery.level * 100;
      });
    }
    return undefined;
  };

  const formatLocation = (location: DriverLocation) => {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} mph`;
  };

  const formatHeading = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return `${directions[index]} (${heading.toFixed(0)}°)`;
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing driver tracking...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Header */}
        <Stack spacing="sm">
          <Text weight="bold" size="xl">Driver Location Tracker</Text>
          <Text variant="muted">
            Real-time GPS tracking for driver location updates
          </Text>
          {lastUpdate && (
            <Text variant="muted" size="sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Stack>

        {/* Tracking Status */}
        <TrackingCard $isActive={isTracking}>
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold">GPS Tracking Status</Text>
              <Badge 
                variant={isTracking ? 'success' : 'default'}
              >
                {isTracking ? 'Active' : 'Inactive'}
              </Badge>
            </Stack>

            {currentLocation && (
              <Stack spacing="sm">
                <LocationDisplay>
                  <div>📍 Coordinates: {formatLocation(currentLocation)}</div>
                  <div>🚗 Speed: {formatSpeed(currentLocation.speed)}</div>
                  <div>🧭 Heading: {formatHeading(currentLocation.heading)}</div>
                  <div>📏 Accuracy: {currentLocation.accuracy.toFixed(1)}m</div>
                  {currentLocation.altitude && (
                    <div>⛰️ Altitude: {currentLocation.altitude.toFixed(0)}m</div>
                  )}
                  {currentLocation.batteryLevel && (
                    <div>🔋 Battery: {currentLocation.batteryLevel.toFixed(0)}%</div>
                  )}
                  <div>🔄 Moving: {currentLocation.isMoving ? 'Yes' : 'No'}</div>
                </LocationDisplay>
              </Stack>
            )}

            {/* Control Buttons */}
            <Stack direction="horizontal" spacing="md">
              {!isTracking ? (
                <Button 
                  variant="primary" 
                  onClick={startGPSTracking}
                  disabled={loading}
                  fullWidth
                >
                  Start GPS Tracking
                </Button>
              ) : (
                <Button 
                  variant="danger" 
                  onClick={stopTracking}
                  fullWidth
                >
                  Stop GPS Tracking
                </Button>
              )}
            </Stack>
          </Stack>
        </TrackingCard>

        {/* Driver Status */}
        {driverStatus && (
          <Box variant="outlined" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg">Driver Status</Text>
              
              <GridSection variant="content" columns={2}>
                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Status</Text>
                  <Badge 
                    variant={
                      driverStatus.status === 'available' ? 'success' :
                      driverStatus.status === 'busy' ? 'warning' :
                      driverStatus.status === 'en-route' ? 'info' :
                      driverStatus.status === 'arrived' ? 'success' : 'default'
                    }
                  >
                    {driverStatus.status}
                  </Badge>
                </Stack>

                <Stack spacing="sm">
                  <Text variant="muted" size="sm">Current Booking</Text>
                  <Text weight="bold">
                    {driverStatus.currentBookingId || 'None'}
                  </Text>
                </Stack>
              </GridSection>

              {/* Status Update Buttons */}
              <Stack direction="horizontal" spacing="md">
                <Button 
                  variant="outline" 
                  onClick={() => updateDriverStatus('available')}
                  disabled={driverStatus.status === 'available'}
                  fullWidth
                >
                  Available
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => updateDriverStatus('busy')}
                  disabled={driverStatus.status === 'busy'}
                  fullWidth
                >
                  Busy
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Instructions */}
        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">Instructions</Text>
            <Text size="sm" variant="muted">
              1. Click "Start GPS Tracking" to begin location updates
            </Text>
            <Text size="sm" variant="muted">
              2. Your location will be updated in real-time
            </Text>
            <Text size="sm" variant="muted">
              3. Update your status when accepting bookings
            </Text>
            <Text size="sm" variant="muted">
              4. Location data is automatically sent to the tracking system
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
} 