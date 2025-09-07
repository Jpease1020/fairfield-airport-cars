'use client';

import React, { useEffect } from 'react';
import { Container, Stack, StatusMessage } from '@/ui';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { useFareCalculation } from '@/hooks/useFareCalculation';
import { LocationInputSection } from './trip-details/LocationInputSection';
import { DateTimeSection } from './trip-details/DateTimeSection';
import { FlightInfoSection } from './trip-details/FlightInfoSection';
import { FareDisplaySection } from './trip-details/FareDisplaySection';
import { TripDetailsNavigation } from './trip-details/TripDetailsNavigation';
import { TripDetails, ValidationResult } from '@/types/booking';

interface TripDetailsPhaseProps {
  tripData: TripDetails;
  onTripUpdate: (data: Partial<TripDetails>) => void;
  onNext: () => void;
  validation: ValidationResult;
  cmsData: any;
}

export function TripDetailsPhase({
  tripData,
  onTripUpdate,
  onNext,
  validation,
  cmsData
}: TripDetailsPhaseProps) {
  // Availability checking
  const { error: availabilityError, checkAvailability } = useBookingAvailability();

  // Use custom hooks for business logic
  const { fare: calculatedFare, isCalculating: isCalculatingFare, error: fareError } = useFareCalculation({
    pickupLocation: tripData.pickup.address,
    dropoffLocation: tripData.dropoff.address,
    pickupCoords: tripData.pickup.coordinates,
    dropoffCoords: tripData.dropoff.coordinates,
    fareType: tripData.fareType
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

  // Update parent state when calculated fare changes
  useEffect(() => {
    if (calculatedFare !== tripData.fare) {
      onTripUpdate({ fare: calculatedFare });
    }
  }, [calculatedFare, tripData.fare, onTripUpdate]);

  return (
    <Container maxWidth="7xl" padding="xl" data-testid="trip-details-phase-container">
      <Stack spacing="xl" data-testid="trip-details-phase-stack">
        {/* Location Input Section */}
        <LocationInputSection
          pickupLocation={tripData.pickup.address}
          dropoffLocation={tripData.dropoff.address}
          pickupCoords={tripData.pickup.coordinates}
          dropoffCoords={tripData.dropoff.coordinates}
          onPickupLocationChange={(address) => onTripUpdate({ pickup: { ...tripData.pickup, address } })}
          onDropoffLocationChange={(address) => onTripUpdate({ dropoff: { ...tripData.dropoff, address } })}
          onPickupCoordsChange={(coords) => onTripUpdate({ pickup: { ...tripData.pickup, coordinates: coords } })}
          onDropoffCoordsChange={(coords) => onTripUpdate({ dropoff: { ...tripData.dropoff, coordinates: coords } })}
          cmsData={cmsData}
        />

        {/* Date/Time and Fare Type Section */}
        <DateTimeSection
          pickupDateTime={tripData.pickupDateTime}
          fareType={tripData.fareType}
          onDateTimeChange={(dateTime) => onTripUpdate({ pickupDateTime: dateTime })}
          onFareTypeChange={(type) => onTripUpdate({ fareType: type })}
          cmsData={cmsData}
        />

        {/* Flight Information Section */}
        <FlightInfoSection
          flightInfo={tripData.flightInfo}
          onFlightInfoChange={(info) => onTripUpdate({ flightInfo: info })}
          cmsData={cmsData}
        />

        {/* Fare Display Section */}
        <FareDisplaySection
          fare={calculatedFare}
          isCalculating={isCalculatingFare}
          fareType={tripData.fareType}
          cmsData={cmsData}
        />

        {/* Error States */}
        {availabilityError && (
          <StatusMessage
            type="error"
            message={availabilityError}
            id="availability-error-message"
            data-testid="availability-error-message"
          />
        )}

        {validation.errors.length > 0 && (
          <StatusMessage
            type="error"
            message={validation.errors.join(', ')}
            id="validation-error-message"
            data-testid="validation-error-message"
          />
        )}

        {validation.warnings.length > 0 && (
          <StatusMessage
            type="warning"
            message={validation.warnings.join(', ')}
            id="validation-warning-message"
            data-testid="validation-warning-message"
          />
        )}

        {/* Navigation */}
        <TripDetailsNavigation
          canProceed={validation.isValid}
          onNext={onNext}
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}