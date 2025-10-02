'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack, H2, Text, Box } from '@/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { Coordinates } from '@/types/booking';
import { useBooking } from '@/providers/BookingProvider';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

interface LocationInputSectionProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  onPickupLocationChange: (location: string) => void;
  onDropoffLocationChange: (location: string) => void;
  onPickupCoordsChange: (coords: Coordinates | null) => void;
  onDropoffCoordsChange: (coords: Coordinates | null) => void;
  onRouteCalculated?: (routeInfo: { distance: string; duration: string; durationInTraffic: string | null; trafficLevel: string }) => void;
  departureTime?: string; // For future trip estimation
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
  onRouteCalculated,
  departureTime,
  cmsData
}) => {
  // Use booking provider directly like the quick booking form
  const { formData, updateTripDetails } = useBooking();
  
  // Create helper functions like the quick booking form
  const setPickupLocation = (address: string, coordinates?: Coordinates) => {
    console.log('LocationInputSection setPickupLocation:', address, coordinates);
    updateTripDetails({ pickup: { ...formData.trip.pickup, address, coordinates: coordinates || null } });
  };
  
  const setDropoffLocation = (address: string, coordinates?: Coordinates) => {
    console.log('LocationInputSection setDropoffLocation:', address, coordinates);
    updateTripDetails({ dropoff: { ...formData.trip.dropoff, address, coordinates: coordinates || null } });
  };
  
  // Handler functions like the quick booking form
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    console.log('LocationInputSection handlePickupLocationSelect:', address, coordinates);
    setPickupLocation(address, coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    console.log('LocationInputSection handleDropoffLocationSelect:', address, coordinates);
    setDropoffLocation(address, coordinates);
  };
  // Calculate route when both coordinates are available
  const { route, loading: routeLoading, error: routeError } = useRouteCalculation(
    formData.trip.pickup.coordinates,
    formData.trip.dropoff.coordinates,
    departureTime || null
  );

  // Notify parent when route is calculated
  React.useEffect(() => {
    if (route && onRouteCalculated) {
      onRouteCalculated({
        distance: route.distance,
        duration: route.duration,
        durationInTraffic: route.durationInTraffic,
        trafficLevel: route.trafficLevel
      });
    }
  }, [route, onRouteCalculated]);
  return (
    <DarkerGreyBox padding="lg" rounded="md" data-testid="location-input-section">
      <Stack spacing="lg">
        <H2 cmsId="trip-details-location-title">
          {cmsData?.['tripDetailsPhase-locationTitle'] || 'Where are you going?'}
        </H2>
        
        <Text color="secondary" cmsId="trip-details-location-description">
          {cmsData?.['tripDetailsPhase-locationDescription'] || 'Enter your pickup and dropoff locations to get started.'}
        </Text>
        
        {/* Route Information Display */}
        {route && (
          <Stack spacing="sm" padding="md">
            <Text weight="medium" cmsId="route-info-title">
              {cmsData?.['tripDetailsPhase-routeInfo'] || 'Trip Information'}
            </Text>
            <Text cmsId="route-distance">
              {cmsData?.['tripDetailsPhase-distance'] || 'Distance'}: {route.distance}
            </Text>
            <Text cmsId="route-duration">
              {cmsData?.['tripDetailsPhase-duration'] || 'Duration'}: {route.durationInTraffic || route.duration}
              {route.durationInTraffic && route.durationInTraffic !== route.duration && (
                <Text color="secondary" size="sm" cmsId="tripDetailsPhase-trafficAdjusted">
                  {' '}({cmsData?.['tripDetailsPhase-trafficAdjusted'] || 'traffic adjusted'})
                </Text>
              )}
            </Text>
            {route.trafficLevel !== 'unknown' && (
              <Text cmsId="route-traffic" color={route.trafficLevel === 'high' ? 'error' : route.trafficLevel === 'medium' ? 'warning' : 'success'}>
                {cmsData?.['tripDetailsPhase-trafficLevel'] || 'Traffic'}: {route.trafficLevel}
              </Text>
            )}
          </Stack>
        )}
        
        {routeLoading && (
          <Text color="secondary" cmsId="route-calculating">
            {cmsData?.['tripDetailsPhase-calculatingRoute'] || 'Calculating route...'}
          </Text>
        )}
        
        {routeError && (
          <Text color="error" cmsId="route-error">
            {cmsData?.['tripDetailsPhase-routeError'] || 'Unable to calculate route. Please check your locations.'}
          </Text>
        )}
        
        <Stack spacing="md">
          <LocationInput
            id="pickup-location-input"
            label={cmsData?.['tripDetailsPhase-pickupLabel'] || 'Pickup Location'}
            placeholder={cmsData?.['tripDetailsPhase-pickupPlaceholder'] || 'Enter pickup address'}
            value={formData.trip.pickup.address}
            onChange={(address) => setPickupLocation(address)}
            onLocationSelect={handlePickupLocationSelect}
            coords={formData.trip.pickup.coordinates}
            fullWidth={true}
            data-testid="pickup-location-input"
          />
          
          <LocationInput
            id="dropoff-location-input"
            label={cmsData?.['tripDetailsPhase-dropoffLabel'] || 'Dropoff Location'}
            placeholder={cmsData?.['tripDetailsPhase-dropoffPlaceholder'] || 'Enter dropoff address'}
            value={formData.trip.dropoff.address}
            onChange={(address) => setDropoffLocation(address)}
            onLocationSelect={handleDropoffLocationSelect}
            coords={formData.trip.dropoff.coordinates}
            fullWidth={true}
            data-testid="dropoff-location-input"
          />
        </Stack>
      </Stack>
    </DarkerGreyBox>
  );
};
