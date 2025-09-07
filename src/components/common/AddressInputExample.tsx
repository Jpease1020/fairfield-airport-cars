'use client';

import React, { useState } from 'react';
import { Stack, Text } from '@/ui';
import { UnifiedAddressInput } from './UnifiedAddressInput';

// Example component showing how to use the unified address input
export const AddressInputExample: React.FC = () => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handlePickupSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setPickupAddress(address);
    setPickupCoords(coordinates);
  };

  const handleDropoffSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setDropoffAddress(address);
    setDropoffCoords(coordinates);
  };

  return (
    <Stack spacing="lg">
      <Text variant="h3" cmsId="address-examples-title">Address Input Examples</Text>
      
      <Stack spacing="md">
        <Text variant="h4" cmsId="address-examples-google-maps">Google Maps Autocomplete (Default)</Text>
        <UnifiedAddressInput
          value={pickupAddress}
          onChange={setPickupAddress}
          onLocationSelect={handlePickupSelect}
          placeholder="From: Fairfield Station"
          variant="autocomplete"
          data-testid="pickup-address-autocomplete"
        />
      </Stack>

      <Stack spacing="md">
        <Text variant="h4" cmsId="address-examples-places-api">Places API</Text>
        <UnifiedAddressInput
          value={dropoffAddress}
          onChange={setDropoffAddress}
          onLocationSelect={handleDropoffSelect}
          placeholder="To: JFK Airport"
          variant="places-api"
          data-testid="dropoff-address-places"
        />
      </Stack>

      {pickupCoords && (
        <Stack spacing="sm">
          <Text variant="h4" cmsId="address-examples-pickup-coords">Pickup Coordinates:</Text>
          <Text size="sm" cmsId="address-examples-pickup-coords-value">Lat: {pickupCoords.lat}, Lng: {pickupCoords.lng}</Text>
        </Stack>
      )}

      {dropoffCoords && (
        <Stack spacing="sm">
          <Text variant="h4" cmsId="address-examples-dropoff-coords">Dropoff Coordinates:</Text>
          <Text size="sm" cmsId="address-examples-dropoff-coords-value">Lat: {dropoffCoords.lat}, Lng: {dropoffCoords.lng}</Text>
        </Stack>
      )}
    </Stack>
  );
};
