'use client';

import React from 'react';
import { Stack, Box, Text, H3, StatusMessage } from '@/design/ui';
import { useBooking } from '@/providers/BookingProvider';
import { QuoteCountdown } from '@/components/booking/QuoteCountdown';
import { PriceGuarantee } from '@/components/business/PriceGuarantee';

interface FareDisplaySectionProps {
  fare: number | null;
  isCalculating: boolean;
  fareType: 'personal' | 'business';
  cmsData: any;
  error?: string | null;
}

export const FareDisplaySection: React.FC<FareDisplaySectionProps> = ({
  fare,
  isCalculating,
  fareType,
  cmsData,
  error
}) => {
  const formatFare = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFareTypeLabel = () => {
    return fareType === 'personal' 
      ? (cmsData?.['tripDetailsPhase-personalFare'] || 'Personal')
      : (cmsData?.['tripDetailsPhase-businessFare'] || 'Business');
  };

  if (isCalculating) {
    return (
      <Box variant="elevated" padding="lg" data-testid="fare-calculating">
        <Stack spacing="sm" align="center">
          <Text color="secondary">
            {cmsData?.['tripDetailsPhase-calculatingFare'] || 'Calculating fare...'}
          </Text>
        </Stack>
      </Box>
    );
  }

  // Only show error if there's actually an error and it's not just initial state
  if (error && error.trim() !== '') {
    return (
      <Box variant="elevated" padding="lg" data-testid="fare-error">
        <StatusMessage
          type="error"
          message={error}
          id="fare-error-message"
        />
      </Box>
    );
  }

  if (fare === null && !isCalculating) {
    return null; // Don't show anything if no fare yet (initial state)
  }

  return (
    <Box variant="elevated" padding="lg" data-testid="fare-display">
      <Stack spacing="sm">
        <H3 cmsId="trip-details-fare-title">
          {cmsData?.['tripDetailsPhase-fareTitle'] || 'Estimated Fare'}
        </H3>
        
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text color="secondary">
            {getFareTypeLabel()} {cmsData?.['tripDetailsPhase-fareType'] || 'Fare'}
          </Text>
          <Text size="lg" weight="bold" color="primary">
            {fare !== null ? formatFare(fare) : '--'}
          </Text>
        </Stack>
        
        {/* Countdown for quote validity if available */}
        <CountdownRow />
        
        {/* Price Guarantee - Full size for visibility */}
        <PriceGuarantee variant="full" cmsData={cmsData} />
      </Stack>
    </Box>
  );
};

// Local component to access provider without altering main props
const CountdownRow: React.FC = () => {
  const { currentQuote } = useBooking();
  
  if (!currentQuote) return null;
  
  return <QuoteCountdown expiresAt={currentQuote.expiresAt} />;
};
