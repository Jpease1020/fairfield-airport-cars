'use client';

import React from 'react';
import { Container, Stack, Box, Button, Text, H2, Input, Select } from '@/ui';
import { useCMSData } from '@/design/hooks/useCMSData';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { FlightInfo } from '@/hooks/useBookingForm';

interface TripDetailsPhaseProps {
  // State
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  flightInfo: FlightInfo;
  fare: number | null;
  isCalculating: boolean;
  
  // Setters
  setPickupLocation: (location: string) => void;
  setDropoffLocation: (location: string) => void;
  setPickupDateTime: (dateTime: string) => void;
  setFareType: (type: 'personal' | 'business') => void;
  setFlightInfo: (info: FlightInfo) => void;
  setFare: (fare: number | null) => void;
  setIsCalculating: (calculating: boolean) => void;
  
  // Actions
  goToNextPhase: () => void;
  fillTestData: () => void;
  
  // Validation
  canProceed: boolean;
}

export function TripDetailsPhase({
  pickupLocation,
  dropoffLocation,
  pickupDateTime,
  fareType,
  flightInfo,
  fare,
  isCalculating,
  setPickupLocation,
  setDropoffLocation,
  setPickupDateTime,
  setFareType,
  setFlightInfo,
  setFare,
  setIsCalculating,
  goToNextPhase,
  fillTestData,
  canProceed
}: TripDetailsPhaseProps) {
  const { cmsData } = useCMSData();
  const { isLoaded: mapsLoaded, isError: mapsError } = useGoogleMapsScript(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  );

  // Calculate fare when pickup/dropoff locations or fare type change
  React.useEffect(() => {
    const calculateFare = async () => {
      if (!pickupLocation || !dropoffLocation || !mapsLoaded) {
        setFare(null);
        setIsCalculating(false);
        return;
      }

      setIsCalculating(true);

      try {
        const response = await fetch('/api/booking/estimate-fare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: pickupLocation,
            destination: dropoffLocation,
            fareType,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFare(data.fare);
        } else {
          setFare(null);
        }
      } catch (error) {
        console.error('Fare calculation error:', error);
        setFare(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateFare();
  }, [pickupLocation, dropoffLocation, fareType, mapsLoaded, setFare, setIsCalculating]);

  if (mapsError) {
    return (
      <Container maxWidth="4xl" padding="xl">
        <Text color="error">
          Failed to load Google Maps. Please refresh the page and try again.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <H2 align="center" data-cms-id="booking-trip-title">
          {cmsData?.['pages.booking.trip.title'] || 'Trip Details'}
        </H2>

        <Text align="center" color="secondary">
          {cmsData?.['pages.booking.trip.description'] || 
           'Tell us about your trip so we can provide an accurate fare estimate'}
        </Text>

        {/* Test Data Button (Dev Only) */}
        <Box variant="outlined" padding="md">
          <Button
            onClick={fillTestData}
            variant="outline"
            size="sm"
            fullWidth
          >
            🚀 Fill Test Data (Dev Only)
          </Button>
        </Box>

        {/* Trip Details Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Pickup Location */}
            <Stack spacing="sm">
              <Text weight="bold">Pickup Location *</Text>
              <Input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup address or landmark"
                data-testid="pickup-location-input"
              />
            </Stack>

            {/* Dropoff Location */}
            <Stack spacing="sm">
              <Text weight="bold">Dropoff Location *</Text>
              <Input
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Enter destination address or landmark"
                data-testid="dropoff-location-input"
              />
            </Stack>

            {/* Pickup Date & Time */}
            <Stack spacing="sm">
              <Text weight="bold">Pickup Date & Time *</Text>
              <Input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                data-testid="pickup-datetime-input"
              />
            </Stack>

            {/* Fare Type */}
            <Stack spacing="sm">
              <Text weight="bold">Fare Type</Text>
              <Select
                value={fareType}
                onChange={(e) => setFareType(e.target.value as 'personal' | 'business')}
                data-testid="fare-type-select"
                options={[
                  { value: 'personal', label: 'Personal' },
                  { value: 'business', label: 'Business' }
                ]}
              />
            </Stack>

            {/* Flight Information */}
            <Stack spacing="sm">
              <Text weight="bold">Flight Information (Optional)</Text>
              <Stack direction="horizontal" spacing="md">
                <Input
                  value={flightInfo.airline}
                  onChange={(e) => setFlightInfo({ ...flightInfo, airline: e.target.value })}
                  placeholder="Airline"
                  data-testid="airline-input"
                />
                <Input
                  value={flightInfo.flightNumber}
                  onChange={(e) => setFlightInfo({ ...flightInfo, flightNumber: e.target.value })}
                  placeholder="Flight #"
                  data-testid="flight-number-input"
                />
              </Stack>
              <Stack direction="horizontal" spacing="md">
                <Input
                  value={flightInfo.arrivalTime}
                  onChange={(e) => setFlightInfo({ ...flightInfo, arrivalTime: e.target.value })}
                  type="text"
                  placeholder="Arrival Time (e.g., 09:30)"
                  data-testid="arrival-time-input"
                />
                <Input
                  value={flightInfo.terminal}
                  onChange={(e) => setFlightInfo({ ...flightInfo, terminal: e.target.value })}
                  placeholder="Terminal"
                  data-testid="terminal-input"
                />
              </Stack>
            </Stack>

            {/* Fare Display */}
            {fare && (
              <Box variant="outlined" padding="md">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text weight="bold">Estimated Fare</Text>
                  <Text weight="bold" size="lg">
                    ${fare.toFixed(2)}
                  </Text>
                </Stack>
              </Box>
            )}

            {/* Loading State */}
            {isCalculating && (
              <Text align="center" color="secondary">
                Calculating fare...
              </Text>
            )}
          </Stack>
        </Box>

        {/* Navigation */}
        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={goToNextPhase}
            variant="primary"
            fullWidth
            disabled={!canProceed || isCalculating}
            data-testid="continue-to-contact-button"
          >
            {isCalculating ? 'Calculating...' : 'Continue to Contact Info'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
