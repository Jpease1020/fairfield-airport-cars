'use client';

import React from 'react';
import { Stack, H2, Text, Input } from '@/ui';
import { FlightInfo } from '@/types/booking';

interface FlightInfoSectionProps {
  flightInfo: FlightInfo;
  onFlightInfoChange: (info: FlightInfo) => void;
  cmsData: any;
}

export const FlightInfoSection: React.FC<FlightInfoSectionProps> = ({
  flightInfo,
  onFlightInfoChange,
  cmsData
}) => {
  const handleFlightNumberChange = (flightNumber: string) => {
    onFlightInfoChange({ ...flightInfo, flightNumber });
  };

  const handleAirlineChange = (airline: string) => {
    onFlightInfoChange({ ...flightInfo, airline });
  };

  const handleHasFlightChange = (hasFlight: boolean) => {
    onFlightInfoChange({ ...flightInfo, hasFlight });
  };

  return (
    <Stack spacing="lg" data-testid="flight-info-section">
      <H2 cmsId="trip-details-flight-title">
        {cmsData?.['tripDetailsPhase-flightTitle'] || 'Flight Information (Optional)'}
      </H2>
      
      <Text color="secondary" cmsId="trip-details-flight-description">
        {cmsData?.['tripDetailsPhase-flightDescription'] || 'Help us provide better service by sharing your flight details.'}
      </Text>
      
      <Stack spacing="md">
        <Stack direction="horizontal" spacing="sm" align="center">
          <input
            type="checkbox"
            id="has-flight"
            checked={flightInfo.hasFlight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHasFlightChange(e.target.checked)}
            data-testid="has-flight-checkbox"
          />
          <label htmlFor="has-flight">
            <Text>
              {cmsData?.['tripDetailsPhase-hasFlightLabel'] || 'I have a flight'}
            </Text>
          </label>
        </Stack>
        
        {flightInfo.hasFlight && (
          <Stack spacing="sm">
            <Input
              label={cmsData?.['tripDetailsPhase-flightNumberLabel'] || 'Flight Number'}
              placeholder={cmsData?.['tripDetailsPhase-flightNumberPlaceholder'] || 'e.g., AA1234'}
              value={flightInfo.flightNumber}
              onChange={(e) => handleFlightNumberChange(e.target.value)}
              data-testid="flight-number-input"
            />
            
            <Input
              label={cmsData?.['tripDetailsPhase-airlineLabel'] || 'Airline'}
              placeholder={cmsData?.['tripDetailsPhase-airlinePlaceholder'] || 'e.g., American Airlines'}
              value={flightInfo.airline}
              onChange={(e) => handleAirlineChange(e.target.value)}
              data-testid="airline-input"
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
