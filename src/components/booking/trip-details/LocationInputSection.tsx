'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack, H2, Text, Box } from '@/design/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { Coordinates } from '@/types/booking';
import { useBooking } from '@/providers/BookingProvider';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

// Styled components for icon and label
const IconEmoji = styled.span`
  font-size: 1.5rem;
`;

const LabelRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const HintText = styled(Text)`
  margin-top: 0.25rem;
`;

const ValidationIndicator = styled.span<{ $isValid: boolean }>`
  color: ${({ $isValid }) => ($isValid ? colors.success[600] : colors.danger[600])};
  margin-left: 2px;
  font-size: 1em;
`;

// Swap button container - positions button between inputs
const SwapButtonContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  width: 100%;
  padding: 0 2rem;
`;

// Swap button with circular background
const SwapButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${colors.background.primary};
  border: 2px solid ${colors.primary[600]};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${colors.primary[600]};
    transform: rotate(180deg);
    
    svg {
      color: ${colors.text.white};
    }
  }

  &:active {
    transform: rotate(180deg) scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${colors.primary[600]};
    transition: color 0.2s ease;
  }
`;

interface LocationInputSectionProps {
  onRouteCalculated?: (_routeInfo: { distance: string; duration: string; durationInTraffic: string | null; trafficLevel: string }) => void;
  cmsData?: Record<string, string>;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  onRouteCalculated,
  cmsData
}) => {
  const { formData, updateTripDetails, validation } = useBooking();
  const [isSwapped, setIsSwapped] = React.useState(false);
  const pickupIsAirport = isSwapped;
  const dropoffIsAirport = !isSwapped;

  const setPickupLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ pickup: { ...formData.trip.pickup, address, coordinates: coordinates || null } });
  };
  const setDropoffLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ dropoff: { ...formData.trip.dropoff, address, coordinates: coordinates || null } });
  };
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address, coordinates);
  };
  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address, coordinates);
  };
  const handleSwapLocations = () => {
    const tempPickup = { ...formData.trip.pickup };
    const tempDropoff = { ...formData.trip.dropoff };
    updateTripDetails({ pickup: tempDropoff, dropoff: tempPickup });
    setIsSwapped(!isSwapped);
  };
  const { route, routeLoading, routeError } = useBooking();

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
        <H2>
          {cmsData?.['tripDetailsPhase-locationTitle'] || 'Where are you going?'}
        </H2>
        <Text color="secondary">
          {cmsData?.['tripDetailsPhase-locationDescription'] || 'Enter your pickup and dropoff locations to get started.'}
        </Text>
        
      {/* Route Information Display */}
        {/* {route && (
          <Stack spacing="sm" padding="md">
            <Text weight="medium">
              {cmsData?.['tripDetailsPhase-routeInfo'] || 'Trip Information'}
            </Text>
            <Text>
              {cmsData?.['tripDetailsPhase-distance'] || 'Distance'}: {route.distance}
            </Text>
            <Text>
              {cmsData?.['tripDetailsPhase-duration'] || 'Duration'}: {route.durationInTraffic || route.duration}
              {route.durationInTraffic && route.durationInTraffic !== route.duration && (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }} data-cms-id="tripDetailsPhase-trafficAdjusted">
                  {' '}({cmsData?.['tripDetailsPhase-trafficAdjusted'] || 'traffic adjusted'})
                </span>
              )}
            </Text>
            {route.trafficLevel !== 'unknown' && (
              <Text color={route.trafficLevel === 'high' ? 'error' : route.trafficLevel === 'medium' ? 'warning' : 'success'}>
                {cmsData?.['tripDetailsPhase-trafficLevel'] || 'Traffic'}: {route.trafficLevel}
              </Text>
            )}
          </Stack>
        )} */}
        
        {routeLoading && (
          <Text color="secondary">
            {cmsData?.['tripDetailsPhase-calculatingRoute'] || 'Calculating route...'}
          </Text>
        )}
        
        {routeError && (
          <Text color="error">
            {cmsData?.['tripDetailsPhase-routeError'] || 'Unable to calculate route. Please check your locations.'}
          </Text>
        )}
        
        <Stack spacing="none" id="location-input-section-inner">
          <Box>
            <LabelRow>
              <IconEmoji>
                {pickupIsAirport ? '✈️' : '📍'}
              </IconEmoji>
              <Text weight="bold" size="md">
                {pickupIsAirport 
                  ? (cmsData?.['tripDetailsPhase-airportPickupLabel'] || 'Airport Pickup')
                  : (cmsData?.['tripDetailsPhase-yourLocationLabel'] || 'Your Location')
                }
                <ValidationIndicator 
                  $isValid={
                    !!formData.trip.pickup.address.trim() &&
                    formData.trip.pickup.coordinates !== null &&
                    !validation?.fieldErrors?.['pickup-location-input']
                  }
                >
                  {!!formData.trip.pickup.address.trim() &&
                   formData.trip.pickup.coordinates !== null &&
                   !validation?.fieldErrors?.['pickup-location-input']
                    ? ' ✓' 
                    : ' *'}
                </ValidationIndicator>
              </Text>
            </LabelRow>
            <LocationInput
              id="pickup-location-input"
              placeholder={
                pickupIsAirport 
                  ? (cmsData?.['tripDetailsPhase-airportPlaceholder'] || 'JFK, LGA, Newark, etc.')
                  : (cmsData?.['tripDetailsPhase-homePlaceholder'] || 'Enter your address')
              }
              value={formData.trip.pickup.address}
              onChange={(address) => setPickupLocation(address)}
              onLocationSelect={handlePickupLocationSelect}
              coords={formData.trip.pickup.coordinates}
              restrictToAirports={pickupIsAirport}
              fullWidth={true}
              error={!!validation?.fieldErrors?.['pickup-location-input']}
              data-testid="pickup-location-input"
            />
            <HintText size="xs" color="secondary">
              {pickupIsAirport 
                ? (cmsData?.['tripDetailsPhase-airportHint'] || 'Search for any airport')
                : (cmsData?.['tripDetailsPhase-homeHint'] || 'Your home, hotel, or any address')
              }
            </HintText>
          </Box>
          
          {/* Swap Button */}
          <SwapButtonContainer>
            <SwapButton
              onClick={handleSwapLocations}
              type="button"
              aria-label="Swap pickup and dropoff locations"
              data-testid="swap-locations-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </SwapButton>
          </SwapButtonContainer>
          
          <Box>
            <LabelRow>
              <IconEmoji>
                {dropoffIsAirport ? '✈️' : '📍'}
              </IconEmoji>
              <Text weight="bold" size="md">
                {dropoffIsAirport 
                  ? (cmsData?.['tripDetailsPhase-airportDestinationLabel'] || 'Airport Destination')
                  : (cmsData?.['tripDetailsPhase-yourDestinationLabel'] || 'Your Destination')
                }
                <ValidationIndicator 
                  $isValid={
                    !!formData.trip.dropoff.address.trim() &&
                    formData.trip.dropoff.coordinates !== null &&
                    !validation?.fieldErrors?.['dropoff-location-input']
                  }
                >
                  {!!formData.trip.dropoff.address.trim() &&
                   formData.trip.dropoff.coordinates !== null &&
                   !validation?.fieldErrors?.['dropoff-location-input']
                    ? ' ✓' 
                    : ' *'}
                </ValidationIndicator>
              </Text>
            </LabelRow>
            <LocationInput
              id="dropoff-location-input"
              placeholder={
                dropoffIsAirport 
                  ? (cmsData?.['tripDetailsPhase-airportPlaceholder'] || 'JFK, LGA, Newark, etc.')
                  : (cmsData?.['tripDetailsPhase-homePlaceholder'] || 'Enter destination address')
              }
              value={formData.trip.dropoff.address}
              onChange={(address) => setDropoffLocation(address)}
              onLocationSelect={handleDropoffLocationSelect}
              coords={formData.trip.dropoff.coordinates}
              restrictToAirports={dropoffIsAirport}
              fullWidth={true}
              error={!!validation?.fieldErrors?.['dropoff-location-input']}
              data-testid="dropoff-location-input"
            />
            <HintText size="xs" color="secondary">
              {dropoffIsAirport 
                ? (cmsData?.['tripDetailsPhase-airportHint'] || 'Search for any airport')
                : (cmsData?.['tripDetailsPhase-homeHint'] || 'Your home, hotel, or any address')
              }
            </HintText>
          </Box>
        </Stack>
      </Stack>
    </DarkerGreyBox>
  );
};
