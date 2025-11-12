'use client';

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Stack, H2, Text, Input, Box } from '@/design/ui';
import { FlightInfo } from '@/types/booking';
import { colors } from '@/design/system/tokens/tokens';
import { useBooking } from '@/providers/BookingProvider';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

interface FlightInfoSectionProps {
  flightInfo: FlightInfo;
  onFlightInfoChange: (info: FlightInfo) => void;
  cmsData: any;
}

const CHECKIN_BUFFER_MINUTES = 60;

const AIRPORT_SECURITY_PROFILE: Record<string, { peak: number; shoulder: number; overnight: number }> = {
  jfk: { peak: 75, shoulder: 60, overnight: 45 },
  lga: { peak: 60, shoulder: 50, overnight: 35 },
  ewr: { peak: 70, shoulder: 55, overnight: 40 },
  default: { peak: 60, shoulder: 45, overnight: 30 }
};

const getAirportCodeFromAddress = (address: string | undefined): string | null => {
  if (!address) {
    return null;
  }
  const normalized = address.toLowerCase();

  if (normalized.includes('jfk') || normalized.includes('kennedy')) {
    return 'jfk';
  }
  if (normalized.includes('laguardia') || normalized.includes('lga')) {
    return 'lga';
  }
  if (normalized.includes('newark') || normalized.includes('ewr')) {
    return 'ewr';
  }
  if (normalized.includes('airport')) {
    return 'default';
  }
  return null;
};

const getSecurityBufferForDeparture = (airportCode: string, departure: Date): number => {
  const profile = AIRPORT_SECURITY_PROFILE[airportCode] || AIRPORT_SECURITY_PROFILE.default;
  const hour = departure.getHours();
  const isPeak = (hour >= 5 && hour < 9) || (hour >= 16 && hour < 20);
  const isOvernight = hour >= 20 || hour < 5;

  let securityMinutes = profile.shoulder;

  if (isPeak) {
    securityMinutes = profile.peak;
  } else if (isOvernight) {
    securityMinutes = profile.overnight;
  }

  return securityMinutes + CHECKIN_BUFFER_MINUTES;
};

const parseFlightDateTime = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

