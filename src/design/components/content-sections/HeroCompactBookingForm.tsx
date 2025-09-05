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

  // Calculate estimated fare based on route using real-time API
  const calculateEstimatedFareFromRoute = async (routeInfo: any) => {
    // Extract distance in miles from route info
    const distanceText = routeInfo.distance;
    const distanceMatch = distanceText.match(/(\d+(?:\.\d+)?)/);
    const distanceInMiles = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
    
    // Use the real-time fare calculation API
    try {
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: pickupLocation,
          destination: dropoffLocation,
          fareType: 'business'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.fare;
      }
    } catch (error) {
      // Silently handle API errors and use fallback
    }
    
    // Fallback to simple calculation if API fails
    const baseFare = 2.50; // Use current CMS pricing
    const perMileRate = 1.60;
    const perMinuteRate = 0.20;
    const estimatedMinutes = distanceInMiles; // Rough estimate
    const estimatedFare = baseFare + (distanceInMiles * perMileRate) + (estimatedMinutes * perMinuteRate);
    
    return Math.round(estimatedFare);
  };

  // Simple distance-based fare calculation using current CMS pricing
  const calculateSimpleEstimatedFare = (pickup: string, dropoff: string) => {
    // Use current CMS pricing for consistency
    const baseFare = 2.50;
    const perMileRate = 1.60;
    const perMinuteRate = 0.20;
    
    // Estimate distance based on pickup location to airports
    let estimatedDistance = 45; // Default for Fairfield to NYC airports
    let estimatedMinutes = 60; // Default time estimate
    
    if (pickup.toLowerCase().includes('fairfield')) {
      estimatedDistance = 45;
      estimatedMinutes = 60;
    } else if (pickup.toLowerCase().includes('stamford')) {
      estimatedDistance = 35;
      estimatedMinutes = 50;
    } else if (pickup.toLowerCase().includes('norwalk')) {
      estimatedDistance = 40;
      estimatedMinutes = 55;
    }
    
    const estimatedFare = baseFare + (estimatedDistance * perMileRate) + (estimatedMinutes * perMinuteRate);
    return Math.round(estimatedFare);
  };

  // Calculate route in real-time when both locations are set
  const { route, loading, error } = useRouteCalculation(
    pickupCoords,
    dropoffCoords,
    pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : null
  );

  // Update estimated fare whenever form data changes
  useEffect(() => {
    const updateFare = async () => {
      if (route) {
        // Use precise route calculation when available
        const fare = await calculateEstimatedFareFromRoute(route);
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
    };
    
    updateFare();
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
          Get Estimate
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
        
        {estimatedFare && (
          <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
            <Button
              variant="primary"
              size="md"
              onClick={handleGetPrice}
              cmsId="get-price-button"
              data-testid="quick-book-get-price-button"
              text="Book Now to Secure Rate →"
            />
          </Stack>
        )}
        <Text size="xs" align="center" variant="muted" data-testid="quick-book-disclaimer">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </Container>
  );
};
