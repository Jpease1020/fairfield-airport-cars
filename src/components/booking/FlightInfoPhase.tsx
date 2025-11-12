'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Stack, Button, Text, H2 } from '@/design/ui';
import { FlightInfoSection } from './trip-details/FlightInfoSection';
import { useBooking } from '@/providers/BookingProvider';

// Styled container that removes padding on mobile
const FlightInfoContainer = styled(Container)`
  @media (max-width: 768px) {
    padding: 0 !important;
  }
`;

interface FlightInfoPhaseProps {
  cmsData: any;
}

export function FlightInfoPhase({
  cmsData
}: FlightInfoPhaseProps) {
  const {
    formData,
    updateTripDetails,
    completeFlightInfo,
    warning
  } = useBooking();
  
  const tripData = formData.trip;

  return (
    <FlightInfoContainer maxWidth="7xl" padding="xl" data-testid="flight-info-phase-container">
      <Stack spacing="2xl" data-testid="flight-info-phase-stack">
        {/* Header */}
        <Stack spacing="md" align="center">
          <H2 cmsId="flight-info-phase-title">
            {cmsData?.['flight-info-phase-title'] || 'Almost There—Complete Your Booking'}
          </H2>
          <Text size="lg" align="center" color="secondary" cmsId="flight-info-phase-description">
            {cmsData?.['flight-info-phase-description'] || 'Your ride has been successfully booked. Help us provide better service by sharing your flight details (optional).'}
          </Text>
          <Text
            size="md"
            align="center"
            color="warning"
            weight="medium"
            cmsId="flight-info-phase-warning"
            data-testid="flight-info-phase-warning"
          >
            {cmsData?.['flight-info-phase-warning'] ||
              'Booking is not fully confirmed until you click the confirmation link in the email we just sent.'}
          </Text>
        </Stack>

        {/* Flight Information Section */}
        <FlightInfoSection
          flightInfo={tripData.flightInfo}
          onFlightInfoChange={(info) => updateTripDetails({ flightInfo: info })}
          cmsData={cmsData}
        />

        {warning && (
          <Text size="md" align="center" color="warning" data-testid="flight-info-phase-warning-message">
            {warning}
          </Text>
        )}

        {/* Navigation */}
        <Stack direction="horizontal" spacing="md" justify="center">
          <Button
            variant="primary"
            size="lg"
            onClick={completeFlightInfo}
            data-testid="flight-info-complete-button"
            cmsId="flight-info-complete-button"
            text={cmsData?.['flight-info-complete-button'] || 'Complete'}
            fullWidth
          />
        </Stack>
      </Stack>
    </FlightInfoContainer>
  );
}
