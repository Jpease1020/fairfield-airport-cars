'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack, H2, Text, Input, Box } from '@/design/ui';
import { FlightInfo } from '@/types/booking';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

interface FlightInfoSectionProps {
  flightInfo: FlightInfo;
  onFlightInfoChange: (_info: FlightInfo) => void;
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

  const handleTerminalChange = (terminal: string) => {
    onFlightInfoChange({ ...flightInfo, terminal });
  };

  const handleHasFlightChange = (hasFlight: boolean) => {
    onFlightInfoChange({
      ...flightInfo,
      hasFlight,
      ...(hasFlight
        ? {}
        : {
            flightNumber: '',
            airline: '',
            arrivalTime: '',
            terminal: ''
          })
    });
  };

  return (
    <DarkerGreyBox padding="lg" rounded="md" data-testid="flight-info-section">
      <Stack spacing="lg">
        <H2>
          {cmsData?.['tripDetailsPhase-flightTitle'] || 'Flight Information'}
        </H2>
        
        <Text color="secondary">
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
            <Stack spacing="md">
              <Stack spacing="xs">
                <Text weight="medium">
                  {cmsData?.['tripDetailsPhase-flightNumberLabel'] || 'Flight Number'}
                </Text>
                <Input
                  placeholder={cmsData?.['tripDetailsPhase-flightNumberPlaceholder'] || 'e.g., AA1234'}
                  value={flightInfo.flightNumber}
                  onChange={(e) => handleFlightNumberChange(e.target.value)}
                  fullWidth={true}
                  data-testid="flight-number-input"
                />
              </Stack>

              <Stack spacing="xs">
                <Text weight="medium">
                  {cmsData?.['tripDetailsPhase-airlineLabel'] || 'Airline'}
                </Text>
                <Input
                  placeholder={cmsData?.['tripDetailsPhase-airlinePlaceholder'] || 'e.g., American Airlines'}
                  value={flightInfo.airline}
                  onChange={(e) => handleAirlineChange(e.target.value)}
                  fullWidth={true}
                  data-testid="airline-input"
                />
              </Stack>

              <Stack spacing="xs">
                <Text weight="medium">
                  {cmsData?.['tripDetailsPhase-terminalLabel'] || 'Terminal / Gate'}
                </Text>
                <Input
                  placeholder={cmsData?.['tripDetailsPhase-terminalPlaceholder'] || 'e.g., Terminal 4'}
                  value={flightInfo.terminal}
                  onChange={(e) => handleTerminalChange(e.target.value)}
                  fullWidth={true}
                  data-testid="terminal-input"
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </DarkerGreyBox>
  );
};
