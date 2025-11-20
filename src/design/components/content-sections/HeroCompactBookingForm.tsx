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
import { FareCalculationOverlay } from '../base-components/forms/FareCalculationOverlay';
import { useBooking } from '../../../providers/BookingProvider';
import { useFareCalculation } from '@/hooks/useFareCalculation';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { colors } from '../../system/tokens/tokens';
import { useEffect } from 'react';

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

const ValidationIndicator = styled.span<{ $isValid: boolean }>`
  color: ${({ $isValid }) => ($isValid ? colors.success[600] : colors.danger[600])};
  margin-left: 2px;
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

  // Check driver availability when date/time changes
  const { error: availabilityError, checkAvailability, isLoading: isCheckingAvailability } = useBookingAvailability();

  useEffect(() => {
    if (pickupDateTime && pickupDate && pickupTime) {
      // Calculate end time (2 hours after pickup, standard ride duration)
      const pickupDateObj = new Date(pickupDateTime);
      const endTimeObj = new Date(pickupDateObj.getTime() + 2 * 60 * 60 * 1000);
      const endTime = endTimeObj.toTimeString().slice(0, 5); // HH:MM format
      
      checkAvailability(pickupDate, pickupTime, endTime);
    }
  }, [pickupDateTime, pickupDate, pickupTime, checkAvailability]);

  // Note: Removed currentQuote since we simplified to currentFare only


  // Handle location selection using global context
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address, coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address, coordinates);
  };

  const handleGetPrice = () => {
    // Explicitly validate all required fields before proceeding
    const hasPickupAddress = locationData.pickup.address.trim() !== '';
    const hasPickupCoords = locationData.pickup.coordinates !== null;
    const hasDropoffAddress = locationData.dropoff.address.trim() !== '';
    const hasDropoffCoords = locationData.dropoff.coordinates !== null;
    const hasDateTime = pickupDateTime && pickupDateTime.includes('T') && pickupDateTime.split('T').length === 2;
    const [datePart, timePart] = pickupDateTime ? pickupDateTime.split('T') : ['', ''];
    const hasDate = datePart && datePart.trim() !== '';
    const hasTime = timePart && timePart.trim() !== '';
    
    // If any field is missing or invalid, trigger validation display and prevent navigation
    if (!hasPickupAddress || !hasPickupCoords || !hasDropoffAddress || !hasDropoffCoords || !hasDateTime || !hasDate || !hasTime) {
      // Call submitQuickBookingForm which will validate and show errors, but won't navigate if invalid
      submitQuickBookingForm();
      return; // Explicitly return to prevent any further execution
    }
    
    // All fields are valid, proceed with submission
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
              From{' '}
              <ValidationIndicator
                $isValid={
                  !!locationData.pickup.address.trim() &&
                  locationData.pickup.coordinates !== null &&
                  !validation?.fieldErrors?.['pickup-location-input']
                }
              >
                {!!locationData.pickup.address.trim() &&
                 locationData.pickup.coordinates !== null &&
                 !validation?.fieldErrors?.['pickup-location-input']
                  ? '✓'
                  : '*'}
              </ValidationIndicator>
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
          </FieldWrapper>
          
          <FieldWrapper>
            <Text weight="semibold" size="sm" style={{ marginBottom: '0.5rem' }}>
              To{' '}
              <ValidationIndicator
                $isValid={
                  !!locationData.dropoff.address.trim() &&
                  locationData.dropoff.coordinates !== null &&
                  !validation?.fieldErrors?.['dropoff-location-input']
                }
              >
                {!!locationData.dropoff.address.trim() &&
                 locationData.dropoff.coordinates !== null &&
                 !validation?.fieldErrors?.['dropoff-location-input']
                  ? '✓'
                  : '*'}
              </ValidationIndicator>
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
          </FieldWrapper>
          
          <FieldWrapper>
            <DateTimePicker
              id="pickup-datetime"
              label="Date of travel"
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
              isValid={!!pickupDateTime && !validation?.fieldErrors?.['pickup-datetime-input']}
              cmsId="quick-book-datetime-input"
            />
          </FieldWrapper>
        </Stack>
        
        {/* Show estimated price in real-time from shared hook */}
        {estimatedFare && (
          <Stack spacing="sm" align="center" data-testid="quick-book-price-display">
            <Text size="lg" weight="bold" color="primary" data-testid="quick-book-fare-amount">
              Estimated Fare: ${estimatedFare}
            </Text>
            {/* Quote countdown removed - using simplified fare system */}
            {isCalculating && (
              <Text size="sm" color="secondary" data-testid="quick-book-calculating">Calculating...</Text>
            )}
            
            {/* Promotional Message */}
            <Box variant="filled" padding="md" data-testid="quick-book-promo-section">
              <Stack spacing="sm" align="center">
                <Text size="lg" weight="bold" color="primary" cmsId="promo-limited-time" data-testid="quick-book-promo-title">
                  🎉 Limited Time Offer!
                </Text>
                <StrikethroughText size="md" color="secondary" cmsId="promo-deposit-strikethrough" data-testid="quick-book-deposit-strikethrough">
                  Deposit: ${(estimatedFare * 0.3).toFixed(2)}
                </StrikethroughText>
                <Text size="lg" weight="bold" color="success" cmsId="promo-no-deposit" data-testid="quick-book-no-deposit">
                  No Deposit Required - Book Now!
                </Text>
              </Stack>
            </Box>
          </Stack>
        )}
        
        {/* Always show the button - validation happens in handler */}
        <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
          <Button
            variant="primary"
            size="md"
            onClick={handleGetPrice}
            cmsId="get-price-button"
            data-testid="quick-book-secure-rate-button"
            text="Book Now to Secure Rate →"
          />
        </Stack>

        {fareError && (
          <Text size="sm" color="error" align="center" data-testid="quick-book-fare-error">{fareError}</Text>
        )}
        
        {availabilityError && (
          <Text size="sm" color="error" align="center" style={{ fontStyle: 'italic' }} data-testid="quick-book-availability-error">
            {availabilityError.includes('No drivers are available') 
              ? 'No available drivers, try modifying the pickup time'
              : availabilityError}
          </Text>
        )}
        
        {error && (
          <Text size="sm" color="error" align="center" data-testid="quick-book-error">
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
