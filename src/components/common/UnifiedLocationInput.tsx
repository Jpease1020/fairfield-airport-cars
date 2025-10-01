'use client';

import React from 'react';
import { Stack, Text, Button } from '@/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { useBooking } from '@/providers/BookingProvider';

interface Coordinates {
  lat: number;
  lng: number;
}

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
    formData,
    updateTripDetails,
    validation
  } = useBooking();

  const isPickup = type === 'pickup';
  const location = isPickup ? formData.trip.pickup : formData.trip.dropoff;
  
  const setLocation = (address: string) => {
    if (isPickup) {
      updateTripDetails({ pickup: { ...formData.trip.pickup, address } });
    } else {
      updateTripDetails({ dropoff: { ...formData.trip.dropoff, address } });
    }
  };
  
  const setCoordinates = (coordinates: Coordinates | null) => {
    if (isPickup) {
      updateTripDetails({ pickup: { ...formData.trip.pickup, coordinates } });
    } else {
      updateTripDetails({ dropoff: { ...formData.trip.dropoff, coordinates } });
    }
  };

  const handleLocationChange = (address: string) => {
    setLocation(address);
  };

  const handleLocationSelect = (address: string, coordinates: Coordinates) => {
    setLocation(address);
    setCoordinates(coordinates);
  };

  const handleCoordinatesChange = (coordinates: Coordinates | null) => {
    setCoordinates(coordinates);
  };

  const getError = () => {
    if (isPickup) {
      return validation.errors.find(error => error.includes('pickup'));
    } else {
      return validation.errors.find(error => error.includes('dropoff'));
    }
  };

  const error = getError();

  const swapLocations = () => {
    const pickup = formData.trip.pickup;
    const dropoff = formData.trip.dropoff;
    updateTripDetails({
      pickup: dropoff,
      dropoff: pickup
    });
  };

  const clearLocations = () => {
    updateTripDetails({
      pickup: { address: '', coordinates: null },
      dropoff: { address: '', coordinates: null }
    });
  };

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
