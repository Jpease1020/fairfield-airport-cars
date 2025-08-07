'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { TrackingData } from '@/lib/services/real-time-tracking-service';
import { 
  Container, 
  Stack, 
  Text, 
  Badge, 
  LoadingSpinner,
  Alert,
} from '@/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

interface LiveTrackingMapProps {
  bookingId: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  bookingId,
  pickupLocation,
  dropoffLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const _routePolylineRef = useRef<google.maps.Polyline | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize real-time tracking
  const {
    bookingStatus,
    loading,
    error,
  } = useRealTimeTracking(bookingId);

  // Initialize Google Maps
  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google Maps not loaded');
      return;
    }

    if (!mapRef.current) return;

    try {
      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 41.1403, lng: -73.2637 }, // Fairfield, CT
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Initialize directions service
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll add our own markers
        polylineOptions: {
          strokeColor: colors.primary[600],
          strokeWeight: 4,
        },
      });

      directionsRenderer.setMap(map);
      setDirectionsService(directionsService);
      setDirectionsRenderer(directionsRenderer);
      setMapLoaded(true);

      console.log('Google Maps initialized for tracking');
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, []);

  // Update map when tracking data changes
  useEffect(() => {
    if (!mapLoaded || !bookingStatus || !mapInstanceRef.current) return;

    updateMapWithTrackingData(bookingStatus);
  }, [bookingStatus, mapLoaded]);

  // Update map with tracking data
  const updateMapWithTrackingData = (data: any) => {
    if (!mapInstanceRef.current || !directionsService || !directionsRenderer) return;

    try {
      // Update driver marker if location is available
      if (data.driverLocation) {
        updateDriverMarker(data.driverLocation);
      }

      // Update route if we have pickup and dropoff locations
      if (pickupLocation && dropoffLocation) {
        updateRoute(pickupLocation, dropoffLocation, data.driverLocation);
      }

      // Update map center to follow driver
      if (data.driverLocation) {
        mapInstanceRef.current.setCenter({
          lat: data.driverLocation.lat,
          lng: data.driverLocation.lng,
        });
      }
    } catch (error) {
      console.error('Error updating map with tracking data:', error);
    }
  };

  // Update driver marker
  const updateDriverMarker = (location: TrackingData['driverLocation']) => {
    if (!mapInstanceRef.current || !location) return;

    const position = { lat: location.lat, lng: location.lng };

    if (driverMarkerRef.current) {
      // Update existing marker
      driverMarkerRef.current.setPosition(position);
    } else {
      // Create new marker
      driverMarkerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          url: '/icons/car-marker.svg', // You'll need to create this icon
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
        title: 'Your Driver',
      });
    }
  };

  // Update route
  const updateRoute = (
    origin: string, 
    destination: string, 
    driverLocation?: TrackingData['driverLocation']
  ) => {
    if (!directionsService || !directionsRenderer) return;

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false,
    };

    // If driver location is available, add it as a waypoint
    if (driverLocation) {
      request.waypoints = [{
        location: { lat: driverLocation.lat, lng: driverLocation.lng },
        stopover: false,
      }];
    }

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Error getting directions:', status);
      }
    });
  };

  // Get status display text
  const getStatusDisplay = (status: TrackingData['status']) => {
    switch (status) {
      case 'pending':
        return 'Booking Pending';
      case 'confirmed':
        return 'Driver Assigned';
      case 'in-progress':
        return 'Driver En Route';
      case 'completed':
        return 'Ride Completed';
      case 'cancelled':
        return 'Ride Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  // Get status color
  const getStatusColor = (status: TrackingData['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in-progress':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  // Format ETA
  const formatETA = (eta?: Date) => {
    if (!eta) return 'Calculating...';
    
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Arriving now';
    if (diffMins === 1) return '1 minute';
    return `${diffMins} minutes`;
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Connecting to real-time tracking...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error" title="Tracking Error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Status Header */}
        <Stack spacing="sm">
          <Stack direction="horizontal" align="center" spacing="md">
            <Badge 
              variant={getStatusColor(bookingStatus?.status || 'confirmed') as 'success' | 'warning' | 'error' | 'info' | 'pending' | 'confirmed' | 'completed' | 'cancelled'}
              size="lg"
            >
              {getStatusDisplay(bookingStatus?.status || 'confirmed')}
            </Badge>
          </Stack>
          
          {bookingStatus?.estimatedArrival && (
            <Text>
              Estimated arrival: {formatETA(bookingStatus.estimatedArrival)}
            </Text>
          )}
        </Stack>

        {/* Map Container */}
        <MapContainer ref={mapRef} />

        {/* Connection Status */}
        {loading && (
          <Alert variant="warning" title="Connection Issue">
            Real-time updates may be delayed. Please refresh if tracking doesn't update.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}; 