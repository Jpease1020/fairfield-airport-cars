'use client';

import React from 'react';
import { Container, Stack, Box, Button, Text, H2, Input, Select } from '@/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { FlightInfo } from '@/hooks/useBookingForm';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TripDetailsPhaseProps {
  // State
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  flightInfo: FlightInfo;
  fare: number | null;
  isCalculating: boolean;
  
  // Setters
  setPickupLocation: (location: string) => void;
  setDropoffLocation: (location: string) => void;
  setPickupCoords: (coords: Coordinates | null) => void;
  setDropoffCoords: (coords: Coordinates | null) => void;
  setPickupDateTime: (dateTime: string) => void;
  setFareType: (type: 'personal' | 'business') => void;
  setFlightInfo: (info: FlightInfo) => void;
  setFare: (fare: number | null) => void;
  setIsCalculating: (calculating: boolean) => void;
  
  // Actions
  goToNextPhase: () => void;
  
  // Validation
  canProceed: boolean;
  
  // CMS Data
  cmsData: any;
}

export function TripDetailsPhase({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  pickupDateTime,
  fareType,
  flightInfo,
  fare,
  isCalculating,
  setPickupLocation,
  setDropoffLocation,
  setPickupCoords,
  setDropoffCoords,
  setPickupDateTime,
  setFareType,
  setFlightInfo,
  setFare,
  setIsCalculating,
  goToNextPhase,
  canProceed,
  cmsData
}: TripDetailsPhaseProps) {
  const routes = useMapsLibrary('routes');
  const mapsLoaded = !!routes;

  // Handle location selection with coordinates
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address);
    setPickupCoords(coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address);
    setDropoffCoords(coordinates);
  };

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
            pickupCoords,
            dropoffCoords,
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
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, fareType, mapsLoaded, setFare, setIsCalculating]);

  // Note: Error handling for Google Maps loading is handled by the parent component

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <H2 align="center" cmsId="trip-title">
          {cmsData?.['trip-title'] || 'Trip Details'}
        </H2>

        <Text variant="muted" size="sm" cmsId="trip-description">
          {cmsData?.['trip-description'] || 'Tell us about your trip so we can provide an accurate fare estimate'}
        </Text>

        {/* Trip Details Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Pickup Location */}
            <Stack spacing="sm">
              <Text weight="bold" cmsId="pickup-location-label">{cmsData?.['pickup-location-label'] || 'Pickup Location'} *</Text>
              <LocationInput
                value={pickupLocation}
                onChange={setPickupLocation}
                onLocationSelect={handlePickupLocationSelect}
                placeholder={cmsData?.['pickup-location-placeholder'] || 'Enter pickup address or landmark'}
                data-testid="pickup-location-input"
              />
            </Stack>

            {/* Dropoff Location */}
            <Stack spacing="sm">
              <Text weight="bold" cmsId="dropoff-location-label">{cmsData?.['dropoff-location-label'] || 'Dropoff Location'} *</Text>
              <LocationInput
                value={dropoffLocation}
                onChange={setDropoffLocation}
                onLocationSelect={handleDropoffLocationSelect}
                placeholder={cmsData?.['dropoff-location-placeholder'] || 'Enter destination address or landmark'}
                data-testid="dropoff-location-input"
              />
            </Stack>

            {/* Pickup Date & Time */}
            <Stack spacing="sm">
              <Text weight="bold" cmsId="pickup-datetime-label">{cmsData?.['pickup-datetime-label'] || 'Pickup Date & Time'} *</Text>
              <Input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                data-testid="pickup-datetime-input"
                cmsId="pickup-datetime-input"
              />
            </Stack>

            {/* Fare Type */}
            <Stack spacing="sm">
              <Text weight="bold" cmsId="fare-type-label">{cmsData?.['fare-type-label'] || 'Fare Type'}</Text>
              <Select
                value={fareType}
                onChange={(e) => setFareType(e.target.value as 'personal' | 'business')}
                data-testid="fare-type-select"
                cmsId="fare-type-select"
                options={[
                  { value: 'personal', label: cmsData?.['fare-type-personal'] || 'Personal' },
                  { value: 'business', label: cmsData?.['fare-type-business'] || 'Business' }
                ]}
              />
            </Stack>

            {/* Flight Information */}
            <Stack spacing="sm">
              <Text weight="bold" cmsId="flight-info-label">{cmsData?.['flight-info-label'] || 'Flight Information (Optional)'}</Text>
              <Stack direction="horizontal" spacing="md">
                <Input
                  value={flightInfo.airline}
                  onChange={(e) => setFlightInfo({ ...flightInfo, airline: e.target.value })}
                  placeholder={cmsData?.['airline-placeholder'] || 'Airline'}
                  data-testid="airline-input"
                  cmsId="airline-input"
                />
                <Input
                  value={flightInfo.flightNumber}
                  onChange={(e) => setFlightInfo({ ...flightInfo, flightNumber: e.target.value })}
                  placeholder={cmsData?.['flight-number-placeholder'] || 'Flight #'}
                  data-testid="flight-number-input"
                  cmsId="flight-number-input"
                />
              </Stack>
              <Stack direction="horizontal" spacing="md">
                <Input
                  value={flightInfo.arrivalTime}
                  onChange={(e) => setFlightInfo({ ...flightInfo, arrivalTime: e.target.value })}
                  type="text"
                  placeholder={cmsData?.['arrival-time-placeholder'] || 'Arrival Time (e.g., 09:30)'}
                  data-testid="arrival-time-input"
                  cmsId="arrival-time-input"
                />
                <Input
                  value={flightInfo.terminal}
                  onChange={(e) => setFlightInfo({ ...flightInfo, terminal: e.target.value })}
                  placeholder={cmsData?.['terminal-placeholder'] || 'Terminal'}
                  data-testid="terminal-input"
                  cmsId="terminal-input"
                />
              </Stack>
            </Stack>

            {/* Fare Display */}
            {fare && (
              <Box variant="outlined" padding="md">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text weight="bold" cmsId="estimated-fare-label">{cmsData?.['estimated-fare-label'] || 'Estimated Fare'}</Text>
                  <Text weight="bold" size="lg" cmsId="estimated-fare-value">
                    ${fare.toFixed(2)}
                  </Text>
                </Stack>
              </Box>
            )}

            {/* Loading State */}
            {isCalculating && (
              <Text align="center" color="secondary" cmsId="calculating-fare">
                {cmsData?.['calculating-fare'] || 'Calculating fare...'}
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
            cmsId="continue-to-contact-button"
          >
            {isCalculating ? cmsData?.['calculating-button'] || 'Calculating...' : cmsData?.['continue-button'] || 'Continue to Contact Info'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
