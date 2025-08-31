'use client';

import React, { useState } from 'react';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Button } from '../../components/base-components/Button';
import { Text } from '../../components/base-components/text/Text';
import { Input } from '../../components/base-components/forms/Input';

interface HeroCompactBookingFormProps {
  'data-testid'?: string;
}

export const HeroCompactBookingForm: React.FC<HeroCompactBookingFormProps> = ({
  'data-testid': dataTestId,
  ...rest
}) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const handleGetPrice = () => {
    // Navigate to booking page with pre-filled values
    const params = new URLSearchParams({
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      date: pickupDate,
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
          <Input
            placeholder="From: Fairfield Station"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            size="md"
            fullWidth
          />
          
          <Input
            placeholder="To: JFK Airport"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            size="md"
            fullWidth
          />
          
          <Input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            size="md"
            fullWidth
          />
        </Stack>
        
        <Button
          variant="primary"
          size="md"
          onClick={handleGetPrice}
          disabled={!pickupLocation || !dropoffLocation || !pickupDate}
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
