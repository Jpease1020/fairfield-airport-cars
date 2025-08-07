'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Box, 
  Text, 
  Button, 
  LoadingSpinner,
  Badge,
  Alert,
  GridSection
} from '@/ui';
import { TrackingMap } from '@/components/business/TrackingMap';
import { TrafficETA } from '@/components/business/TrafficETA';
import { getBooking } from '@/lib/services/booking-service';
import { firebaseTrackingService, type ETACalculation, type DriverLocation } from '@/lib/services/firebase-tracking-service';
import { Booking } from '@/types/booking';

export default function EnhancedTrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etaCalculation, setETACalculation] = useState<ETACalculation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);

  // Load booking data and initialize Firebase tracking
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        const bookingData = await getBooking(bookingId);
        if (!bookingData) {
          setError('Booking not found');
          return;
        }

        setBooking(bookingData);

        // Initialize Firebase tracking
        await firebaseTrackingService.initializeTracking(bookingId);
        setTrackingActive(true);
        
        // Set up location update callback
        firebaseTrackingService.onLocationUpdate(bookingId, (location: DriverLocation) => {
          console.log('📍 Driver location update received:', location);
          setBooking(prev => prev ? {
            ...prev,
            driverLocation: location,
            updatedAt: new Date()
          } : null);
          setLastUpdate(new Date());
        });

        // Set up ETA update callback
        firebaseTrackingService.onETAUpdate(bookingId, (eta: ETACalculation) => {
          console.log('🕐 ETA update received:', eta);
          setETACalculation(eta);
          setLastUpdate(new Date());
        });

        // Calculate initial ETA if booking is in progress
        if (bookingData.status === 'in-progress' || bookingData.status === 'confirmed') {
          try {
            const initialETA = await firebaseTrackingService.calculateAdvancedETA(
              bookingId,
              bookingData.pickupLocation,
              bookingData.dropoffLocation,
              bookingData.driverLocation ? {
                lat: bookingData.driverLocation.lat,
                lng: bookingData.driverLocation.lng,
                timestamp: bookingData.driverLocation.timestamp,
                heading: bookingData.driverLocation.heading || 0,
                speed: bookingData.driverLocation.speed || 0
              } : undefined
            );
            setETACalculation(initialETA);
          } catch (etaError) {
            console.error('Error calculating initial ETA:', etaError);
          }
        }

      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }

    // Cleanup on unmount
    return () => {
      if (trackingActive) {
        firebaseTrackingService.stopTracking(bookingId);
      }
    };
  }, [bookingId, trackingActive]);

  // Handle ETA updates
  const handleETAUpdate = (eta: ETACalculation) => {
    setETACalculation(eta);
    setLastUpdate(new Date());
  };

  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    console.log('🗺️ Enhanced map loaded successfully');
  };

  // Refresh tracking data
  const refreshTracking = async () => {
    if (!booking) return;
    
    try {
      const updatedETA = await firebaseTrackingService.calculateAdvancedETA(
        bookingId,
        booking.pickupLocation,
        booking.dropoffLocation,
        booking.driverLocation ? {
          lat: booking.driverLocation.lat,
          lng: booking.driverLocation.lng,
          timestamp: booking.driverLocation.timestamp,
          heading: booking.driverLocation.heading || 0,
          speed: booking.driverLocation.speed || 0
        } : undefined
      );
      setETACalculation(updatedETA);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error refreshing tracking:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading enhanced tracking information...</Text>
          <Text variant="muted" size="sm">
            Initializing real-time location tracking...
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Alert variant="error">
            <Text>{error || 'Booking not found'}</Text>
          </Alert>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl">
        {/* Page Header */}
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack spacing="xs">
              <Text weight="bold" size="xl">Enhanced Live Tracking</Text>
              <Text variant="muted">
                Real-time tracking with traffic-aware ETA calculations
              </Text>
            </Stack>
            <Button 
              variant="outline" 
              onClick={refreshTracking}
              disabled={!trackingActive}
            >
              Refresh ETA
            </Button>
          </Stack>
          {lastUpdate && (
            <Text variant="muted" size="sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
              {trackingActive && ' • Live tracking active'}
            </Text>
          )}
        </Stack>

        {/* Main Content Grid */}
        <GridSection variant="content" columns={2}>
          {/* Tracking Map */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text weight="bold" size="lg">Live Map</Text>
                <Badge 
                  variant={trackingActive ? 'success' : 'warning'}
                  size="sm"
                >
                  {trackingActive ? 'Live' : 'Offline'}
                </Badge>
              </Stack>
              <TrackingMap
                bookingId={booking.id!}
                pickupLocation={booking.pickupLocation}
                dropoffLocation={booking.dropoffLocation}
                driverLocation={booking.driverLocation}
                estimatedArrival={booking.estimatedArrival}
                status={booking.status}
                onMapLoad={handleMapLoad}
              />
            </Stack>
          </Box>

          {/* Traffic-Aware ETA */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg">Traffic-Aware ETA</Text>
              <TrafficETA
                bookingId={booking.id!}
                pickupLocation={booking.pickupLocation}
                dropoffLocation={booking.dropoffLocation}
                currentLocation={booking.driverLocation ? {
                  lat: booking.driverLocation.lat,
                  lng: booking.driverLocation.lng,
                  timestamp: booking.driverLocation.timestamp,
                  heading: booking.driverLocation.heading || 0,
                  speed: booking.driverLocation.speed || 0
                } : undefined}
                onETAUpdate={handleETAUpdate}
              />
            </Stack>
          </Box>
        </GridSection>

        {/* Booking Details */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Booking Details</Text>
            
            <GridSection variant="content" columns={3}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Booking ID</Text>
                <Text weight="bold">{booking.id}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Passenger</Text>
                <Text weight="bold">{booking.name}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Status</Text>
                <Badge 
                  variant={
                    booking.status === 'completed' ? 'success' :
                    booking.status === 'in-progress' ? 'info' :
                    booking.status === 'confirmed' ? 'warning' :
                    booking.status === 'cancelled' ? 'error' :
                    booking.status === 'pending' ? 'pending' :
                    'default'
                  }
                >
                  {booking.status}
                </Badge>
              </Stack>
            </GridSection>

            <GridSection variant="content" columns={3}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Pickup Time</Text>
                <Text weight="bold">
                  {new Date(booking.pickupDateTime).toLocaleString()}
                </Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Fare</Text>
                <Text weight="bold">${booking.fare.toFixed(2)}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Driver</Text>
                <Text weight="bold">
                  {booking.driverName || 'Not assigned yet'}
                </Text>
              </Stack>
            </GridSection>

            {/* Route Information */}
            <Stack spacing="sm">
              <Text variant="muted" size="sm">Route</Text>
              <Text weight="bold">
                {booking.pickupLocation} → {booking.dropoffLocation}
              </Text>
            </Stack>

            {/* ETA Information */}
            {etaCalculation && (
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Current ETA</Text>
                <Text weight="bold">
                  {etaCalculation.estimatedArrival.toLocaleTimeString()} 
                  ({etaCalculation.duration} min, {etaCalculation.distance.toFixed(1)} miles)
                </Text>
                <Text size="sm" variant="muted">
                  Traffic: {etaCalculation.trafficConditions} • Confidence: {(etaCalculation.confidence * 100).toFixed(0)}%
                </Text>
              </Stack>
            )}

            {/* Driver Location Info */}
            {booking.driverLocation && (
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Driver Location</Text>
                <Text weight="bold">
                  {booking.driverLocation.lat.toFixed(4)}, {booking.driverLocation.lng.toFixed(4)}
                </Text>
                <Text size="sm" variant="muted">
                  Speed: {booking.driverLocation.speed || 0} mph • 
                  Updated: {booking.driverLocation.timestamp.toLocaleTimeString()}
                </Text>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="horizontal" spacing="md">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            fullWidth
          >
            Back to Bookings
          </Button>
          
          <Button 
            variant="primary"
            onClick={() => window.location.href = `/booking/${booking.id}`}
            fullWidth
          >
            View Booking Details
          </Button>
        </Stack>

        {/* Real-time Status */}
        {booking.status === 'in-progress' && (
          <Alert variant="info">
            <Stack spacing="xs">
              <Text weight="bold">Live Updates Active</Text>
              <Text size="sm">
                Your driver's location and ETA are being updated in real-time. 
                The map will automatically refresh as your driver moves.
                {trackingActive && ' Firebase tracking is connected and active.'}
              </Text>
            </Stack>
          </Alert>
        )}

        {/* Tracking Status */}
        {!trackingActive && booking.status !== 'completed' && (
          <Alert variant="warning">
            <Stack spacing="xs">
              <Text weight="bold">Tracking Offline</Text>
              <Text size="sm">
                Real-time tracking is currently offline. ETA calculations may not be accurate.
                Try refreshing the page to reconnect.
              </Text>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Container>
  );
} 