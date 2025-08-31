'use client';

import React, { useState } from 'react';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Button } from '../../components/base-components/Button';
import { Text } from '../../components/base-components/text/Text';
import { Input } from '../../components/base-components/forms/Input';
import { LocationInput } from '../base-components/forms/LocationInput';
import { RouteSummary } from './RouteSummary';
import { useRouteCalculation } from '../../../hooks/useRouteCalculation';

interface Coordinates {
  lat: number;
  lng: number;
}

interface HeroCompactBookingFormProps {
  'data-testid'?: string;
}

export const HeroCompactBookingForm: React.FC<HeroCompactBookingFormProps> = ({
  'data-testid': dataTestId,
  ...rest
}) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Calculate estimated fare based on route
  const calculateEstimatedFare = (routeInfo: any) => {
    // Extract distance in miles from route info
    const distanceText = routeInfo.distance;
    const distanceMatch = distanceText.match(/(\d+(?:\.\d+)?)/);
    const distanceInMiles = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
    
    // Base fare calculation (you can adjust these values)
    const baseFare = 25; // Base fare
    const perMileRate = 2.5; // Per mile rate
    const estimatedFare = baseFare + (distanceInMiles * perMileRate);
    
    return Math.round(estimatedFare);
  };

  // Calculate route in real-time when both locations are set
  const { route, loading, error } = useRouteCalculation(
    pickupCoords,
    dropoffCoords,
    pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : null
  );

  // Calculate estimated fare based on route
  const estimatedFare = route ? calculateEstimatedFare(route) : null;

  const handleGetPrice = () => {
    // Navigate to booking page with pre-filled values
    const params = new URLSearchParams({
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      date: pickupDate,
      time: pickupTime,
    });
    window.location.href = `/book?${params.toString()}`;
  };

  return (
    <Container 
      variant="elevated" 
      padding="lg" 
      maxWidth="full"
      data-testid={dataTestId}
      {...rest}
    >
      <Stack spacing="md">
        <Text variant="lead" weight="semibold" align="center">
          Quick Book
        </Text>
        
        <Stack spacing="md">
          <LocationInput
            id="pickup-location"
            placeholder="From: Fairfield Station"
            value={pickupLocation}
            onChange={setPickupLocation}
            onLocationSelect={(address: string, coordinates: Coordinates) => {
              setPickupLocation(address);
              setPickupCoords(coordinates);
            }}
            size="md"
            fullWidth
          />
          
          <LocationInput
            id="dropoff-location"
            placeholder="To: JFK Airport"
            value={dropoffLocation}
            onChange={setDropoffLocation}
            onLocationSelect={(address: string, coordinates: Coordinates) => {
              setDropoffLocation(address);
              setDropoffCoords(coordinates);
            }}
            size="md"
            fullWidth
          />
          
          <Stack direction="horizontal" spacing="md">
            <Input
              type="date" 
              id="pickup-date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              size="md"
              fullWidth
            />
            
            <Input
              type="datetime-local"
              id="pickup-datetime"
              value={pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : ''}
              onChange={(e) => {
                const dateTime = e.target.value;
                if (dateTime) {
                  const [date, time] = dateTime.split('T');
                  setPickupDate(date);
                  setPickupTime(time);
                }
              }}
              size="md"
              fullWidth
            />
          </Stack>
        </Stack>
        
        {/* Show route summary when both locations are set */}
        {(pickupCoords && dropoffCoords) && (
          <RouteSummary
            route={route}
            loading={loading}
            error={error}
            estimatedFare={estimatedFare}
          />
        )}
        
        <Button
          variant="primary"
          size="md"
          onClick={handleGetPrice}
          disabled={!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime}
        >
          Get Price
        </Button>
        
        <Text size="xs" align="center" variant="muted">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </Container>
  );
};
