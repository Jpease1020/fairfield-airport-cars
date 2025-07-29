'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
} from '@/components/ui';

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
  pickupDateTime: Date;
  lastUpdated: string;
}

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrackingData();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadTrackingData, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const loadTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tracking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        setError('Failed to load tracking data');
      }
    } catch (error) {
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
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Booking Confirmed';
      case 'confirmed': return 'Driver Assigned';
      case 'in-progress': return 'On the Way';
      case 'completed': return 'Ride Completed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text>Loading tracking information...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <StatusMessage type="error" message={error} />
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!trackingData) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <StatusMessage type="error" message="No tracking data available" />
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="lg" maxWidth="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Track Your Ride</H2>
            <Text variant="lead">Booking #{trackingData.bookingId}</Text>
            
            <StatusMessage 
              type={getStatusColor(trackingData.status) as any}
              message={getStatusText(trackingData.status)}
            />
          </Stack>
        </Card>

        {/* Driver Information */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Your Driver</H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Driver</Text>
                  <Text>{trackingData.driverName}</Text>
                  <Text>Phone: {trackingData.driverPhone}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Vehicle</Text>
                  {trackingData.vehicleInfo && (
                    <>
                      <Text>{trackingData.vehicleInfo.year} {trackingData.vehicleInfo.make} {trackingData.vehicleInfo.model}</Text>
                      <Text>Color: {trackingData.vehicleInfo.color}</Text>
                      <Text>Plate: {trackingData.vehicleInfo.licensePlate}</Text>
                    </>
                  )}
                </Stack>
              </GridItem>
            </Grid>

            <Button 
              variant="outline" 
              onClick={() => window.open(`tel:${trackingData.driverPhone}`)}
            >
              📞 Call Driver
            </Button>
          </Stack>
        </Card>

        {/* Trip Details */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Trip Details</H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Pickup</Text>
                  <Text>{trackingData.pickupLocation}</Text>
                  <Text>Time: {new Date(trackingData.pickupDateTime).toLocaleString()}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">Status</Text>
                  <Text>Last Updated: {new Date(trackingData.lastUpdated).toLocaleString()}</Text>
                  {trackingData.estimatedArrival && (
                    <Text>ETA: {new Date(trackingData.estimatedArrival).toLocaleString()}</Text>
                  )}
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Card>

        {/* Location Tracking */}
        {trackingData.currentLocation && (
          <Card variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2>Driver Location</H2>
              
              <Stack spacing="sm">
                <Text>Latitude: {trackingData.currentLocation.latitude.toFixed(6)}</Text>
                <Text>Longitude: {trackingData.currentLocation.longitude.toFixed(6)}</Text>
                <Text>Updated: {new Date(trackingData.currentLocation.timestamp).toLocaleString()}</Text>
              </Stack>

              <Button 
                variant="outline"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${trackingData.currentLocation!.latitude},${trackingData.currentLocation!.longitude}`;
                  window.open(url, '_blank');
                }}
              >
                🗺️ View on Map
              </Button>
            </Stack>
          </Card>
        )}

        {/* Actions */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>Actions</H2>
            
            <Stack direction="horizontal" spacing="md">
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/manage/${bookingId}`}
              >
                📋 View Booking Details
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                🏠 Go Home
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 