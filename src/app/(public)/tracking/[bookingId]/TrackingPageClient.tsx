'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Box, 
  Text, 
  Button, 
  LoadingSpinner,
  Badge,
  Alert,
  GridSection,
  H1,
  H2
} from '@/design/ui';
import { TrackingMap } from '@/components/business/TrackingMap';
import { TrafficETA } from '@/components/business/TrafficETA';
// Use API route instead of direct import (booking-service uses Admin SDK)
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { firebaseTrackingService, type ETACalculation, type DriverLocation } from '@/lib/services/firebase-tracking-service';
import { Booking } from '@/types/booking';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { AddToCalendarButton } from '@/components/business/AddToCalendarButton';
import { hasCalendarBeenAdded } from '@/lib/utils/calendar-utils';

interface TrackingPageClientProps {
  bookingId: string;
}

export default function TrackingPageClient({ bookingId }: TrackingPageClientProps) {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.tracking || {};
  const searchParams = useSearchParams();
  const trackingToken = searchParams?.get('token') ?? undefined;
  
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etaCalculation, setETACalculation] = useState<ETACalculation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [showCalendarButton, setShowCalendarButton] = useState(false);

  // Load booking data and initialize Firebase tracking
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = trackingToken
          ? `/api/booking/${bookingId}?token=${encodeURIComponent(trackingToken)}`
          : `/api/booking/${bookingId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const bookingData = await response.json();
        if (!bookingData) {
          setError(cmsData?.['tracking-bookingNotFound'] || 'Booking not found');
          return;
        }

        const normalizedBooking = adaptOldBookingToNew(bookingData);
        setBooking(normalizedBooking);

        // Check if calendar was already added
        if (normalizedBooking?.id) {
          setShowCalendarButton(!hasCalendarBeenAdded(normalizedBooking.id));
        }

        // Initialize Firebase tracking
        await firebaseTrackingService.initializeTracking(bookingId);
        setTrackingActive(true);
        
        // Set up location update callback
        firebaseTrackingService.onLocationUpdate(bookingId, (location: DriverLocation) => {
          setBooking(prev => prev ? {
            ...prev,
            driverLocation: location,
            updatedAt: new Date()
          } : null);
          setLastUpdate(new Date());
        });

        // Set up ETA update callback
        firebaseTrackingService.onETAUpdate(bookingId, (eta: ETACalculation) => {
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
          } catch {
            // Initial ETA is optional; page still renders with live updates.
          }
        }

      } catch {
        setError(cmsData?.['tracking-loadFailed'] || 'Failed to load booking information');
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
  }, [bookingId, trackingActive, cmsData]);

  // Handle ETA updates
  const handleETAUpdate = (eta: ETACalculation) => {
    setETACalculation(eta);
    setLastUpdate(new Date());
  };

  // Handle map load
  const handleMapLoad = (_map: google.maps.Map) => {
    // console.log('🗺️ Enhanced map loaded successfully');
  };

  // Refresh tracking data
  const refreshTracking = async () => {
    if (!booking) return;
    
    try {
      const updatedETA = await firebaseTrackingService.calculateAdvancedETA(
        bookingId,
        booking.trip.pickup.address,
        booking.trip.dropoff.address,
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
    } catch {
      setError(cmsData?.['tracking-loadFailed'] || 'Failed to load booking information');
    }
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text cmsId="loading-message" >
            {cmsData?.['tracking-message'] || 'Loading enhanced tracking information...'}
          </Text>
          <Text variant="muted" size="sm" cmsId="loading-subtitle" >
            {cmsData?.['tracking-subtitle'] || 'Initializing real-time location tracking...'}
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
            <Text cmsId="error-message" >
              {error || (cmsData?.['tracking-bookingNotFound'] || 'Booking not found')}
            </Text>
          </Alert>
          <Button onClick={() => window.history.back()} cmsId="error-go-back">
            {cmsData?.['tracking-goBack'] || 'Go Back'}
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
              <H1 cmsId="title" >
                {cmsData?.['tracking-title'] || 'Enhanced Live Tracking'}
              </H1>
              <Text variant="muted" cmsId="subtitle" >
                {cmsData?.['tracking-subtitle'] || 'Real-time tracking with traffic-aware ETA calculations'}
              </Text>
            </Stack>
            <Button 
              variant="outline" 
              onClick={refreshTracking}
              disabled={!trackingActive}
              cmsId="refresh-eta"
            >
              {cmsData?.['tracking-refreshETA'] || 'Refresh ETA'}
            </Button>
          </Stack>
          {lastUpdate && (
            <Text variant="muted" size="sm" cmsId="last-update" >
              {cmsData?.['tracking-label'] || 'Last updated:'} {lastUpdate.toLocaleTimeString()}
              {trackingActive && (cmsData?.['tracking-live'] || ' • Live tracking active')}
            </Text>
          )}
        </Stack>

        {/* Main Content Grid */}
        <GridSection variant="content" columns={2}>
          {/* Tracking Map */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack direction="horizontal" justify="space-between" align="center">
                <H2 cmsId="map-title" >
                  {cmsData?.['tracking-title'] || 'Live Map'}
                </H2>
                <Badge 
                  variant={trackingActive ? 'success' : 'warning'}
                  size="sm"
                  cmsId="map-status"
                >
                  {trackingActive ? 
                    (cmsData?.['tracking-live'] || 'Live') : 
                    (cmsData?.['tracking-offline'] || 'Offline')
                  }
                </Badge>
              </Stack>
              <TrackingMap
                bookingId={booking.id!}
                pickupLocation={booking.trip.pickup.address}
                dropoffLocation={booking.trip.dropoff.address}
                driverLocation={booking.driverLocation}
                estimatedArrival={booking.estimatedArrival}
                status={booking.status}
                onMapLoad={handleMapLoad}
                cmsData={cmsData}
              />
            </Stack>
          </Box>

          {/* Traffic-Aware ETA */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H2 cmsId="eta-title" >
                {cmsData?.['tracking-title'] || 'Traffic-Aware ETA'}
              </H2>
              <TrafficETA
                bookingId={booking.id!}
                pickupLocation={booking.trip.pickup.address}
                dropoffLocation={booking.trip.dropoff.address}
                currentLocation={booking.driverLocation ? {
                  lat: booking.driverLocation.lat,
                  lng: booking.driverLocation.lng,
                  timestamp: booking.driverLocation.timestamp,
                  heading: booking.driverLocation.heading || 0,
                  speed: booking.driverLocation.speed || 0
                } : undefined}
                onETAUpdate={handleETAUpdate}
                cmsData={cmsData}
              />
            </Stack>
          </Box>
        </GridSection>

        {/* Booking Details */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <H2 cmsId="booking-details-title" >
              {cmsData?.['tracking-title'] || 'Booking Details'}
            </H2>
            
            <GridSection variant="content" columns={3}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-booking-id" >
                  {cmsData?.['tracking-bookingId'] || 'Booking ID'}
                </Text>
                <Text weight="bold">{booking.id}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-passenger" >
                  {cmsData?.['tracking-passenger'] || 'Passenger'}
                </Text>
                <Text weight="bold">{booking.customer.name}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-status" >
                  {cmsData?.['tracking-status'] || 'Status'}
                </Text>
                <Badge 
                  variant={
                    booking.status === 'completed' ? 'success' :
                    booking.status === 'in-progress' ? 'info' :
                    booking.status === 'confirmed' ? 'warning' :
                    booking.status === 'cancelled' ? 'error' :
                    booking.status === 'requires_approval' ? 'warning' :
                    booking.status === 'pending' ? 'pending' :
                    'default'
                  }
                  cmsId="booking-details-status-value"
                >
                  {cmsData?.[`pages.tracking.bookingDetails.status.${booking.status}`] || booking.status}
                </Badge>
              </Stack>
            </GridSection>

            <GridSection variant="content" columns={3}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-pickup-time" >
                  {cmsData?.['tracking-pickupTime'] || 'Pickup Time'}
                </Text>
                <Text weight="bold">
                  {new Date(booking.trip.pickupDateTime).toLocaleString()}
                </Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-fare" >
                  {cmsData?.['tracking-fare'] || 'Fare'}
                </Text>
                <Text weight="bold" cmsId="ignore">${booking.trip.fare?.toFixed(2)}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="booking-details-driver" >
                  {cmsData?.['tracking-driver'] || 'Driver'}
                </Text>
                <Text weight="bold">
                  {booking.driverName || (cmsData?.['tracking-driverNotAssigned'] || 'Not assigned yet')}
                </Text>
              </Stack>
            </GridSection>

            {/* Route Information */}
            <Stack spacing="sm">
              <Text variant="muted" size="sm" cmsId="booking-details-route" >
                {cmsData?.['tracking-route'] || 'Route'}
              </Text>
              <Text weight="bold" cmsId="ignore">
                {booking.trip.pickup.address} → {booking.trip.dropoff.address}
              </Text>
            </Stack>

            {/* Add to Calendar (conditional) */}
            {showCalendarButton && booking?.id && (
              <Stack spacing="sm">
                <AddToCalendarButton
                  pickupAddress={booking.trip.pickup.address}
                  dropoffAddress={booking.trip.dropoff.address}
                  pickupDateTime={booking.trip.pickupDateTime}
                  bookingId={booking.id}
                  customerName={booking.customer.name}
                  variant="primary"
                  size="md"
                />
              </Stack>
            )}

            {/* ETA Information */}
            {etaCalculation && (
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="eta-current" >
                  {cmsData?.['tracking-current'] || 'Current ETA'}
                </Text>
                <Text weight="bold" cmsId="ignore">
                  {etaCalculation.estimatedArrival.toLocaleTimeString()} 
                  ({etaCalculation.duration} {cmsData?.['tracking-minutes'] || 'min'}, {etaCalculation.distance.toFixed(1)} {cmsData?.['tracking-miles'] || 'miles'})
                </Text>
                <Text size="sm" variant="muted" cmsId="eta-details" >
                  {cmsData?.['tracking-traffic'] || 'Traffic:'} {etaCalculation.trafficConditions} • {cmsData?.['tracking-confidence'] || 'Confidence:'} {(etaCalculation.confidence * 100).toFixed(0)}%
                </Text>
              </Stack>
            )}

            {/* Driver Location Info */}
            {booking.driverLocation && (
              <Stack spacing="sm">
                <Text variant="muted" size="sm" cmsId="driver-location-title" >
                  {cmsData?.['tracking-title'] || 'Driver Location'}
                </Text>
                <Text weight="bold" cmsId="ignore">
                  {booking.driverLocation.lat.toFixed(4)}, {booking.driverLocation.lng.toFixed(4)}
                </Text>
                <Text size="sm" variant="muted" cmsId="driver-location-details" >
                  {cmsData?.['tracking-speed'] || 'Speed:'} {booking.driverLocation.speed || 0} {cmsData?.['tracking-mph'] || 'mph'} • 
                  {cmsData?.['tracking-updated'] || 'Updated:'} {booking.driverLocation.timestamp.toLocaleTimeString()}
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
            cmsId="actions-back-to-bookings"
          >
            {cmsData?.['tracking-backToBookings'] || 'Back to Bookings'}
          </Button>
          
          <Button 
            variant="primary"
            onClick={() => window.location.href = `/booking/${booking.id}`}
            fullWidth
            cmsId="actions-view-booking"
          >
            {cmsData?.['tracking-viewBooking'] || 'View Booking Details'}
          </Button>
        </Stack>

        {/* Real-time Status */}
        {booking.status === 'in-progress' && (
          <Alert variant="info">
            <Stack spacing="xs">
              <Text weight="bold" cmsId="live-updates-title" >
                {cmsData?.['tracking-title'] || 'Live Updates Active'}
              </Text>
              <Text size="sm" cmsId="live-updates-description" >
                {cmsData?.['tracking-description'] || 'Your driver\'s location and ETA are being updated in real-time. The map will automatically refresh as your driver moves.'}
                {trackingActive && (cmsData?.['tracking-firebase'] || ' Firebase tracking is connected and active.')}
              </Text>
            </Stack>
          </Alert>
        )}

        {/* Tracking Status */}
        {!trackingActive && booking.status !== 'completed' && (
          <Alert variant="warning">
            <Stack spacing="xs">
              <Text weight="bold" cmsId="offline-title" >
                {cmsData?.['tracking-title'] || 'Tracking Offline'}
              </Text>
              <Text size="sm" cmsId="offline-description" >
                {cmsData?.['tracking-description'] || 'Real-time tracking is currently offline. ETA calculations may not be accurate. Try refreshing the page to reconnect.'}
              </Text>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
