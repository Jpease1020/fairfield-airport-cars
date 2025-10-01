'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Box } from '../../layout/content/Box';
import { Button } from '../../components/base-components/Button';
import { Text } from '../../components/base-components/text/Text';
import { Input } from '../../components/base-components/forms/Input';
import { LocationInput } from '../base-components/forms/LocationInput';
import { useLocation } from '../../../contexts/LocationContext';

interface Coordinates {
  lat: number;
  lng: number;
}

const StrikethroughText = styled(Text)`
  text-decoration: line-through;
  opacity: 0.7;
`;

interface HeroCompactBookingFormProps {
  'data-testid'?: string;
}

export const HeroCompactBookingForm: React.FC<HeroCompactBookingFormProps> = ({
  'data-testid': dataTestId,
  ...rest
}) => {
  // Use global location context instead of local state
  const { 
    locationData, 
    setPickupLocation, 
    setDropoffLocation, 
    isLocationValid,
    locationErrors 
  } = useLocation();
  
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [fareCalculationMethod, setFareCalculationMethod] = useState<'route' | 'simple' | null>(null);

  // Route calculation removed - using simple fare estimation

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

  // Note: Route calculation is handled in the main booking form
  // This hero form uses simple fare estimation

  // Update estimated fare whenever form data changes
  useEffect(() => {
    const updateFare = async () => {
      if (locationData.pickup.address && locationData.dropoff.address && pickupDate && pickupTime) {
        // Use simple calculation for hero form
        const fare = calculateSimpleEstimatedFare(locationData.pickup.address, locationData.dropoff.address);
        setEstimatedFare(fare);
        setFareCalculationMethod('simple');
      } else {
        setEstimatedFare(null);
        setFareCalculationMethod(null);
      }
    };
    
    updateFare();
  }, [locationData.pickup.address, locationData.dropoff.address, locationData.pickup.coordinates, locationData.dropoff.coordinates, pickupDate, pickupTime]);

  // Handle location selection using global context
  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setPickupLocation(address, coordinates);
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setDropoffLocation(address, coordinates);
  };

  const handleGetPrice = () => {
    // Navigate to booking page - location data is already in global context!
    const params = new URLSearchParams({
      pickup: locationData.pickup.address,
      dropoff: locationData.dropoff.address,
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
            value={locationData.pickup.address}
            onChange={(address) => setPickupLocation(address)}
            onLocationSelect={handlePickupLocationSelect}
            size="md"
            fullWidth
            data-testid="quick-book-pickup-input"
          />
          
          <LocationInput
            id="dropoff-location"
            placeholder="To: JFK Airport"
            value={locationData.dropoff.address}
            onChange={(address) => setDropoffLocation(address)}
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
            
            {/* Promotional Message */}
            <Box variant="filled" padding="md">
              <Stack spacing="sm" align="center">
                <Text size="lg" weight="bold" color="primary" cmsId="promo-limited-time">
                  🎉 Limited Time Offer!
                </Text>
                <StrikethroughText size="md" color="secondary" cmsId="promo-deposit-strikethrough">
                  Deposit: ${(estimatedFare * 0.3).toFixed(2)}
                </StrikethroughText>
                <Text size="lg" weight="bold" color="success" cmsId="promo-no-deposit">
                  No Deposit Required - Book Now!
                </Text>
              </Stack>
            </Box>
          </Stack>
        )}
        
        {/* Route summary removed - using simple fare estimation */}
        
        <Stack direction="horizontal" spacing="md" align="center" justify="flex-start">
          <Button
            variant="primary"
            size="md"
            onClick={handleGetPrice}
            disabled={!isLocationValid}
            cmsId="get-price-button"
            data-testid="quick-book-get-price-button"
            text="Book Now to Secure Rate →"
          />
        </Stack>
        
        {!isLocationValid && locationErrors.length > 0 && (
          <Text size="sm" color="error" align="center">
            {locationErrors[0]}
          </Text>
        )}
        <Text size="xs" align="center" variant="muted" data-testid="quick-book-disclaimer">
          Instant pricing • No hidden fees
        </Text>
      </Stack>
    </Container>
  );
};
