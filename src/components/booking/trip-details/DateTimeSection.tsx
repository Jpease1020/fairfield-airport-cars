'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack, H2, Text, Select, Box, DateTimePicker } from '@/design/ui';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

interface DateTimeSectionProps {
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  onDateTimeChange: (dateTime: string) => void;
  onFareTypeChange: (type: 'personal' | 'business') => void;
  cmsData: any;
  error?: boolean;
  validation?: { fieldErrors?: Record<string, string> };
}

export const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  pickupDateTime,
  fareType,
  onDateTimeChange,
  onFareTypeChange,
  cmsData,
  error = false,
  validation
}) => {

  return (
    <DarkerGreyBox padding="lg" rounded="md" data-testid="datetime-section">
      <Stack spacing="lg">
        <H2 cmsId="trip-details-datetime-title">
          {cmsData?.['tripDetailsPhase-datetimeTitle'] || 'When do you need a ride?'}
        </H2>
        
        <Text color="secondary" cmsId="trip-details-datetime-description">
          {cmsData?.['tripDetailsPhase-datetimeDescription'] || 'Select your preferred pickup date and time.'}
        </Text>
        
        <Stack spacing="md">
          <DateTimePicker
            id="pickup-datetime-input"
            label={cmsData?.['tripDetailsPhase-datetimeLabel'] || 'Pickup Date & Time'}
            placeholder="mm/dd/yyyy, --:-- --"
            value={pickupDateTime}
            onChange={onDateTimeChange}
            minDate={undefined} // DateTimePicker will default to 24 hours from now
            fullWidth={true}
            error={error || !!validation?.fieldErrors?.['pickup-datetime-input']}
            required
            isValid={!!pickupDateTime && !error && !validation?.fieldErrors?.['pickup-datetime-input']}
            cmsId="pickup-datetime-input"
          />
          
          <Select
            id="fare-type-select"
            label={cmsData?.['tripDetailsPhase-fareTypeLabel'] || 'Fare Type'}
            value={fareType}
            onChange={(e) => onFareTypeChange(e.target.value as 'personal' | 'business')}
            options={[
              { value: 'personal', label: cmsData?.['tripDetailsPhase-personalFare'] || 'Personal' },
              { value: 'business', label: cmsData?.['tripDetailsPhase-businessFare'] || 'Business' }
            ]}
            fullWidth={true}
            data-testid="fare-type-select"
          />
        </Stack>
      </Stack>
    </DarkerGreyBox>
  );
};
