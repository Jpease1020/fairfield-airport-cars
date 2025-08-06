'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

interface TrackingData {
  bookingId: string;
  driverName: string;
  driverPhone: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  status: string;
  estimatedArrival?: Date;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  lastUpdated: string;
  eta?: number; // Estimated time of arrival in minutes
  distance?: number; // Distance in miles
}

function TrackingPageContent() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadTrackingData();
    // Poll for updates every 15 seconds for real-time tracking
    const interval = setInterval(() => {
      loadTrackingData();
      setLastUpdate(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const loadTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tracking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
        setIsRealTime(true);
      } else {
        setError('Failed to load tracking data');
      }
    } catch (_error) {
      setError('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'arrived': return 'success';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Booking Confirmed';
      case 'confirmed': return 'Driver Assigned';
      case 'in-progress': return 'On the Way';
      case 'arrived': return 'Driver Arrived';
      case 'completed': return 'Ride Completed';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '📋';
      case 'confirmed': return '👤';
      case 'in-progress': return '🚗';
      case 'arrived': return '📍';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  const formatETA = (eta?: number) => {
    if (!eta) return 'Calculating...';
    if (eta < 1) return 'Less than 1 minute';
    if (eta === 1) return '1 minute';
    return `${eta} minutes`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Calculating...';
    return `${distance.toFixed(1)} miles`;
  };

  const handleCallDriver = () => {
    if (trackingData?.driverPhone) {
      window.open(`tel:${trackingData.driverPhone}`);
    }
  };

  const handleTextDriver = () => {
    if (trackingData?.driverPhone) {
      window.open(`sms:${trackingData.driverPhone}`);
    }
  };

  const handleRefresh = () => {
    loadTrackingData();
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
                {isRealTime && (
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
                </EditableText> {lastUpdate.toLocaleTimeString()}
              </Text>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <EditableText field="tracking.refresh" defaultValue="Refresh">
                  Refresh
                </EditableText>
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ETA and Distance */}
        {(trackingData.status === 'in-progress' || trackingData.status === 'arrived') && (
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
                  {formatETA(trackingData.eta)}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack spacing="sm" align="center">
                <Text size="lg">📏</Text>
                <Text weight="bold">
                  <EditableText field="tracking.distance" defaultValue="Distance">
                    Distance
                  </EditableText>
                </Text>
                <Text size="xl" color="primary">
                  {formatDistance(trackingData.distance)}
                </Text>
              </Stack>
            </Box>
          </Grid>
        )}

        {/* Driver Information */}
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
                  <Text>📞 {trackingData.driverPhone}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="tracking.vehicle_title" defaultValue="Vehicle">
                      Vehicle
                    </EditableText>
                  </Text>
                  {trackingData.vehicleInfo && (
                    <>
                      <Text weight="bold">
                        {trackingData.vehicleInfo.year} {trackingData.vehicleInfo.make} {trackingData.vehicleInfo.model}
                      </Text>
                      <Text>Color: {trackingData.vehicleInfo.color}</Text>
                      <Text>Plate: {trackingData.vehicleInfo.licensePlate}</Text>
                    </>
                  )}
                </Stack>
              </GridItem>
            </Grid>

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
          </Stack>
        </Box>

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
                  <Text variant="muted">
                    <EditableText field="tracking.pickup_time" defaultValue="Time:">
                      Time:
                    </EditableText> {new Date(trackingData.pickupDateTime).toLocaleString()}
                  </Text>
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
                      </EditableText> {new Date(trackingData.estimatedArrival).toLocaleString()}
                    </Text>
                  )}
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Box>

        {/* Map Placeholder */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              <EditableText field="tracking.live_map" defaultValue="Live Map">
                Live Map
              </EditableText>
            </H2>
            
            <Box 
              variant="outlined" 
              padding="xl"
            >
              <Box variant="outlined" padding="xl">
                             <Stack spacing="md" align="center">
                 <Text size="lg">🗺️</Text>
                 <Text variant="muted" align="center">
                   <EditableText field="tracking.map_placeholder" defaultValue="Interactive map coming soon">
                     Interactive map coming soon
                   </EditableText>
                 </Text>
                 <Text variant="muted" size="sm" align="center">
                   <EditableText field="tracking.map_description" defaultValue="Real-time driver location and route visualization">
                     Real-time driver location and route visualization
                   </EditableText>
                 </Text>
               </Stack>
             </Box>
           </Box>
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