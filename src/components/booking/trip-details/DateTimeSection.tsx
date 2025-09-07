'use client';

import React from 'react';
import { Stack, H2, Text, Input, Select } from '@/ui';

interface DateTimeSectionProps {
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  onDateTimeChange: (dateTime: string) => void;
  onFareTypeChange: (type: 'personal' | 'business') => void;
  cmsData: any;
}

export const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  pickupDateTime,
  fareType,
  onDateTimeChange,
  onFareTypeChange,
  cmsData
}) => {
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Stack spacing="lg" data-testid="datetime-section">
      <H2 cmsId="trip-details-datetime-title">
        {cmsData?.['tripDetailsPhase-datetimeTitle'] || 'When do you need a ride?'}
      </H2>
      
      <Text color="secondary" cmsId="trip-details-datetime-description">
        {cmsData?.['tripDetailsPhase-datetimeDescription'] || 'Select your preferred pickup date and time.'}
      </Text>
      
      <Stack spacing="md">
        <Input
          type="datetime-local"
          label={cmsData?.['tripDetailsPhase-datetimeLabel'] || 'Pickup Date & Time'}
          value={pickupDateTime}
          onChange={(e) => onDateTimeChange(e.target.value)}
          min={getMinDateTime()}
          data-testid="pickup-datetime-input"
        />
        
        <Select
          label={cmsData?.['tripDetailsPhase-fareTypeLabel'] || 'Fare Type'}
          value={fareType}
          onChange={(e) => onFareTypeChange(e.target.value as 'personal' | 'business')}
          options={[
            { value: 'personal', label: cmsData?.['tripDetailsPhase-personalFare'] || 'Personal' },
            { value: 'business', label: cmsData?.['tripDetailsPhase-businessFare'] || 'Business' }
          ]}
          data-testid="fare-type-select"
        />
      </Stack>
    </Stack>
  );
};
