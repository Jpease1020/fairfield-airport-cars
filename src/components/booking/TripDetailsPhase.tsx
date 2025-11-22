'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Container, Stack, StatusMessage, Button } from '@/design/ui';
import { colors, spacing, borderRadius } from '@/design/system/tokens/tokens';
import { FareCalculationOverlay } from '@/design/components/base-components/forms/FareCalculationOverlay';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { useFareCalculation } from '@/hooks/useFareCalculation';
import { LocationInputSection } from './trip-details/LocationInputSection';
import { DateTimeSection } from './trip-details/DateTimeSection';
import { EstimatedRideTime } from './trip-details/EstimatedRideTime';
import { FareDisplaySection } from './trip-details/FareDisplaySection';
// Types imported from booking provider context
import { useBooking } from '@/providers/BookingProvider';

// Styled container that removes padding on mobile
const TripDetailsContainer = styled(Container)`
  position: relative;
  @media (max-width: 768px) {
    padding: 0 !important;
  }
`;

const ErrorMessageBox = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.danger[50]};
  border: 1px solid ${colors.danger[200]};
  border-radius: ${borderRadius.lg};
  color: ${colors.danger[800]};
  margin-top: ${spacing.md};
  width: 100%;
  font-weight: 500;
`;

interface TripDetailsPhaseProps {
  cmsData: any;
}

export function TripDetailsPhase({
  cmsData
}: TripDetailsPhaseProps) {
  // Get all data from provider - single source of truth
  const {
    formData,
    validation,
    hasAttemptedValidation,
    goToNextPhase,
    updateTripDetails,
    currentQuote
  } = useBooking();
  
  // Extract trip data from formData
  const tripData = formData.trip;
  // Check if trip details are complete for button state
  const isTripDetailsComplete = () => {
    return (
      tripData.pickup.address.trim() !== '' &&
      tripData.dropoff.address.trim() !== '' &&
      tripData.pickupDateTime !== '' &&
      tripData.pickup.coordinates !== null &&
      tripData.dropoff.coordinates !== null
    );
  };
  // Availability checking
  const { error: availabilityError, checkAvailability } = useBookingAvailability();
  const availabilityStatusType =
    availabilityError &&
    availabilityError.includes('We can’t reach our scheduling calendar right now')
      ? 'warning'
      : 'error';

  // Use custom hooks for business logic (with traffic-aware pricing)
  const { fare: calculatedFare, isCalculating: isCalculatingFare, error: fareError } = useFareCalculation({
    pickupLocation: tripData.pickup.address,
    dropoffLocation: tripData.dropoff.address,
    pickupCoords: tripData.pickup.coordinates,
    dropoffCoords: tripData.dropoff.coordinates,
    fareType: tripData.fareType,
    pickupDateTime: tripData.pickupDateTime // For traffic-aware pricing
  });

  // Check availability when pickup date/time changes
  useEffect(() => {
    if (tripData.pickupDateTime && tripData.pickup.address && tripData.dropoff.address) {
      const pickupDate = new Date(tripData.pickupDateTime);
      const dateStr = pickupDate.toISOString().split('T')[0];
      const startTime = pickupDate.toTimeString().slice(0, 5);
      const endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
      
      checkAvailability(dateStr, startTime, endTime);
    }
  }, [tripData.pickupDateTime, tripData.pickup.address, tripData.dropoff.address, checkAvailability]);

  // No need to update provider - useFareCalculation already calls setFare directly
  // This eliminates the circular dependency between formData.trip.fare and currentFare

  return (
    <TripDetailsContainer maxWidth="7xl" padding="xl" data-testid="trip-details-phase-container">
      <FareCalculationOverlay isCalculating={isCalculatingFare} />
      <Stack spacing="2xl" data-testid="trip-details-phase-stack">
        {/* Location Input Section */}
        <LocationInputSection
          pickupLocation={tripData.pickup.address}
          dropoffLocation={tripData.dropoff.address}
          pickupCoords={tripData.pickup.coordinates}
          dropoffCoords={tripData.dropoff.coordinates}
          onPickupLocationChange={(address) => updateTripDetails({ pickup: { ...tripData.pickup, address } })}
          onDropoffLocationChange={(address) => updateTripDetails({ dropoff: { ...tripData.dropoff, address } })}
          onPickupCoordsChange={(coords) => updateTripDetails({ pickup: { ...tripData.pickup, coordinates: coords } })}
          onDropoffCoordsChange={(coords) => updateTripDetails({ dropoff: { ...tripData.dropoff, coordinates: coords } })}
          departureTime={tripData.pickupDateTime}
          cmsData={cmsData}
        />

        {/* Date/Time and Fare Type Section */}
        <DateTimeSection
          pickupDateTime={tripData.pickupDateTime}
          fareType={tripData.fareType}
          onDateTimeChange={(dateTime) => updateTripDetails({ pickupDateTime: dateTime })}
          onFareTypeChange={(type) => updateTripDetails({ fareType: type })}
          cmsData={cmsData}
          error={!!validation?.fieldErrors?.['pickup-datetime-input']}
          validation={validation}
        />

        {/* Estimated Ride Time */}
        <EstimatedRideTime cmsData={cmsData} />


        {/* Fare Display Section */}
        <FareDisplaySection
          fare={calculatedFare}
          isCalculating={isCalculatingFare}
          fareType={tripData.fareType}
          cmsData={cmsData}
          error={fareError}
        />

        {/* Error States */}
        {/* Show availability warning from quote if present */}
        {currentQuote?.availabilityWarning && (
          <StatusMessage
            type="warning"
            message={currentQuote.availabilityWarning}
            id="quote-availability-warning"
            data-testid="quote-availability-warning"
          />
        )}
        
        {availabilityError && (
          <StatusMessage
            type={availabilityStatusType}
            message={
              availabilityError.includes('No drivers are available') 
                ? 'No available drivers, try modifying the pickup time'
                : availabilityError
            }
            id="availability-error-message"
            data-testid="availability-error-message"
          />
        )}

        {validation.warnings.length > 0 && hasAttemptedValidation && (
          <StatusMessage
            type="warning"
            message={validation.warnings.join(', ')}
            id="validation-warning-message"
            data-testid="validation-warning-message"
          />
        )}

        {/* Navigation */}
        <Button
          variant="primary"
          size="lg"
          onClick={goToNextPhase}
          data-testid="trip-details-next-button"
          cmsId="trip-details-next-button"
          text={cmsData?.['tripDetailsPhase-nextButton'] || 'Continue to Contact Info'}
          fullWidth
        />
        
        {/* Error message display below button - scroll target for mobile */}
        {validation.errors.length > 0 && hasAttemptedValidation && (
          <ErrorMessageBox
            id="trip-details-error-message"
            data-testid="trip-details-error-message"
          >
            <strong>❌ Error:</strong> {validation.errors.join(', ')}
          </ErrorMessageBox>
        )}
      </Stack>
    </TripDetailsContainer>
  );
}