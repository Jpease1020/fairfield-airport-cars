'use client';

import { useState, useEffect } from 'react';
import { useGoogleMaps } from '../providers/GoogleMapsProvider';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  durationInTraffic: string | null;
  polyline: string;
  trafficLevel: 'low' | 'medium' | 'high' | 'unknown';
}

interface RouteCalculationResult {
  route: RouteInfo | null;
  eta: string | null;
  traffic: string | null;
  loading: boolean;
  error: string | null;
}

export const useRouteCalculation = (
  pickupCoords: Coordinates | null,
  dropoffCoords: Coordinates | null,
  departureTime: string | null
): RouteCalculationResult => {
  const { isLoaded } = useGoogleMaps();
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !pickupCoords || !dropoffCoords) {
      setRoute(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const directionsService = new google.maps.DirectionsService();
      
      // Prepare departure time for traffic calculation
      let departureTimeObj: Date | undefined;
      if (departureTime) {
        departureTimeObj = new Date(departureTime);
        // If departure time is in the past, use current time
        if (departureTimeObj < new Date()) {
          departureTimeObj = new Date();
        }
      }

      const request: google.maps.DirectionsRequest = {
        origin: pickupCoords,
        destination: dropoffCoords,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        drivingOptions: departureTimeObj ? {
          departureTime: departureTimeObj,
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        } : undefined
      };

      directionsService.route(request, (result, status) => {
        setLoading(false);
        
        if (status === google.maps.DirectionsStatus.OK && result && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Determine traffic level based on duration vs duration in traffic
          let trafficLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
          if (leg.duration_in_traffic && leg.duration) {
            const durationDiff = leg.duration_in_traffic.value - leg.duration.value;
            const durationPercent = (durationDiff / leg.duration.value) * 100;
            
            if (durationPercent < 10) trafficLevel = 'low';
            else if (durationPercent < 25) trafficLevel = 'medium';
            else trafficLevel = 'high';
          }

          const routeInfo: RouteInfo = {
            distance: leg.distance?.text || 'Unknown',
            duration: leg.duration?.text || 'Unknown',
            durationInTraffic: leg.duration_in_traffic?.text || null,
            polyline: route.overview_polyline || '',
            trafficLevel
          };

          setRoute(routeInfo);
        } else {
          setError(`Failed to calculate route: ${status}`);
          setRoute(null);
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
      setRoute(null);
    }
  }, [isLoaded, pickupCoords, dropoffCoords, departureTime]);

  return {
    route,
    eta: route?.durationInTraffic || route?.duration || null,
    traffic: route?.trafficLevel || null,
    loading,
    error
  };
};
