'use client';

import React from 'react';
import { Stack, Box, Text, H2 } from '@/design/ui';
import styled from 'styled-components';

const TotalRow = styled(Stack)`
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
`;

interface PaymentSummaryProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number | null;
  cmsData: any;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  pickupLocation,
  dropoffLocation,
  pickupDateTime,
  fare,
  cmsData
}) => {
  const total = fare || 0;

  return (
    <Box variant="elevated" padding="lg" data-testid="payment-summary">
      <Stack spacing="lg">
        <H2 align="center">
          {cmsData?.['paymentPhase-summaryTitle'] || 'Booking Summary'}
        </H2>
        
        <Stack spacing="md">
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium">
              {cmsData?.['paymentPhase-pickup'] || 'Pickup:'}
            </Text>
            <Text>{pickupLocation}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium">
              {cmsData?.['paymentPhase-dropoff'] || 'Dropoff:'}
            </Text>
            <Text>{dropoffLocation}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium">
              {cmsData?.['paymentPhase-datetime'] || 'Date & Time:'}
            </Text>
            <Text>{new Date(pickupDateTime).toLocaleString()}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium">
              {cmsData?.['paymentPhase-fare'] || 'Base Fare:'}
            </Text>
            <Text>${fare?.toFixed(2) || '0.00'}</Text>
          </Stack>
          
          <TotalRow direction="horizontal" justify="space-between">
            <Text weight="bold" size="lg">
              {cmsData?.['paymentPhase-total'] || 'Total:'}
            </Text>
            <Text weight="bold" size="lg" color="primary">
              ${total.toFixed(2)}
            </Text>
          </TotalRow>
        </Stack>

        <Text size="sm" color="secondary" align="center">
          {cmsData?.['paymentPhase-depositNote'] ||
            'No payment is required right now. Confirm your ride and pay after your trip.'}
        </Text>
      </Stack>
    </Box>
  );
};
