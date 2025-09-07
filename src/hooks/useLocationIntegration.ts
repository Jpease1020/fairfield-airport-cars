'use client';

import { useEffect } from 'react';
import { useLocation } from '@/contexts/LocationContext';

interface UseLocationIntegrationProps {
  // Existing booking form state
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: any;
  dropoffCoords: any;
  setPickupLocation: (location: string) => void;
  setDropoffLocation: (location: string) => void;
  setPickupCoords: (coords: any) => void;
  setDropoffCoords: (coords: any) => void;
}

/**
 * Hook to integrate centralized location management with existing booking form
 * This provides a bridge between the new LocationContext and existing components
 */
export const useLocationIntegration = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  setPickupLocation,
  setDropoffLocation,
  setPickupCoords,
  setDropoffCoords
}: UseLocationIntegrationProps) => {
  const {
    locationData,
    setPickupLocation: setContextPickup,
    setDropoffLocation: setContextDropoff,
    setPickupCoordinates: setContextPickupCoords,
    setDropoffCoordinates: setContextDropoffCoords,
    isLocationValid,
    locationErrors
  } = useLocation();

  // Sync context to booking form state
  useEffect(() => {
    if (locationData.pickup.address !== pickupLocation) {
      setPickupLocation(locationData.pickup.address);
    }
    if (locationData.dropoff.address !== dropoffLocation) {
      setDropoffLocation(locationData.dropoff.address);
    }
    if (locationData.pickup.coordinates !== pickupCoords) {
      setPickupCoords(locationData.pickup.coordinates);
    }
    if (locationData.dropoff.coordinates !== dropoffCoords) {
      setDropoffCoords(locationData.dropoff.coordinates);
    }
  }, [locationData, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords]);

  // Sync booking form state to context
  useEffect(() => {
    if (pickupLocation !== locationData.pickup.address) {
      setContextPickup(pickupLocation, pickupCoords);
    }
  }, [pickupLocation, pickupCoords]);

  useEffect(() => {
    if (dropoffLocation !== locationData.dropoff.address) {
      setContextDropoff(dropoffLocation, dropoffCoords);
    }
  }, [dropoffLocation, dropoffCoords]);

  return {
    isLocationValid,
    locationErrors,
    // Provide context setters for components that need them
    setPickupLocation: setContextPickup,
    setDropoffLocation: setContextDropoff,
    setPickupCoordinates: setContextPickupCoords,
    setDropoffCoordinates: setContextDropoffCoords
  };
};