export const FlightInfoSection: React.FC<FlightInfoSectionProps> = ({
  flightInfo,
  onFlightInfoChange,
  cmsData
}) => {
  const { formData, currentQuote } = useBooking();

  const recommendationColors: Record<'error' | 'warning' | 'success' | 'info', 'error' | 'warning' | 'success' | 'secondary'> = {
    error: 'error',
    warning: 'warning',
    success: 'success',
    info: 'secondary'
  };

  const timingRecommendation = useMemo(() => {
    if (!flightInfo.hasFlight) {
      return null;
    }

    const pickupDateTime = formData.trip.pickupDateTime;
    if (!pickupDateTime) {
      return {
        status: 'info' as const,
        message: 'Select your pickup date and time to see flight timing guidance.'
      };
    }

    const pickupTime = new Date(pickupDateTime);
    if (Number.isNaN(pickupTime.getTime())) {
      return {
        status: 'info' as const,
        message: 'Enter a valid pickup date and time to check timing recommendations.'
      };
    }

    if (!flightInfo.arrivalTime) {
      return {
        status: 'info' as const,
        message: 'Add your flight departure time so we can double-check your schedule.'
      };
    }

    const flightDeparture = parseFlightDateTime(flightInfo.arrivalTime);
    if (!flightDeparture) {
      return {
        status: 'info' as const,
        message: 'Enter a valid flight departure time (local to the airport).'
      };
    }

    const dropoffAddress = formData.trip.dropoff.address;
    const pickupAddress = formData.trip.pickup.address;
    const airportAddress = dropoffAddress?.toLowerCase().includes('airport')
      ? dropoffAddress
      : pickupAddress?.toLowerCase().includes('airport')
        ? pickupAddress
        : null;

    if (!airportAddress) {
      return {
        status: 'info' as const,
        message: 'Set your airport pickup or dropoff so we can tailor the timing guidance.'
      };
    }

    const airportCode = getAirportCodeFromAddress(airportAddress);
    if (!airportCode) {
      return {
        status: 'info' as const,
        message: 'We could not detect the airport from your route. Update the address to include the airport name.'
      };
    }

    if (!currentQuote || typeof currentQuote.durationMinutes !== 'number') {
      return {
        status: 'info' as const,
        message: 'Generate a fare estimate to calculate live drive time for your flight.'
      };
    }

    const minutesUntilDeparture = (flightDeparture.getTime() - pickupTime.getTime()) / 60000;
    if (minutesUntilDeparture <= 0) {
      return {
        status: 'error' as const,
        message: 'Your flight departure time is before your scheduled pickup. Move your pickup earlier.'
      };
    }

    const airportBuffer = getSecurityBufferForDeparture(airportCode, flightDeparture);
    const requiredMinutes = currentQuote.durationMinutes + airportBuffer;
    const difference = minutesUntilDeparture - requiredMinutes;

    if (difference < 0) {
      return {
        status: 'error' as const,
        message: `We recommend leaving at least ${Math.ceil(requiredMinutes)} minutes before departure (${Math.ceil(currentQuote.durationMinutes)} minutes to drive + ${airportBuffer} minutes for check-in and security). You currently have about ${Math.max(0, Math.floor(minutesUntilDeparture))} minutes. Move your pickup earlier by roughly ${Math.ceil(Math.abs(difference))} minutes.`
      };
    }

    if (difference < 30) {
      return {
        status: 'warning' as const,
        message: `You have about ${Math.floor(minutesUntilDeparture)} minutes before takeoff. We recommend at least ${Math.ceil(requiredMinutes)} minutes (${Math.ceil(currentQuote.durationMinutes)} minutes drive + ${airportBuffer} minutes at the airport). Consider moving your pickup ${Math.ceil(30 - difference)} minutes earlier for extra buffer.`
      };
    }

    return {
      status: 'success' as const,
      message: `You're giving yourself roughly ${Math.floor(minutesUntilDeparture)} minutes before takeoff. That exceeds our recommended ${Math.ceil(requiredMinutes)} minutes (${Math.ceil(currentQuote.durationMinutes)} minutes drive + ${airportBuffer} minutes at the airport).`
    };
  }, [
    flightInfo.hasFlight,
    flightInfo.arrivalTime,
    formData.trip.pickupDateTime,
    formData.trip.pickup.address,
    formData.trip.dropoff.address,
    currentQuote
  ]);
  const handleFlightNumberChange = (flightNumber: string) => {
    onFlightInfoChange({ ...flightInfo, flightNumber });
  };

  const handleAirlineChange = (airline: string) => {
    onFlightInfoChange({ ...flightInfo, airline });
  };

  const handleArrivalTimeChange = (arrivalTime: string) => {
    onFlightInfoChange({ ...flightInfo, arrivalTime });
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
        <H2 cmsId="trip-details-flight-title">
          {cmsData?.['tripDetailsPhase-flightTitle'] || 'Flight Information'}
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
            <Stack spacing="md">
              <Stack spacing="xs">
                <Text weight="medium" cmsId="tripDetailsPhase-flightNumberLabel">
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
                <Text weight="medium" cmsId="tripDetailsPhase-airlineLabel">
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
                <Text weight="medium" cmsId="tripDetailsPhase-arrivalTimeLabel">
                  {cmsData?.['tripDetailsPhase-arrivalTimeLabel'] || 'Arrival Time'}
                </Text>
                <Input
                  type="datetime-local"
                  placeholder={cmsData?.['tripDetailsPhase-arrivalTimePlaceholder'] || 'e.g., 10:30 AM'}
                  value={flightInfo.arrivalTime}
                  onChange={(e) => handleArrivalTimeChange(e.target.value)}
                  fullWidth={true}
                  data-testid="arrival-time-input"
                />
              </Stack>

              <Stack spacing="xs">
                <Text weight="medium" cmsId="tripDetailsPhase-terminalLabel">
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

              {timingRecommendation && (
                <Stack spacing="xs">
                  <Text
                    size="sm"
                    color={recommendationColors[timingRecommendation.status]}
                    data-testid="flight-timing-recommendation"
                  >
                    {timingRecommendation.message}
                  </Text>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </DarkerGreyBox>
  );
};
