'use client';

import React, { useState, useEffect } from 'react';
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
  
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [fareCalculationMethod, setFareCalculationMethod] = useState<'route' | 'simple' | null>(null);

  // Calculate estimated fare based on route
  const calculateEstimatedFareFromRoute = (routeInfo: any) => {
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

  // Simple distance-based fare calculation for when coordinates aren't available
  const calculateSimpleEstimatedFare = (pickup: string, dropoff: string) => {
    // Simple heuristic based on common airport routes
    const airportRoutes = {
      'JFK': { base: 35, perMile: 2.8 },
      'LGA': { base: 30, perMile: 2.6 },
      'EWR': { base: 40, perMile: 3.0 },
      'BDL': { base: 25, perMile: 2.4 }
    };
    
    // Check if dropoff is an airport
    const airportMatch = Object.keys(airportRoutes).find(airport => 
      dropoff.toUpperCase().includes(airport)
    );
    
    if (airportMatch) {
      const config = airportRoutes[airportMatch as keyof typeof airportRoutes];
      // Estimate distance based on pickup location
      let estimatedDistance = 45; // Default for Fairfield to NYC airports
      
      if (pickup.toLowerCase().includes('fairfield')) {
        estimatedDistance = 45;
      } else if (pickup.toLowerCase().includes('stamford')) {
        estimatedDistance = 35;
      } else if (pickup.toLowerCase().includes('norwalk')) {
        estimatedDistance = 40;
      }
      
      return Math.round(config.base + (estimatedDistance * config.perMile));
    }
    
    // Default calculation for non-airport routes
    return 50; // Default estimated fare
  };

  // Calculate route in real-time when both locations are set
  const { route, loading, error } = useRouteCalculation(
    pickupCoords,
    dropoffCoords,
    pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : null
  );

  // Update estimated fare whenever form data changes
  useEffect(() => {
    if (route) {
      // Use precise route calculation when available
      const fare = calculateEstimatedFareFromRoute(route);
      setEstimatedFare(fare);
      setFareCalculationMethod('route');
    } else if (pickupLocation && dropoffLocation) {
      // Use simple calculation when locations are filled but coordinates aren't available yet
      const fare = calculateSimpleEstimatedFare(pickupLocation, dropoffLocation);
      setEstimatedFare(fare);
      setFareCalculationMethod('simple');
    } else {
      setEstimatedFare(null);
      setFareCalculationMethod(null);
    }
  }, [route, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords]);

  // Separate effect to handle autocomplete selections without affecting fare calculation
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address);
    setPickupCoords(coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address);
    setDropoffCoords(coordinates);
  };

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
        <Text variant="lead" weight="semibold" align="center" data-testid="quick-book-title">
          Quick Book
        </Text>
        
        <Stack spacing="md">
          <LocationInput
            id="pickup-location"
            placeholder="From: Fairfield Station"
            value={pickupLocation}
            onChange={setPickupLocation}
            onLocationSelect={handlePickupLocationSelect}
            size="md"
            fullWidth
            data-testid="quick-book-pickup-input"
          />
          
          <LocationInput
            id="dropoff-location"
            placeholder="To: JFK Airport"
            value={dropoffLocation}
            onChange={setDropoffLocation}
            onLocationSelect={handleDropoffLocationSelect}
            size="md"
            fullWidth
            data-testid="quick-book-dropoff-input"
          />
          
          <Stack direction="horizontal" spacing="md">
            <Input
              type="datetime-local" 
              id="pickup-datetime"
              value={pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : ''}
              onChange={(e) => {
                const datetime = e.target.value;
                if (datetime) {
                  const [date, time] = datetime.split('T');
                  setPickupDate(date);
                  setPickupTime(time);
                }
              }}
              size="md"
              fullWidth
              data-testid="quick-book-datetime-input"
            />
          </Stack>
        </Stack>
        
        {/* Show estimated price in real-time */}
        {estimatedFare && (
          <Stack spacing="sm" align="center" data-testid="quick-book-price-display">
            <Text size="lg" weight="bold" color="primary">
              Estimated Fare: ${estimatedFare}
            </Text>
            {fareCalculationMethod === 'simple' && (
              <Text size="sm" color="secondary">
                *Price will be updated with exact route details
              </Text>
            )}
            {fareCalculationMethod === 'route' && (
              <Text size="sm" color="success">
                ✓ Based on exact route calculation
              </Text>
            )}
          </Stack>
        )}
        
        {/* Show route summary when both coordinates are available */}
        {(pickupCoords && dropoffCoords) && (
          <RouteSummary
            route={route}
            loading={loading}
            error={error}
            estimatedFare={estimatedFare}
            data-testid="quick-book-route-summary"
          />
        )}
        
        <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
          <Button
            variant="primary"
            size="md"
            onClick={handleGetPrice}
            disabled={!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime}
            cmsId="get-price-button"
            data-testid="quick-book-get-price-button"
            text="Get Estimate"
          />
          <Text size="lg" variant="muted" data-testid="quick-book-disclaimer">
            Book with confidence →
          </Text>
        </Stack>
        <Text size="xs" align="center" variant="muted" data-testid="quick-book-disclaimer">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </Container>
  );
};
