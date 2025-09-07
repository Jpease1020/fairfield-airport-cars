'use client';

import React from 'react';
import { Stack, H2, Text } from '@/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { Coordinates } from '@/types/booking';

interface LocationInputSectionProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  onPickupLocationChange: (location: string) => void;
  onDropoffLocationChange: (location: string) => void;
  onPickupCoordsChange: (coords: Coordinates | null) => void;
  onDropoffCoordsChange: (coords: Coordinates | null) => void;
  cmsData: any;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  onPickupLocationChange,
  onDropoffLocationChange,
  onPickupCoordsChange,
  onDropoffCoordsChange,
  cmsData
}) => {
  return (
    <Stack spacing="lg" data-testid="location-input-section">
      <H2 cmsId="trip-details-location-title">
        {cmsData?.['tripDetailsPhase-locationTitle'] || 'Where are you going?'}
      </H2>
      
      <Text color="secondary" cmsId="trip-details-location-description">
        {cmsData?.['tripDetailsPhase-locationDescription'] || 'Enter your pickup and dropoff locations to get started.'}
      </Text>
      
      <Stack spacing="md">
        <LocationInput
          label={cmsData?.['tripDetailsPhase-pickupLabel'] || 'Pickup Location'}
          placeholder={cmsData?.['tripDetailsPhase-pickupPlaceholder'] || 'Enter pickup address'}
          value={pickupLocation}
          onChange={onPickupLocationChange}
          onLocationSelect={(address, coordinates) => {
            onPickupLocationChange(address);
            onPickupCoordsChange(coordinates);
          }}
          onCoordsChange={onPickupCoordsChange}
          coords={pickupCoords}
          data-testid="pickup-location-input"
        />
        
        <LocationInput
          label={cmsData?.['tripDetailsPhase-dropoffLabel'] || 'Dropoff Location'}
          placeholder={cmsData?.['tripDetailsPhase-dropoffPlaceholder'] || 'Enter dropoff address'}
          value={dropoffLocation}
          onChange={onDropoffLocationChange}
          onLocationSelect={(address, coordinates) => {
            onDropoffLocationChange(address);
            onDropoffCoordsChange(coordinates);
          }}
          onCoordsChange={onDropoffCoordsChange}
          coords={dropoffCoords}
          data-testid="dropoff-location-input"
        />
      </Stack>
    </Stack>
  );
};
