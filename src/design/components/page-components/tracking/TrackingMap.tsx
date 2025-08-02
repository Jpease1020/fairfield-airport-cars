'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Container, 
  Text, 
  Badge,
  Stack,
  Box,
  Card
} from '@/ui';
import { TrackingData } from '@/lib/services/real-time-tracking-service';

// Styled component for map container
const MapContainer = styled.div<{ height: string }>`
  height: ${props => props.height};
  width: 100%;
`;

// Styled component for loading container
const LoadingContainer = styled.div<{ height: string }>`
  height: ${props => props.height};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled component for map wrapper
const MapWrapper = styled.div<{ height: string }>`
  height: ${props => props.height};
  width: 100%;
`;

// Google Maps API types
interface GoogleMapsMap {
  setCenter: (position: { lat: number; lng: number }) => void;
}

interface GoogleMapsMarker {
  setPosition: (position: { lat: number; lng: number }) => void;
}

interface GoogleMapsDirectionsService {
  route: (_request: unknown, _callback: (_result: unknown, _status: string) => void) => void;
}

interface GoogleMapsDirectionsRenderer {
  setDirections: (_result: unknown) => void;
}

interface GoogleMapsSize {
  new (_width: number, _height: number): unknown;
}

interface GoogleMapsPoint {
  new (_x: number, _y: number): unknown;
}

interface GoogleMapsTravelMode {
  DRIVING: string;
}

interface GoogleMapsTrafficModel {
  BEST_GUESS: string;
}

interface GoogleMapsMapTypeId {
  ROADMAP: string;
}

interface GoogleMapsAPI {
  maps: {
    Map: new (_element: HTMLElement, _options: unknown) => GoogleMapsMap;
    Marker: new (_options: unknown) => GoogleMapsMarker;
    DirectionsService: new () => GoogleMapsDirectionsService;
    DirectionsRenderer: new (_options: unknown) => GoogleMapsDirectionsRenderer;
    Size: GoogleMapsSize;
    Point: GoogleMapsPoint;
    TravelMode: GoogleMapsTravelMode;
    TrafficModel: GoogleMapsTrafficModel;
    MapTypeId: GoogleMapsMapTypeId;
  };
}

interface WindowWithGoogleMaps extends globalThis.Window {
  google: GoogleMapsAPI;
}

interface TrackingMapProps {
  trackingData: TrackingData;
  height?: string;
  showControls?: boolean;
}

export function TrackingMap({ 
  trackingData, 
  height = '300px',
  showControls = true 
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMapsMap | null>(null);
  const [driverMarker, setDriverMarker] = useState<GoogleMapsMarker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      loadGoogleMaps();
    }
  }, []);

  useEffect(() => {
    if (map && trackingData.driverLocation) {
      updateDriverLocation();
    }
  }, [map, trackingData.driverLocation]);

  useEffect(() => {
    if (map && trackingData.pickupLocation && trackingData.dropoffLocation) {
      updateRoute();
    }
  }, [map, trackingData.pickupLocation, trackingData.dropoffLocation]);

  const loadGoogleMaps = async () => {
    try {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };
      
      document.head.appendChild(script);
    } catch {
      // Error handling for Google Maps loading
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const center = trackingData.driverLocation || 
      { lat: trackingData.pickupLocation.lat, lng: trackingData.pickupLocation.lng };

    const googleMap = new ((window as WindowWithGoogleMaps).google.maps.Map)(mapRef.current, {
      center,
      zoom: 14,
      mapTypeId: ((window as WindowWithGoogleMaps).google.maps.MapTypeId.ROADMAP),
      styles: getMapStyles(),
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      streetViewControl: false,
      fullscreenControl: showControls
    });

    setMap(googleMap);
    setIsMapLoaded(true);
  };

  const updateDriverLocation = () => {
    if (!map || !trackingData.driverLocation) return;

    const position = {
      lat: trackingData.driverLocation.lat,
      lng: trackingData.driverLocation.lng
    };

    // Update map center to follow driver
    map.setCenter(position);

    // Update or create driver marker
    if (driverMarker) {
      driverMarker.setPosition(position);
    } else {
      const marker = new ((window as WindowWithGoogleMaps).google.maps.Marker)({
        position,
        map,
        icon: {
          url: '/driver-marker.png', // Custom driver icon
          scaledSize: new ((window as WindowWithGoogleMaps).google.maps.Size)(32, 32),
          anchor: new ((window as WindowWithGoogleMaps).google.maps.Point)(16, 16)
        },
        title: 'Your Driver'
      });
      setDriverMarker(marker);
    }
  };

  const updateRoute = async () => {
    if (!map || !trackingData.pickupLocation || !trackingData.dropoffLocation) return;

    try {
      // Get route from Google Maps Directions API
      const directionsService = new ((window as WindowWithGoogleMaps).google.maps.DirectionsService)();
      const directionsRenderer = new ((window as WindowWithGoogleMaps).google.maps.DirectionsRenderer)({
        map,
        suppressMarkers: true // We'll add our own markers
      });

      const request = {
        origin: { lat: trackingData.pickupLocation.lat, lng: trackingData.pickupLocation.lng },
        destination: { lat: trackingData.dropoffLocation.lat, lng: trackingData.dropoffLocation.lng },
        travelMode: ((window as WindowWithGoogleMaps).google.maps.TravelMode.DRIVING),
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: ((window as WindowWithGoogleMaps).google.maps.TrafficModel.BEST_GUESS)
        }
      };

      directionsService.route(request, (result: unknown, status: string) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Add pickup and dropoff markers
          addLocationMarkers();
        }
      });
    } catch {
      // Error handling for route update
    }
  };

  const addLocationMarkers = () => {
    if (!map) return;

    // Pickup marker
    new ((window as WindowWithGoogleMaps).google.maps.Marker)({
      position: { lat: trackingData.pickupLocation.lat, lng: trackingData.pickupLocation.lng },
      map,
      icon: {
        url: '/pickup-marker.png',
        scaledSize: new ((window as WindowWithGoogleMaps).google.maps.Size)(24, 24),
        anchor: new ((window as WindowWithGoogleMaps).google.maps.Point)(12, 12)
      },
      title: 'Pickup Location'
    });

    // Dropoff marker
    new ((window as WindowWithGoogleMaps).google.maps.Marker)({
      position: { lat: trackingData.dropoffLocation.lat, lng: trackingData.dropoffLocation.lng },
      map,
      icon: {
        url: '/dropoff-marker.png',
        scaledSize: new ((window as WindowWithGoogleMaps).google.maps.Size)(24, 24),
        anchor: new ((window as WindowWithGoogleMaps).google.maps.Point)(12, 12)
      },
      title: 'Dropoff Location'
    });
  };

  const getMapStyles = () => {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  };

  if (!isMapLoaded) {
    return (
      <Container variant="default" padding="md">
        <Card variant="card" padding="lg">
          <Box 
            variant="outlined"
            padding="lg"
            rounded="md"
          >
            <LoadingContainer height={height}>
              <Stack direction="vertical" spacing="sm" align="center">
                <Text variant="body" size="lg">🗺️</Text>
                <Text variant="small" color="muted" align="center">
                  Loading map...
                </Text>
              </Stack>
            </LoadingContainer>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="md">
        <Stack direction="vertical" spacing="xs">
          <Text variant="lead" weight="bold">
            Live Tracking Map
          </Text>
          <Text variant="small" color="muted">
            Real-time driver location and route
          </Text>
        </Stack>

        <Card variant="card" padding="none">
          <Box 
            variant="outlined" 
            padding="none" 
            rounded="md"
          >
            <MapWrapper height={height}>
              <MapContainer height={height} ref={mapRef} />
            </MapWrapper>
          </Box>
        </Card>

        {trackingData.driverLocation && (
          <Box variant="filled" padding="sm" rounded="md">
            <Stack direction="horizontal" spacing="sm" align="center">
              <Badge variant="success">📍</Badge>
              <Text variant="small">
                Driver location updated: {new Date(trackingData.driverLocation.timestamp).toLocaleTimeString()}
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
} 