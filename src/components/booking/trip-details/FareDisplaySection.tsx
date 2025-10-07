'use client';

import React from 'react';
import { Stack, Box, Text, H3, StatusMessage } from '@/design/ui';

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

  if (fare === null && error) {
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
    return null; // Don't show anything if no fare and no error
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
      </Stack>
    </Box>
  );
};

// Local component to access provider without altering main props
const CountdownRow: React.FC = () => {
  // Note: Quote countdown removed since we simplified to currentFare only
  // If you want countdown functionality, we'd need to add it back to the API response
  return null;
};
