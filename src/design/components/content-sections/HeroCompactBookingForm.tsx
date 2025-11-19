'use client';

import React from 'react';
import styled from 'styled-components';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Box } from '../../layout/content/Box';
import { Button } from '../../components/base-components/Button';
import { Text } from '../../components/base-components/text/Text';
import { DateTimePicker } from '../../components/base-components/forms/DateTimePicker';
import { LocationInput } from '../base-components/forms/LocationInput';
import { FieldValidationStatus } from '../base-components/forms/FieldValidationStatus';
import { FareCalculationOverlay } from '../base-components/forms/FareCalculationOverlay';
import { useBooking } from '../../../providers/BookingProvider';
import { useFareCalculation } from '@/hooks/useFareCalculation';
import { colors } from '../../system/tokens/tokens';

interface Coordinates {
  lat: number;
  lng: number;
}

const StrikethroughText = styled(Text)`
  text-decoration: line-through;
  opacity: 0.7;
`;

const FieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FormContainer = styled(Container)`
  position: relative;
`;

const RequiredAsterisk = styled.span`
  color: ${colors.danger[600]};
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
    validateQuickBookingForm,
    isQuickBookingFormValid,
    submitQuickBookingForm,
    error,
  } = useBooking();
  
  // Get validation for quick booking form
  const validation = validateQuickBookingForm();
  
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
    pickupDateTime: pickupDateTime, // Required for fare calculation
  });

  // Note: Removed currentQuote since we simplified to currentFare only


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
    <FormContainer 
      variant="elevated" 
      padding="lg" 
      maxWidth="full"
      data-testid={dataTestId}
      {...rest}
    >
      <FareCalculationOverlay isCalculating={isCalculating} />
      <Stack spacing="md">
        <Text variant="lead" weight="semibold" align="center" data-testid="quick-book-title">
          Get Estimate
        </Text>
        
        <Stack spacing="md">
          <FieldWrapper>
            <Text weight="semibold" size="sm" style={{ marginBottom: '0.5rem' }}>
              From <RequiredAsterisk>*</RequiredAsterisk>
            </Text>
            <LocationInput
              id="pickup-location"
              placeholder="From: Fairfield Station"
              value={locationData.pickup.address}
              onChange={(address) => setPickupLocation(address)}
              onLocationSelect={handlePickupLocationSelect}
              size="md"
              fullWidth
              error={!!validation?.fieldErrors?.['pickup-location-input']}
              data-testid="quick-book-pickup-input"
            />
            <FieldValidationStatus
              isValid={
                !!locationData.pickup.address.trim() &&
                locationData.pickup.coordinates !== null &&
                !validation?.fieldErrors?.['pickup-location-input']
              }
              show={!!locationData.pickup.address.trim() || !!validation?.fieldErrors?.['pickup-location-input']}
            />
          </FieldWrapper>
          
          <FieldWrapper>
            <Text weight="semibold" size="sm" style={{ marginBottom: '0.5rem' }}>
              To <RequiredAsterisk>*</RequiredAsterisk>
            </Text>
            <LocationInput
              id="dropoff-location"
              placeholder="To: JFK Airport"
              value={locationData.dropoff.address}
              onChange={(address) => setDropoffLocation(address)}
              onLocationSelect={handleDropoffLocationSelect}
              size="md"
              fullWidth
              error={!!validation?.fieldErrors?.['dropoff-location-input']}
              data-testid="quick-book-dropoff-input"
            />
            <FieldValidationStatus
              isValid={
                !!locationData.dropoff.address.trim() &&
                locationData.dropoff.coordinates !== null &&
                !validation?.fieldErrors?.['dropoff-location-input']
              }
              show={!!locationData.dropoff.address.trim() || !!validation?.fieldErrors?.['dropoff-location-input']}
            />
          </FieldWrapper>
          
          <FieldWrapper>
            <Text weight="semibold" size="sm" style={{ marginBottom: '0.5rem' }} cmsId="quickBook-dateOfTravelLabel">
              Date of travel <RequiredAsterisk>*</RequiredAsterisk>
            </Text>
            <DateTimePicker
              id="pickup-datetime"
              placeholder="mm/dd/yyyy, --:-- --"
              value={pickupDateTime || ''}
              onChange={(datetime) => {
                if (datetime) {
                  updateTripDetails({ pickupDateTime: datetime });
                }
              }}
              minDate={new Date()}
              size="md"
              fullWidth
              required
              error={!!validation?.fieldErrors?.['pickup-datetime-input']}
              cmsId="quick-book-datetime-input"
            />
            <FieldValidationStatus
              isValid={!!pickupDateTime && !validation?.fieldErrors?.['pickup-datetime-input']}
              show={!!pickupDateTime || !!validation?.fieldErrors?.['pickup-datetime-input']}
            />
          </FieldWrapper>
        </Stack>
        
        {/* Show estimated price in real-time from shared hook */}
        {estimatedFare && (
          <>
          <Stack spacing="sm" align="center" data-testid="quick-book-price-display">
            <Text size="lg" weight="bold" color="primary">
              Estimated Fare: ${estimatedFare}
            </Text>
            {/* Quote countdown removed - using simplified fare system */}
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
          <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
          <Button
            variant="primary"
            size="md"
            onClick={handleGetPrice}
            disabled={!isQuickBookingFormValid()}
            cmsId="get-price-button"
            data-testid="quick-book-secure-rate-button"
            text="Book Now to Secure Rate →"
          />
        </Stack>
          </>
        )}

        {fareError && (
          <Text size="sm" color="error" align="center">{fareError}</Text>
        )}
        
        {error && (
          <Text size="sm" color="error" align="center">
            {error}
          </Text>
        )}
        
        <Text size="xs" align="center" variant="muted" data-testid="quick-book-disclaimer">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </FormContainer>
  );
};
