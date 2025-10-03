'use client';

import React from 'react';
import styled from 'styled-components';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Box } from '../../layout/content/Box';
import { Button } from '../../components/base-components/Button';
import { Text } from '../../components/base-components/text/Text';
import { Input } from '../../components/base-components/forms/Input';
import { LocationInput } from '../base-components/forms/LocationInput';
import { useBooking } from '../../../providers/BookingProvider';
import { useFareCalculation } from '@/hooks/useFareCalculation';

interface Coordinates {
  lat: number;
  lng: number;
}

const StrikethroughText = styled(Text)`
  text-decoration: line-through;
  opacity: 0.7;
`;

interface HeroCompactBookingFormProps {
  'data-testid'?: string;
}

export const HeroCompactBookingForm: React.FC<HeroCompactBookingFormProps> = ({
  'data-testid': dataTestId,
  ...rest
}) => {
  // Use booking provider for location management
  const { 
    formData,
    updateTripDetails,
    validation,
    validateQuickBookingForm,
    isQuickBookingFormValid,
    submitQuickBookingForm,
    error,
    setQuote,
    submitBookingWithQuote,
  } = useBooking();
  
  const locationData = {
    pickup: formData.trip.pickup,
    dropoff: formData.trip.dropoff
  };
  
  const setPickupLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ pickup: { ...formData.trip.pickup, address, coordinates: coordinates || null } });
  };
  
  const setDropoffLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ dropoff: { ...formData.trip.dropoff, address, coordinates: coordinates || null } });
  };
  
  const isLocationValid = validation.isValid;
  const locationErrors = validation.errors;
  
  // Get datetime from provider instead of local state
  const pickupDateTime = formData.trip.pickupDateTime;
  const pickupDate = pickupDateTime ? pickupDateTime.split('T')[0] : '';
  const pickupTime = pickupDateTime ? pickupDateTime.split('T')[1] : '';
  
  const { fare: estimatedFare, isCalculating, error: fareError } = useFareCalculation({
    pickupLocation: locationData.pickup.address,
    dropoffLocation: locationData.dropoff.address,
    pickupCoords: locationData.pickup.coordinates,
    dropoffCoords: locationData.dropoff.coordinates,
    fareType: formData.trip.fareType,
  });


  // Handle location selection using global context
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address, coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address, coordinates);
  };

  const handleGetPrice = () => {
    // Use the new validation and submission logic
    submitQuickBookingForm();
  };

  return (
    <Container 
      variant="elevated" 
      padding="lg" 
      maxWidth="full"
      data-testid={dataTestId}
      {...rest}
    >
      <Stack spacing="md">
        <Text variant="lead" weight="semibold" align="center" data-testid="quick-book-title">
          Get Estimate
        </Text>
        
        <Stack spacing="md">
          <LocationInput
            id="pickup-location"
            placeholder="From: Fairfield Station"
            value={locationData.pickup.address}
            onChange={(address) => setPickupLocation(address)}
            onLocationSelect={handlePickupLocationSelect}
            size="md"
            fullWidth
            data-testid="quick-book-pickup-input"
          />
          
          <LocationInput
            id="dropoff-location"
            placeholder="To: JFK Airport"
            value={locationData.dropoff.address}
            onChange={(address) => setDropoffLocation(address)}
            onLocationSelect={handleDropoffLocationSelect}
            size="md"
            fullWidth
            data-testid="quick-book-dropoff-input"
          />
          
          <Stack spacing="md">
            <Text weight="semibold" cmsId="quickBook-dateOfTravelLabel">
              Date of travel
            </Text>
            <Input
              type="datetime-local" 
              id="pickup-datetime"
              value={pickupDateTime || ''}
              onChange={(e) => {
                const datetime = e.target.value;
                if (datetime) {
                  updateTripDetails({ pickupDateTime: datetime });
                }
              }}
              size="md"
              fullWidth
              data-testid="quick-book-datetime-input"
            />
          </Stack>
        </Stack>
        
        {/* Show estimated price in real-time from shared hook */}
        {estimatedFare && (
          <Stack spacing="sm" align="center" data-testid="quick-book-price-display">
            <Text size="lg" weight="bold" color="primary">
              Estimated Fare: ${estimatedFare}
            </Text>
            {isCalculating && (
              <Text size="sm" color="secondary">Calculating...</Text>
            )}
            
            {/* Promotional Message */}
            <Box variant="filled" padding="md">
              <Stack spacing="sm" align="center">
                <Text size="lg" weight="bold" color="primary" cmsId="promo-limited-time">
                  🎉 Limited Time Offer!
                </Text>
                <StrikethroughText size="md" color="secondary" cmsId="promo-deposit-strikethrough">
                  Deposit: ${(estimatedFare * 0.3).toFixed(2)}
                </StrikethroughText>
                <Text size="lg" weight="bold" color="success" cmsId="promo-no-deposit">
                  No Deposit Required - Book Now!
                </Text>
              </Stack>
            </Box>
          </Stack>
        )}
        {fareError && (
          <Text size="sm" color="error" align="center">{fareError}</Text>
        )}
        
        {/* Route summary removed - using simple fare estimation */}
        
        <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
          <Button
            variant="primary"
            size="md"
            onClick={handleGetPrice}
            disabled={!isQuickBookingFormValid()}
            cmsId="get-price-button"
            data-testid="quick-book-get-price-button"
            text="Book Now to Secure Rate →"
          />
        </Stack>
        
        {error && (
          <Text size="sm" color="error" align="center">
            {error}
          </Text>
        )}
        <Text size="xs" align="center" variant="muted" data-testid="quick-book-disclaimer">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </Container>
  );
};
