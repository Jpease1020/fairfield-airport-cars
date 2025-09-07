'use client';

import React from 'react';
import { Stack, Text, Button } from '@/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { useLocation } from '@/contexts/LocationContext';
import { Coordinates } from '@/contexts/LocationContext';

interface UnifiedLocationInputProps {
  type: 'pickup' | 'dropoff';
  label?: string;
  placeholder?: string;
  showSwapButton?: boolean;
  showClearButton?: boolean;
  cmsData?: any;
  'data-testid'?: string;
}

export const UnifiedLocationInput: React.FC<UnifiedLocationInputProps> = ({
  type,
  label,
  placeholder,
  showSwapButton = false,
  showClearButton = false,
  cmsData,
  'data-testid': dataTestId
}) => {
  const {
    locationData,
    setPickupLocation,
    setDropoffLocation,
    setPickupCoordinates,
    setDropoffCoordinates,
    clearLocations,
    swapLocations,
    locationErrors
  } = useLocation();

  const isPickup = type === 'pickup';
  const location = isPickup ? locationData.pickup : locationData.dropoff;
  const setLocation = isPickup ? setPickupLocation : setDropoffLocation;
  const setCoordinates = isPickup ? setPickupCoordinates : setDropoffCoordinates;

  const handleLocationChange = (address: string) => {
    setLocation(address);
  };

  const handleLocationSelect = (address: string, coordinates: Coordinates) => {
    setLocation(address, coordinates);
  };

  const handleCoordinatesChange = (coordinates: Coordinates | null) => {
    setCoordinates(coordinates);
  };

  const getError = () => {
    if (isPickup) {
      return locationErrors.find(error => error.includes('pickup'));
    } else {
      return locationErrors.find(error => error.includes('dropoff'));
    }
  };

  const error = getError();

  return (
    <Stack spacing="sm" data-testid={dataTestId}>
      <LocationInput
        label={label || (isPickup ? 'Pickup Location' : 'Dropoff Location')}
        placeholder={placeholder || (isPickup ? 'Enter pickup address' : 'Enter dropoff address')}
        value={location.address}
        onChange={handleLocationChange}
        onLocationSelect={handleLocationSelect}
        onCoordsChange={handleCoordinatesChange}
        coords={location.coordinates}
        error={!!error}
        data-testid={`${type}-location-input`}
      />
      
      {error && (
        <Text color="error" size="sm">
          {error}
        </Text>
      )}
      
      {(showSwapButton || showClearButton) && (
        <Stack direction="horizontal" spacing="sm">
          {showSwapButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={swapLocations}
              data-testid="swap-locations-button"
              cmsId="location-swap-button"
            >
              Swap
            </Button>
          )}
          {showClearButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearLocations}
              data-testid="clear-locations-button"
              cmsId="location-clear-button"
            >
              Clear
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
};
