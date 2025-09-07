'use client';

import React from 'react';
import { Stack, Button } from '@/ui';

interface TripDetailsNavigationProps {
  canProceed: boolean;
  onNext: () => void;
  cmsData: any;
}

export const TripDetailsNavigation: React.FC<TripDetailsNavigationProps> = ({
  canProceed,
  onNext,
  cmsData
}) => {
  return (
    <Stack direction="horizontal" justify="flex-end" data-testid="trip-details-navigation">
      <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        disabled={!canProceed}
        data-testid="trip-details-next-button"
        cmsId="trip-details-next-button"
        text={cmsData?.['tripDetailsPhase-nextButton'] || 'Continue to Contact Info'}
      />
    </Stack>
  );
};
