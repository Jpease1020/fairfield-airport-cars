'use client';

import { useState, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteInfo {
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
  const directions = useMapsLibrary('routes');
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!directions || !pickupCoords || !dropoffCoords) {
      setRoute(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const calculateRoute = async () => {
      try {
        const directionsService = new directions.DirectionsService();
        
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

        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Failed to calculate route: ${status}`));
            }
          });
        });

        if (result.routes.length > 0) {
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
          setError('No routes found');
          setRoute(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate route');
        setRoute(null);
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
  }, [directions, pickupCoords, dropoffCoords, departureTime]);

  return {
    route,
    eta: route?.durationInTraffic || route?.duration || null,
    traffic: route?.trafficLevel || null,
    loading,
    error
  };
};
