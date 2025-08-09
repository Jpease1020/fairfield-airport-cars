'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Container,
  Stack,
  Text,
  LoadingSpinner,
  Alert,
  Box
} from '@/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';

// Styled components for map elements
const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
`;

const LegendItem = styled.div<{ $backgroundColor: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.$backgroundColor};
`;

interface TrackingMapProps {
  bookingId: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  estimatedArrival?: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  onMapLoad?: (map: google.maps.Map) => void;
}


export function TrackingMap({
  bookingId,
  pickupLocation,
  dropoffLocation,
  _driverLocation: driverLocation,
  _estimatedArrival: estimatedArrival,
  status,
  onMapLoad
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<google.maps.LatLngLiteral | null>(null);

  // Real-time tracking hook
  const {
    bookingStatus,
    loading: trackingLoading,
    error: trackingError,
    updateDriverLocation,
    updateETA
  } = useRealTimeTracking(bookingId);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Google Maps API
        await loadGoogleMapsAPI();

        // Get coordinates for pickup and dropoff locations
        const [pickup, dropoff] = await Promise.all([
          getCoordinates(pickupLocation),
          getCoordinates(dropoffLocation)
        ]);

        if (!pickup || !dropoff) {
          throw new Error('Could not get coordinates for pickup or dropoff location');
        }

        setPickupCoords(pickup);
        setDropoffCoords(dropoff);

        // Initialize map
        const map = new google.maps.Map(mapRef.current!, {
          center: pickup,
          zoom: 12,
          styles: getMapStyles(),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Add markers
        addMarker('pickup', pickup, 'Pickup Location', '🏠');
        addMarker('dropoff', dropoff, 'Dropoff Location', '✈️');

        // Draw route
        drawRoute(pickup, dropoff);

        // Call onMapLoad callback
        if (onMapLoad) {
          onMapLoad(map);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, [pickupLocation, dropoffLocation, onMapLoad]);

  // Update driver location when it changes
  useEffect(() => {
    if (bookingStatus?.driverLocation && mapInstanceRef.current) {
      const location = bookingStatus.driverLocation;
      updateDriverMarker(
        { lat: location.lat, lng: location.lng },
        location.heading
      );
    }
  }, [bookingStatus?.driverLocation]);

  // Update ETA when it changes
  useEffect(() => {
    if (bookingStatus?.estimatedArrival) {
      // ETA is automatically updated through the real-time tracking hook
      console.log('ETA updated:', bookingStatus.estimatedArrival);
    }
  }, [bookingStatus?.estimatedArrival]);

  // Load Google Maps API
  const loadGoogleMapsAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  };

  // Get coordinates from address
  const getCoordinates = async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return { lat: location.lat(), lng: location.lng() };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Add marker to map
  const addMarker = (
    id: string,
    position: google.maps.LatLngLiteral,
    title: string,
    icon?: string
  ) => {
    if (!mapInstanceRef.current) return;

    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title,
      icon: icon ? {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(icon)}`,
        scaledSize: new google.maps.Size(30, 30),
      } : undefined,
    });

    markersRef.current.set(id, marker);
  };

  // Update driver marker with heading
  const updateDriverMarker = (position: google.maps.LatLngLiteral, heading?: number) => {
    if (!mapInstanceRef.current) return;

    // Remove existing driver marker
    const existingMarker = markersRef.current.get('driver');
    if (existingMarker) {
      existingMarker.setMap(null);
    }

    // Create new driver marker with heading
    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: 'Driver Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: colors.success[600],
        fillOpacity: 1,
        strokeColor: colors.success[600],
        strokeWeight: 2,
        rotation: heading || 0,
      },
    });

    markersRef.current.set('driver', marker);

    // Center map on driver if status is in-progress
    if (status === 'in-progress') {
      mapInstanceRef.current.panTo(position);
    }
  };

  // Draw route between pickup and dropoff
  const drawRoute = (origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    if (!mapInstanceRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: true, // We'll add our own markers
      polylineOptions: {
        strokeColor: colors.primary[600],
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsRendererRef.current = directionsRenderer;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  };

  // Custom map styles
  const getMapStyles = () => [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];

  if (loading || trackingLoading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading map...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || trackingError) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error || trackingError}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Map Status */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="xs">
            <Text weight="bold" size="lg">Live Tracking</Text>
            <Text variant="muted">
              {status === 'in-progress' && bookingStatus?.driverLocation 
                ? 'Driver is on the way'
                : status === 'confirmed'
                ? 'Driver assigned'
                : 'Waiting for driver assignment'
              }
            </Text>
          </Stack>
          
          {bookingStatus?.estimatedArrival && (
            <Box variant="outlined" padding="sm">
              <Text size="sm" weight="bold">
                ETA: {new Date(bookingStatus.estimatedArrival).toLocaleTimeString()}
              </Text>
            </Box>
          )}
        </Stack>

        {/* Map Container */}
        <MapContainer ref={mapRef} />

        {/* Map Legend */}
        <Stack direction="horizontal" spacing="md" align="center">
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.success[600]} />
            <Text size="sm">Driver Location</Text>
          </Stack>
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.primary[600]} />
            <Text size="sm">Pickup Location</Text>
          </Stack>
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.danger[600]} />
            <Text size="sm">Dropoff Location</Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
} 