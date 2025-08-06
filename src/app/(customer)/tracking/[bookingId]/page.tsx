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
  Alert
} from '@/ui';
import { TrackingMap } from '@/components/business/TrackingMap';
import { TrackingETADisplay } from '@/components/business/TrackingETADisplay';
import { getBooking } from '@/lib/services/booking-service';
import { realTimeTrackingService } from '@/lib/services/real-time-tracking-service';
import { Booking } from '@/types/booking';

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Load booking data
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

        // Initialize real-time tracking
        await realTimeTrackingService.initializeTracking(bookingId);
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
  }, [bookingId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!bookingId || typeof window === 'undefined') return;

    const initializeWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws/bookings/${bookingId}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected for tracking');
        realTimeTrackingService.addConnection(bookingId, ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received tracking update:', data);
          
          // Update booking state with new data
          if (data.type === 'location_update') {
            setBooking(prev => prev ? {
              ...prev,
              driverLocation: data.data.location,
              estimatedArrival: data.data.estimatedArrival ? new Date(data.data.estimatedArrival) : prev.estimatedArrival,
              updatedAt: new Date(data.data.lastUpdated),
            } : null);
          } else if (data.type === 'status_update') {
            setBooking(prev => prev ? {
              ...prev,
              status: data.data.status,
              updatedAt: new Date(data.data.lastUpdated),
            } : null);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error - tracking updates may be delayed');
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        realTimeTrackingService.removeConnection(bookingId);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          initializeWebSocket();
        }, 5000);
      };
      
      setWsConnection(ws);
    };

    initializeWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
      realTimeTrackingService.removeConnection(bookingId);
    };
  }, [bookingId, wsConnection]);

  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    console.log('Map loaded successfully');
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading tracking information...</Text>
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
          <Text weight="bold" size="xl">Live Tracking</Text>
          <Text variant="muted">
            Track your ride in real-time
          </Text>
        </Stack>

        {/* Tracking Map */}
        <TrackingMap
          bookingId={booking.id!}
          pickupLocation={booking.pickupLocation}
          dropoffLocation={booking.dropoffLocation}
          driverLocation={booking.driverLocation}
          estimatedArrival={booking.estimatedArrival}
          status={booking.status}
          onMapLoad={handleMapLoad}
        />

        {/* ETA Display */}
        <TrackingETADisplay
          bookingId={booking.id!}
          estimatedArrival={booking.estimatedArrival}
          driverLocation={booking.driverLocation}
          status={booking.status}
          pickupLocation={booking.pickupLocation}
          dropoffLocation={booking.dropoffLocation}
        />

        {/* Booking Details */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Booking Details</Text>
            
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Booking ID</Text>
                <Text weight="bold">{booking.id}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Passenger</Text>
                <Text weight="bold">{booking.name}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Pickup Time</Text>
                <Text weight="bold">
                  {new Date(booking.pickupDateTime).toLocaleString()}
                </Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Fare</Text>
                <Text weight="bold">${booking.fare.toFixed(2)}</Text>
              </Stack>
              
              {booking.driverName && (
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text>Driver</Text>
                  <Text weight="bold">{booking.driverName}</Text>
                </Stack>
              )}
            </Stack>
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
      </Stack>
    </Container>
  );
} 