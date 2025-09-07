'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  pickup: {
    address: string;
    coordinates: Coordinates | null;
  };
  dropoff: {
    address: string;
    coordinates: Coordinates | null;
  };
}

export interface LocationContextType {
  // Location data
  locationData: LocationData;
  
  // Location setters
  setPickupLocation: (address: string, _coordinates?: Coordinates | null) => void;
  setDropoffLocation: (address: string, _coordinates?: Coordinates | null) => void;
  setPickupCoordinates: (_coordinates: Coordinates | null) => void;
  setDropoffCoordinates: (_coordinates: Coordinates | null) => void;
  
  // Location validation
  isLocationValid: boolean;
  locationErrors: string[];
  
  // Location actions
  clearLocations: () => void;
  swapLocations: () => void;
  
  // Loading states
  isCalculatingFare: boolean;
  setIsCalculatingFare: (_calculating: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const searchParams = useSearchParams();
  
  // Initialize location data
  const [locationData, setLocationData] = useState<LocationData>({
    pickup: {
      address: '',
      coordinates: null
    },
    dropoff: {
      address: '',
      coordinates: null
    }
  });
  
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  
  // Initialize from URL parameters
  useEffect(() => {
    const pickup = searchParams.get('pickup');
    const dropoff = searchParams.get('dropoff');
    
    if (pickup) {
      setLocationData(prev => ({
        ...prev,
        pickup: { ...prev.pickup, address: pickup }
      }));
    }
    
    if (dropoff) {
      setLocationData(prev => ({
        ...prev,
        dropoff: { ...prev.dropoff, address: dropoff }
      }));
    }
  }, [searchParams]);
  
  // Location validation
  const isLocationValid = locationData.pickup.address.trim() !== '' && 
                         locationData.dropoff.address.trim() !== '' &&
                         locationData.pickup.coordinates !== null &&
                         locationData.dropoff.coordinates !== null;
  
  const locationErrors: string[] = [];
  if (locationData.pickup.address.trim() === '') {
    locationErrors.push('Pickup location is required');
  }
  if (locationData.dropoff.address.trim() === '') {
    locationErrors.push('Dropoff location is required');
  }
  if (locationData.pickup.address.trim() !== '' && locationData.pickup.coordinates === null) {
    locationErrors.push('Please select pickup location from suggestions');
  }
  if (locationData.dropoff.address.trim() !== '' && locationData.dropoff.coordinates === null) {
    locationErrors.push('Please select dropoff location from suggestions');
  }
  
  // Location setters
  const setPickupLocation = (address: string, coordinates?: Coordinates | null) => {
    setLocationData(prev => ({
      ...prev,
      pickup: {
        address,
        coordinates: coordinates ?? prev.pickup.coordinates
      }
    }));
  };
  
  const setDropoffLocation = (address: string, coordinates?: Coordinates | null) => {
    setLocationData(prev => ({
      ...prev,
      dropoff: {
        address,
        coordinates: coordinates ?? prev.dropoff.coordinates
      }
    }));
  };
  
  const setPickupCoordinates = (coordinates: Coordinates | null) => {
    setLocationData(prev => ({
      ...prev,
      pickup: { ...prev.pickup, coordinates }
    }));
  };
  
  const setDropoffCoordinates = (coordinates: Coordinates | null) => {
    setLocationData(prev => ({
      ...prev,
      dropoff: { ...prev.dropoff, coordinates }
    }));
  };
  
  // Location actions
  const clearLocations = () => {
    setLocationData({
      pickup: { address: '', coordinates: null },
      dropoff: { address: '', coordinates: null }
    });
  };
  
  const swapLocations = () => {
    setLocationData(prev => ({
      pickup: prev.dropoff,
      dropoff: prev.pickup
    }));
  };
  
  const value: LocationContextType = {
    locationData,
    setPickupLocation,
    setDropoffLocation,
    setPickupCoordinates,
    setDropoffCoordinates,
    isLocationValid,
    locationErrors,
    clearLocations,
    swapLocations,
    isCalculatingFare,
    setIsCalculatingFare
  };
  
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
