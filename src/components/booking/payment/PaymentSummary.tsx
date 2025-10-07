'use client';

import React from 'react';
import { Stack, Box, Text, H2 } from '@/design/ui';
import styled from 'styled-components';

const StrikethroughText = styled(Text)`
  text-decoration: line-through;
  opacity: 0.7;
`;

const TotalRow = styled(Stack)`
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
`;

interface PaymentSummaryProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number | null;
  tipAmount: number;
  depositAmount: number | null;
  cmsData: any;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  pickupLocation,
  dropoffLocation,
  pickupDateTime,
  fare,
  tipAmount,
  depositAmount,
  cmsData
}) => {
  const getTotalWithTip = () => (fare || 0) + tipAmount;

  return (
    <Box variant="elevated" padding="lg" data-testid="payment-summary">
      <Stack spacing="lg">
        <H2 align="center" cmsId="payment-summary-title">
          {cmsData?.['paymentPhase-summaryTitle'] || 'Booking Summary'}
        </H2>
        
        <Stack spacing="md">
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium" cmsId="payment-summary-pickup">
              {cmsData?.['paymentPhase-pickup'] || 'Pickup:'}
            </Text>
            <Text cmsId="pickup-location">{pickupLocation}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium" cmsId="payment-summary-dropoff">
              {cmsData?.['paymentPhase-dropoff'] || 'Dropoff:'}
            </Text>
            <Text cmsId="dropoff-location">{dropoffLocation}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium" cmsId="payment-summary-datetime">
              {cmsData?.['paymentPhase-datetime'] || 'Date & Time:'}
            </Text>
            <Text cmsId="pickup-datetime">{new Date(pickupDateTime).toLocaleString()}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium" cmsId="payment-summary-fare">
              {cmsData?.['paymentPhase-fare'] || 'Base Fare:'}
            </Text>
            <Text cmsId="base-fare">${fare?.toFixed(2) || '0.00'}</Text>
          </Stack>
          
          <Stack direction="horizontal" justify="space-between">
            <Text weight="medium" cmsId="payment-summary-tip">
              {cmsData?.['paymentPhase-tip'] || 'Tip:'}
            </Text>
            <Text cmsId="tip-amount">${tipAmount.toFixed(2)}</Text>
          </Stack>
          
          <TotalRow direction="horizontal" justify="space-between">
            <Text weight="bold" size="lg" cmsId="payment-summary-total">
              {cmsData?.['paymentPhase-total'] || 'Total:'}
            </Text>
            <Text weight="bold" size="lg" color="primary" cmsId="total-amount">
              ${getTotalWithTip().toFixed(2)}
            </Text>
          </TotalRow>
        </Stack>
        
        <Text size="sm" color="secondary" align="center" cmsId="payment-phase-deposit-note">
          {cmsData?.['paymentPhase-depositNote'] || 'A 30% deposit is required to confirm your booking. The remaining balance will be due before your trip.'}
        </Text>
        
        {/* Promotional Message */}
        <Box variant="filled" padding="lg">
          <Stack spacing="md" align="center">
            <Text size="md" weight="bold" color="primary" cmsId="promo-limited-time-main">
              🎉 Limited Time Offer! 
            </Text>
            <StrikethroughText size="md" color="secondary" cmsId="promo-deposit-strikethrough-main">
              Deposit: ${depositAmount?.toFixed(2)}
            </StrikethroughText>
            <Text size="md" weight="bold" color="success" cmsId="promo-no-deposit-main">
              No Deposit Required - Book Now!
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
