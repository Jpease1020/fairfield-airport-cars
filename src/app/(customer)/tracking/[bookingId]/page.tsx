'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Box, 
  H2, 
  Text, 
  Button, 
  Grid, 
  GridItem,
  LoadingSpinner,
  Badge,
  Alert
} from '@/ui';
import { EditableText } from '@/ui';
import { LiveTrackingMap } from '@/components/business/LiveTrackingMap';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { TrackingData } from '@/lib/services/real-time-tracking-service';

function TrackingPageContent() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  // Use real-time tracking hook
  const {
    trackingData,
    loading,
    error,
    isConnected,
  } = useRealTimeTracking({
    bookingId,
    autoInitialize: true,
    enableLocationTracking: false,
    enableWebSocket: true,
  });

  // Load booking details for additional info
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        const response = await fetch(`/api/booking/get-booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
        }
      } catch (error) {
        console.error('Error loading booking details:', error);
      }
    };
    
    loadBookingDetails();
  }, [bookingId]);

  const getStatusColor = (status: TrackingData['status']) => {
    switch (status) {
      case 'confirmed': return 'info';
      case 'driver-assigned': return 'warning';
      case 'en-route': return 'success';
      case 'arrived': return 'success';
      case 'completed': return 'confirmed';
      default: return 'info';
    }
  };

  const getStatusText = (status: TrackingData['status']) => {
    switch (status) {
      case 'confirmed': return 'Booking Confirmed';
      case 'driver-assigned': return 'Driver Assigned';
      case 'en-route': return 'Driver En Route';
      case 'arrived': return 'Driver Arrived';
      case 'completed': return 'Ride Completed';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (status: TrackingData['status']) => {
    switch (status) {
      case 'confirmed': return '📋';
      case 'driver-assigned': return '👤';
      case 'en-route': return '🚗';
      case 'arrived': return '📍';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  const formatETA = (eta?: Date) => {
    if (!eta) return 'Calculating...';
    
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Arriving now';
    if (diffMins === 1) return '1 minute';
    return `${diffMins} minutes`;
  };

  const handleCallDriver = () => {
    if (bookingDetails?.driverPhone) {
      window.open(`tel:${bookingDetails.driverPhone}`);
    }
  };

  const handleTextDriver = () => {
    if (bookingDetails?.driverPhone) {
      window.open(`sms:${bookingDetails.driverPhone}`);
    }
  };

  if (loading && !trackingData) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>
            <EditableText field="tracking.loading" defaultValue="Loading tracking information...">
              Loading tracking information...
            </EditableText>
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
          <Button onClick={() => window.location.href = '/'}>
            <EditableText field="tracking.go_home" defaultValue="Go Home">
              Go Home
            </EditableText>
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!trackingData) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>
              <EditableText field="tracking.no_data" defaultValue="No tracking data available">
                No tracking data available
              </EditableText>
            </Text>
          </Alert>
          <Button onClick={() => window.location.href = '/'}>
            <EditableText field="tracking.go_home" defaultValue="Go Home">
              Go Home
            </EditableText>
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="lg" maxWidth="xl">
      <Stack spacing="xl">
        {/* Header with Real-time Status */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Stack spacing="sm">
                <H2>
                  <EditableText field="tracking.title" defaultValue="Track Your Ride">
                    Track Your Ride
                  </EditableText>
                </H2>
                <Text variant="lead">
                  <EditableText field="tracking.booking_id" defaultValue="Booking #">
                    Booking #
                  </EditableText>
                  {trackingData.bookingId}
                </Text>
              </Stack>
              <Stack align="center" spacing="sm">
                <Text size="lg">{getStatusIcon(trackingData.status)}</Text>
                <Badge variant={getStatusColor(trackingData.status)}>
                  {getStatusText(trackingData.status)}
                </Badge>
                {isConnected && (
                  <Text variant="muted" size="sm">
                    <EditableText field="tracking.live" defaultValue="LIVE">
                      LIVE
                    </EditableText>
                  </Text>
                )}
              </Stack>
            </Stack>
            
            {/* Real-time Updates */}
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="muted" size="sm">
                <EditableText field="tracking.last_updated" defaultValue="Last updated:">
                  Last updated:
                </EditableText> {trackingData.lastUpdated.toLocaleTimeString()}
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* ETA and Driver Info */}
        {(trackingData.status === 'en-route' || trackingData.status === 'arrived') && (
          <Grid cols={2} gap="lg">
            <Box variant="elevated" padding="md">
              <Stack spacing="sm" align="center">
                <Text size="lg">⏱️</Text>
                <Text weight="bold">
                  <EditableText field="tracking.eta" defaultValue="ETA">
                    ETA
                  </EditableText>
                </Text>
                <Text size="xl" color="primary">
                  {formatETA(trackingData.estimatedArrival)}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack spacing="sm" align="center">
                <Text size="lg">👤</Text>
                <Text weight="bold">
                  <EditableText field="tracking.driver" defaultValue="Driver">
                    Driver
                  </EditableText>
                </Text>
                <Text size="xl" color="primary">
                  {trackingData.driverName || 'Assigned'}
                </Text>
              </Stack>
            </Box>
          </Grid>
        )}

        {/* Driver Information */}
        {trackingData.driverName && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2>
                <EditableText field="tracking.driver_title" defaultValue="Your Driver">
                  Your Driver
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Text variant="lead">
                      <EditableText field="tracking.driver_name" defaultValue="Driver">
                        Driver
                      </EditableText>
                    </Text>
                    <Text weight="bold">{trackingData.driverName}</Text>
                    {bookingDetails?.driverPhone && (
                      <Text>📞 {bookingDetails.driverPhone}</Text>
                    )}
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Text variant="lead">
                      <EditableText field="tracking.vehicle_title" defaultValue="Vehicle">
                        Vehicle
                      </EditableText>
                    </Text>
                    {bookingDetails?.vehicleInfo && (
                      <>
                        <Text weight="bold">
                          {bookingDetails.vehicleInfo.year} {bookingDetails.vehicleInfo.make} {bookingDetails.vehicleInfo.model}
                        </Text>
                        <Text>Color: {bookingDetails.vehicleInfo.color}</Text>
                        <Text>Plate: {bookingDetails.vehicleInfo.licensePlate}</Text>
                      </>
                    )}
                  </Stack>
                </GridItem>
              </Grid>

              {bookingDetails?.driverPhone && (
                <Stack direction="horizontal" spacing="md">
                  <Button 
                    variant="primary" 
                    onClick={handleCallDriver}
                    fullWidth
                  >
                    📞 <EditableText field="tracking.call_driver" defaultValue="Call Driver">
                      Call Driver
                    </EditableText>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleTextDriver}
                    fullWidth
                  >
                    💬 <EditableText field="tracking.text_driver" defaultValue="Text Driver">
                      Text Driver
                    </EditableText>
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        )}

        {/* Trip Details */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              <EditableText field="tracking.trip_details" defaultValue="Trip Details">
                Trip Details
              </EditableText>
            </H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="tracking.pickup" defaultValue="Pickup">
                      Pickup
                    </EditableText>
                  </Text>
                  <Text>{trackingData.pickupLocation}</Text>
                  {bookingDetails?.pickupDateTime && (
                    <Text variant="muted">
                      <EditableText field="tracking.pickup_time" defaultValue="Time:">
                        Time:
                      </EditableText> {new Date(bookingDetails.pickupDateTime).toLocaleString()}
                    </Text>
                  )}
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="tracking.dropoff" defaultValue="Dropoff">
                      Dropoff
                    </EditableText>
                  </Text>
                  <Text>{trackingData.dropoffLocation}</Text>
                  {trackingData.estimatedArrival && (
                    <Text variant="muted">
                      <EditableText field="tracking.estimated_arrival" defaultValue="ETA:">
                        ETA:
                      </EditableText> {trackingData.estimatedArrival.toLocaleString()}
                    </Text>
                  )}
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Box>

        {/* Live Tracking Map */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              <EditableText field="tracking.live_map" defaultValue="Live Map">
                Live Map
              </EditableText>
            </H2>
            
            <LiveTrackingMap
              bookingId={bookingId}
              pickupLocation={trackingData.pickupLocation}
              dropoffLocation={trackingData.dropoffLocation}
            />
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="horizontal" spacing="md">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = `/booking/${bookingId}`}
            fullWidth
          >
            <EditableText field="tracking.view_booking" defaultValue="View Booking Details">
              View Booking Details
            </EditableText>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/bookings'}
            fullWidth
          >
            <EditableText field="tracking.all_bookings" defaultValue="All Bookings">
              All Bookings
            </EditableText>
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

export default function TrackingPage() {
  return <TrackingPageContent />;
} 