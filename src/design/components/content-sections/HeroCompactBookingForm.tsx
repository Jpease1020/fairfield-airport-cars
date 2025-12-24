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
import { StatusMessage } from '../base-components/notifications/StatusMessage';
import { isAirportLocation } from '@/lib/services/service-area-validation';

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

const FieldLabel = styled(Text)`
  margin-bottom: 0.5rem;
`;

const ErrorText = styled(Text)`
  font-style: italic;
`;

const SwapButtonContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  margin: -0.5rem 0;
`;

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
  color: ${colors.primary[600]};

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
  }
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
    submitQuickBookingForm,
    error,
    hasAttemptedValidation,
    setHasAttemptedValidation,
  } = useBooking();
  
  // Get validation for quick booking form
  const validation = validateQuickBookingForm();
  
  const locationData = {
    pickup: formData.trip.pickup,
    dropoff: formData.trip.dropoff
  };
  
  // Both fields are flexible - either can be airport or address
  // Server-side validation ensures at least one endpoint is an airport
  
  // Track which field is detected as airport to suggest the opposite for the other field
  const [detectedAirportField, setDetectedAirportField] = React.useState<'pickup' | 'dropoff' | null>(null);
  
  const setPickupLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ pickup: { ...formData.trip.pickup, address, coordinates: coordinates || null } });
  };
  
  const setDropoffLocation = (address: string, coordinates?: Coordinates) => {
    updateTripDetails({ dropoff: { ...formData.trip.dropoff, address, coordinates: coordinates || null } });
  };
  
  // const isLocationValid = validation.isValid; // Unused for now
  // const locationErrors = validation.errors; // Unused for now
  
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
  const { error: availabilityError, checkAvailability } = useBookingAvailability();

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

  // Swap pickup and dropoff locations (optional convenience feature)
  const handleSwapLocations = () => {
    const tempPickup = { ...formData.trip.pickup };
    const tempDropoff = { ...formData.trip.dropoff };
    
    // Swap the locations
    updateTripDetails({
      pickup: tempDropoff,
      dropoff: tempPickup
    });
    
    // Swap the detected airport field
    if (detectedAirportField === 'pickup') {
      setDetectedAirportField('dropoff');
    } else if (detectedAirportField === 'dropoff') {
      setDetectedAirportField('pickup');
    }
  };

  // Handle location selection using global context
  // Auto-detect if selected location is an airport and suggest the opposite for the other field
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address, coordinates);
    
    // Detect if this is an airport
    if (isAirportLocation(address, coordinates)) {
      setDetectedAirportField('pickup');
    } else {
      // If not an airport, clear detection (user might have changed their mind)
      if (detectedAirportField === 'pickup') {
        setDetectedAirportField(null);
      }
    }
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address, coordinates);
    
    // Detect if this is an airport
    if (isAirportLocation(address, coordinates)) {
      setDetectedAirportField('dropoff');
    } else {
      // If not an airport, clear detection (user might have changed their mind)
      if (detectedAirportField === 'dropoff') {
        setDetectedAirportField(null);
      }
    }
  };

  const handleGetPrice = () => {
    // Set hasAttemptedValidation to true so validation errors will be shown
    setHasAttemptedValidation(true);
    
    // Validate the form
    const validation = validateQuickBookingForm();
    
    if (!validation.isValid) {
      // Show errors - they will be displayed via StatusMessage
      // submitQuickBookingForm will handle error display and prevent navigation
      submitQuickBookingForm();
      return;
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
            <FieldLabel weight="semibold" size="sm">
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
            </FieldLabel>
            <LocationInput
              id="pickup-location"
              placeholder={
                detectedAirportField === 'dropoff' 
                  ? "From: Your address" 
                  : "From: Fairfield Station or JFK Airport"
              }
              value={locationData.pickup.address}
              onChange={(address) => setPickupLocation(address)}
              onLocationSelect={handlePickupLocationSelect}
              size="md"
              fullWidth
              error={!!validation?.fieldErrors?.['pickup-location-input']}
              data-testid="quick-book-pickup-input"
            />
          </FieldWrapper>
          
          {/* Swap Button - Optional convenience feature */}
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
          
          <FieldWrapper>
            <FieldLabel weight="semibold" size="sm">
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
            </FieldLabel>
            <LocationInput
              id="dropoff-location"
              placeholder={
                detectedAirportField === 'pickup' 
                  ? "To: Your address" 
                  : "To: JFK Airport or Fairfield Station"
              }
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
              label="When"
              placeholder="mm/dd/yyyy, --:-- --"
              value={pickupDateTime || ''}
              onChange={(datetime) => {
                if (datetime) {
                  updateTripDetails({ pickupDateTime: datetime });
                }
              }}
              minDate={undefined} // DateTimePicker will default to 24 hours from now
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
          <ErrorText size="sm" color="error" align="center" data-testid="quick-book-availability-error">
            {availabilityError.includes('No drivers are available') 
              ? 'No available drivers, try modifying the pickup time'
              : availabilityError}
          </ErrorText>
        )}
        
        {/* Validation error messages */}
        {validation.errors.length > 0 && hasAttemptedValidation && (
          <StatusMessage
            type="error"
            message={validation.errors.join(', ')}
            id="quick-book-validation-error"
            data-testid="quick-book-validation-error"
          />
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
