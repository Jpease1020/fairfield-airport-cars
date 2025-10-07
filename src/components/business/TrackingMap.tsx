'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Container,
  Stack,
  Text,
  LoadingSpinner,
  Alert,
  Box
} from '@/design/ui';
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
  cmsData: any;
}

export function TrackingMap({
  bookingId,
  pickupLocation,
  dropoffLocation,
  status,
  onMapLoad,
  cmsData
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Coordinates are computed locally for route drawing; no need to store in state

  // Real-time tracking hook
  const {
    bookingStatus,
    loading: trackingLoading,
    error: trackingError,
    // Unused here; updates are handled within the hook
  } = useRealTimeTracking(bookingId);

  // Loading and error states
  const effectiveLoading = loading || trackingLoading;
  const effectiveError = error || trackingError;

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for the DOM element to be available
        if (!mapRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!mapRef.current) {
            throw new Error('Map container not available');
          }
        }

        // Wait for Google Maps API to be loaded via provider
        if (!window.google?.maps) {
          throw new Error('Google Maps API not loaded');
        }

        // Get coordinates for locations
        const pickup = await getCoordinates(pickupLocation);
        const dropoff = await getCoordinates(dropoffLocation);

        // Check if coordinates were obtained successfully
        if (!pickup || !dropoff) {
          throw new Error('Could not get coordinates for pickup or dropoff location');
        }

        // Create Google Maps instance
        const map = new google.maps.Map(mapRef.current, {
          zoom: 13,
          center: pickup,
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

    // Only initialize if we have a valid ref and haven't already initialized
    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, []);

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
    }
  }, [bookingStatus?.estimatedArrival]);



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

  // Draw simple route line when Directions API is not available
  const drawSimpleRoute = (origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    if (!mapInstanceRef.current) return;

    // Remove existing directions renderer
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    // Create a simple polyline between the two points
    const simpleRoute = new google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: colors.primary[600],
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: mapInstanceRef.current,
    });

    // Store reference to remove later if needed
    directionsRendererRef.current = {
      setMap: (map: google.maps.Map | null) => {
        simpleRoute.setMap(map);
      },
      setDirections: () => {}, // No-op for compatibility
    } as any;
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
        } else if (status === 'REQUEST_DENIED') {
          console.warn('Directions API not available - showing direct route line instead');
          console.warn('💡 Enable Directions API in Google Cloud Console to see real routes');
          // Fallback: draw a simple line between points
          drawSimpleRoute(origin, destination);
        } else if (status === 'ZERO_RESULTS') {
          console.warn('No route found - showing direct route line instead');
          drawSimpleRoute(origin, destination);
        } else {
          console.warn('Directions API error:', status, '- showing direct route line instead');
          drawSimpleRoute(origin, destination);
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

  if (effectiveLoading) {
    return (
      <Container data-testid="tracking-map-loading">
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text cmsId="tracking-map-loading">{ cmsData?.['trackingMapLoading'] || 'Loading map...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (effectiveError) {
    // Special handling for missing Google Maps API key
    if (error?.includes('Google Maps API key is not configured')) {
      return (
        <Container data-testid="tracking-map-error">
          <Stack spacing="lg" align="center">
            <Text variant="h3" color="secondary" cmsId="tracking-map-google-maps-not-available-title">{cmsData?.['trackingMapGoogleMapsNotAvailableTitle'] || '🗺️ Google Maps Not Available'}</Text>
            <Text color="secondary" cmsId="tracking-map-google-maps-not-available">{cmsData?.['trackingMapGoogleMapsNotAvailable'] || 'To use the tracking system, you need to configure a Google Maps API key.'}</Text>
            <Text variant="body" color="secondary" size="sm" cmsId="tracking-map-google-maps-not-available-set-api-key">{cmsData?.['trackingMapGoogleMapsNotAvailableSetApiKey'] || 'Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file'}</Text>
          </Stack>
        </Container>
      );
    }
    
    return (
      <Container data-testid="tracking-map-error">
        <Alert variant="error">
          <Text cmsId="tracking-map-error">{cmsData?.['trackingMapError'] || error || trackingError || 'Unknown error'}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container data-testid="tracking-map">
      <Stack spacing="lg">
        {/* Map Status */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="xs">
            <Text weight="bold" size="lg" cmsId="tracking-map-live-tracking">{cmsData?.['trackingMapLiveTracking'] || 'Live Tracking'}</Text>
            <Text variant="muted">
              {bookingStatus?.driverLocation 
                ? cmsData?.['trackingMapDriverIsOnTheWay'] || 'Driver is on the way'
                : cmsData?.['trackingMapWaitingForDriverAssignment'] || 'Waiting for driver assignment'
              }
            </Text>
          </Stack>
          
          {(bookingStatus?.estimatedArrival) && (
            <Box variant="outlined" padding="sm">
              <Text size="sm" weight="bold">
                {cmsData?.['trackingMapEta'] || 'ETA:'} {bookingStatus?.estimatedArrival 
                  ? new Date(bookingStatus.estimatedArrival).toLocaleTimeString()
                  : cmsData?.['trackingMapCalculating'] || 'Calculating...'
                }
              </Text>
            </Box>
          )}
        </Stack>

        {/* Map Container */}
        <MapContainer
          ref={mapRef}
          data-testid="tracking-map-canvas"
        />
        
        {/* Map Legend */}
        <Stack direction="horizontal" spacing="md" align="center">
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.success[600]} />
            <Text size="sm" cmsId="tracking-map-driver-location">{cmsData?.['trackingMapDriverLocation'] || 'Driver Location'}</Text>
          </Stack>
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.primary[600]} />
            <Text size="sm" cmsId="tracking-map-pickup-location">{cmsData?.['trackingMapPickupLocation'] || 'Pickup Location'}</Text>
          </Stack>
          <Stack direction="horizontal" align="center" spacing="xs">
            <LegendItem $backgroundColor={colors.danger[600]} />
            <Text size="sm" cmsId="tracking-map-dropoff-location">{cmsData?.['trackingMapDropoffLocation'] || 'Dropoff Location'}</Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
