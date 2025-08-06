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

interface MapMarker {
  position: google.maps.LatLngLiteral;
  title: string;
  icon?: string;
}

export function TrackingMap({
  bookingId,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  estimatedArrival,
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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Google Maps API if not already loaded
        if (!window.google?.maps) {
          await loadGoogleMapsAPI();
        }

        // Get coordinates for pickup and dropoff locations
        const [pickup, dropoff] = await Promise.all([
          getCoordinates(pickupLocation),
          getCoordinates(dropoffLocation)
        ]);

        if (!pickup || !dropoff) {
          throw new Error('Could not get coordinates for locations');
        }

        setPickupCoords(pickup);
        setDropoffCoords(dropoff);

        // Create map instance
        const map = new google.maps.Map(mapRef.current!, {
          center: pickup,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: getMapStyles(),
        });

        mapInstanceRef.current = map;

        // Add pickup and dropoff markers
        addMarker('pickup', pickup, 'Pickup Location', '🚗');
        addMarker('dropoff', dropoff, 'Dropoff Location', '🏁');

        // Draw route between pickup and dropoff
        drawRoute(pickup, dropoff);

        // Call onMapLoad callback
        if (onMapLoad) {
          onMapLoad(map);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map. Please try again.');
        setLoading(false);
      }
    };

    initMap();
  }, [pickupLocation, dropoffLocation, onMapLoad]);

  // Update driver location when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return;

    const driverPos = {
      lat: driverLocation.lat,
      lng: driverLocation.lng,
    };

    // Update or create driver marker
    updateDriverMarker(driverPos, driverLocation.heading);

    // Center map on driver if status is 'in-progress'
    if (status === 'in-progress') {
      mapInstanceRef.current.setCenter(driverPos);
      mapInstanceRef.current.setZoom(14);
    }
  }, [driverLocation, status]);

  // Load Google Maps API
  const loadGoogleMapsAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  };

  // Get coordinates for an address
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

  // Update driver marker
  const updateDriverMarker = (position: google.maps.LatLngLiteral, heading?: number) => {
    if (!mapInstanceRef.current) return;

    let driverMarker = markersRef.current.get('driver');
    
    if (!driverMarker) {
      // Create new driver marker
      driverMarker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: 'Driver Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300ff00"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
      });
      markersRef.current.set('driver', driverMarker);
    } else {
      // Update existing marker position
      driverMarker.setPosition(position);
    }

    // Rotate marker based on heading
    if (heading !== undefined) {
      // Note: Google Maps marker rotation is limited, so we'll skip rotation for now
      // The marker will still update position correctly
    }
  };

  // Draw route between two points
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

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading map...</Text>
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
      <Stack spacing="lg">
        {/* Map Status */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="xs">
            <Text weight="bold" size="lg">Live Tracking</Text>
            <Text variant="muted">
              {status === 'in-progress' && driverLocation 
                ? 'Driver is on the way'
                : status === 'confirmed'
                ? 'Driver assigned'
                : 'Waiting for driver assignment'
              }
            </Text>
          </Stack>
          
          {estimatedArrival && (
            <Box variant="outlined" padding="sm">
              <Text size="sm" weight="bold">
                ETA: {estimatedArrival.toLocaleTimeString()}
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