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
  // Add mock mode for testing
  isMockMode?: boolean;
  mockDriverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
}

export function TrackingMap({
  bookingId,
  pickupLocation,
  dropoffLocation,
  status,
  onMapLoad,
  isMockMode = false,
  mockDriverLocation
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Coordinates are computed locally for route drawing; no need to store in state

  // Real-time tracking hook - only use when not in mock mode
  const {
    bookingStatus,
    loading: trackingLoading,
    error: trackingError,
    // Unused here; updates are handled within the hook
  } = useRealTimeTracking(isMockMode ? '' : bookingId); // Empty string prevents API calls in mock mode

  // In mock mode, we don't need to wait for tracking to load
  const effectiveLoading = isMockMode ? false : (loading || trackingLoading);
  const effectiveError = isMockMode ? null : (error || trackingError);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        console.log('🗺️ Starting map initialization...');
        setLoading(true);
        setError(null);

        // Wait for the DOM element to be available
        if (!mapRef.current) {
          console.log('⏳ Waiting for map container to be available...');
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!mapRef.current) {
            throw new Error('Map container not available');
          }
        }

        console.log('✅ Map container found:', mapRef.current);

        // Load Google Maps API
        console.log('🔑 Loading Google Maps API...');
        await loadGoogleMapsAPI();
        console.log('✅ Google Maps API loaded successfully');

        // Get coordinates for locations
        console.log('📍 Getting coordinates for locations...');
        const pickup = await getCoordinates(pickupLocation);
        const dropoff = await getCoordinates(dropoffLocation);
        console.log('✅ Coordinates obtained:', { pickup, dropoff });

        // Check if coordinates were obtained successfully
        if (!pickup || !dropoff) {
          throw new Error('Could not get coordinates for pickup or dropoff location');
        }

        // Create Google Maps instance
        console.log('🗺️ Creating Google Maps instance...');
        const map = new google.maps.Map(mapRef.current, {
          zoom: 13, // Better zoom level for city routes (was 10)
          center: pickup,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        console.log('✅ Google Maps instance created');

        // Add markers
        console.log('📍 Adding markers...');
        addMarker('pickup', pickup, 'Pickup Location', '🏠');
        addMarker('dropoff', dropoff, 'Dropoff Location', '✈️');

        // Draw route
        console.log('🛣️ Drawing route...');
        drawRoute(pickup, dropoff);

        // Call onMapLoad callback
        if (onMapLoad) {
          onMapLoad(map);
        }

        console.log('🎉 Map initialization complete!');
        setLoading(false);
      } catch (err) {
        console.error('❌ Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    // Only initialize if we have a valid ref and haven't already initialized
    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, []); // Empty dependency array - only run once on mount

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

  // Handle mock driver location updates for testing
  useEffect(() => {
    if (isMockMode && mockDriverLocation && mapInstanceRef.current) {
      const location = mockDriverLocation;
      updateDriverMarker(
        { lat: location.lat, lng: location.lng },
        location.heading
      );
      
      // Only auto-zoom when driver is very close to destination (last 0.01 degrees)
      const targetLat = 40.7769; // LaGuardia Airport
      const targetLng = -73.8740;
      const distanceToTarget = Math.sqrt(
        Math.pow(targetLat - location.lat, 2) + 
        Math.pow(targetLng - location.lng, 2)
      );
      
      if (distanceToTarget < 0.01 && status === 'in-progress') {
        // Driver is very close - zoom in slightly to show final approach
        mapInstanceRef.current.setZoom(14);
        mapInstanceRef.current.panTo(location);
      }
    }
  }, [isMockMode, mockDriverLocation, status]);

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
      console.log('🔍 Checking if Google Maps is already loaded...');
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps already loaded');
        resolve();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log('🔑 API Key check:', apiKey ? 'Present' : 'Missing');
      console.log('🔑 API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
      if (!apiKey) {
        reject(new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.'));
        return;
      }

      console.log('📜 Creating Google Maps script tag...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Google Maps script failed to load');
        reject(new Error('Failed to load Google Maps API'));
      };
      
      console.log('📌 Appending script to document head...');
      document.head.appendChild(script);
    });
  };

  // Fallback map display when Google Maps API is not available
  const renderFallbackMap = () => {
    if (!mapRef.current) return;

    const container = mapRef.current;
    container.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        background: linear-gradient(135deg, ${colors.gray[50]}, ${colors.gray[100]});
        border: 2px dashed ${colors.primary[600]};
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: ${colors.primary[700]};
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Mock Map Display</div>
        <div style="font-size: 14px; margin-bottom: 16px; max-width: 300px;">
          Google Maps API key not configured.<br>
          This is a fallback display for testing.
        </div>
        <div style="
          background: ${colors.primary[600]}; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-size: 12px;
          font-weight: 500;
        ">
          🚗 Driver Location: ${mockDriverLocation ? `${mockDriverLocation.lat.toFixed(4)}, ${mockDriverLocation.lng.toFixed(4)}` : 'Not set'}
        </div>
        <div style="
          background: ${colors.success[600]}; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
        ">
          🏠 Pickup: ${pickupLocation}
        </div>
        <div style="
          background: ${colors.danger[600]}; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
        ">
          ✈️ Dropoff: ${dropoffLocation}
        </div>
      </div>
    `;
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
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading map...</Text>
        </Stack>
      </Container>
    );
  }

  if (effectiveError && !isMockMode) {
    // Special handling for missing Google Maps API key
    if (error?.includes('Google Maps API key is not configured')) {
      // In mock mode, show fallback map instead of error
      if (isMockMode) {
        // Render fallback map after a short delay to ensure DOM is ready
        setTimeout(() => renderFallbackMap(), 100);
        return (
          <Container>
            <Stack spacing="lg">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Stack spacing="xs">
                  <Text weight="bold" size="lg">Live Tracking</Text>
                  <Text variant="muted">Mock Driver is on the way</Text>
                </Stack>
                <Box variant="outlined" padding="sm">
                  <Text size="sm" weight="bold">ETA: Simulated ETA</Text>
                </Box>
              </Stack>
              <MapContainer ref={mapRef} />
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
      
      return (
        <Container>
          <Stack spacing="lg" align="center">
            <Text variant="h3" color="secondary">🗺️ Google Maps Not Available</Text>
            <Text color="secondary">
              To test the tracking system, you need to configure a Google Maps API key.
            </Text>
            <Text variant="body" color="secondary" size="sm">
              Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file
            </Text>
            <Text variant="body" color="secondary" size="sm">
              For testing purposes, you can see the simulated driver location data above.
            </Text>
          </Stack>
        </Container>
      );
    }
    
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
              {isMockMode && mockDriverLocation
                ? 'Mock Driver is on the way'
                : status === 'in-progress' && bookingStatus?.driverLocation 
                ? 'Driver is on the way'
                : status === 'confirmed'
                ? 'Driver assigned'
                : 'Waiting for driver assignment'
              }
            </Text>
          </Stack>
          
          {(bookingStatus?.estimatedArrival || (isMockMode && mockDriverLocation)) && (
            <Box variant="outlined" padding="sm">
              <Text size="sm" weight="bold">
                ETA: {isMockMode && mockDriverLocation 
                  ? 'Simulated ETA'
                  : bookingStatus?.estimatedArrival 
                    ? new Date(bookingStatus.estimatedArrival).toLocaleTimeString()
                    : 'Calculating...'
                }
              </Text>
            </Box>
          )}
        </Stack>

        {/* Map Container */}
        <MapContainer ref={mapRef} />
        
        {/* Fallback for mock mode when map fails */}
        {isMockMode && error && (
          <Stack spacing="md" align="center" padding="lg">
            <Text variant="h4" color="secondary">🗺️ Map Loading Failed</Text>
            <Text color="secondary" size="sm">
              The Google Map couldn't load, but you can still test the tracking simulation.
            </Text>
            <Text color="secondary" size="sm">
              Driver location updates are working above ⬆️
            </Text>
          </Stack>
        )}

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