'use client';

import React from 'react';
import { Container, Stack } from '@/design/ui';
import { H1, Text } from '@/design/ui';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import { PriceGuarantee } from '@/components/business/PriceGuarantee';
import styled from 'styled-components';

const FlexStack = styled(Stack)`
  flex: 1;
`;

const GreyContainer = styled(Container)`
  background-color: var(--background-muted);
  border-radius: 16px;
`;

interface HeroSectionProps {
  cmsData: any | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ cmsData }) => {
  return (
    <GreyContainer maxWidth="full" padding="xl" variant="section" data-testid="hero-section">
      <Stack
        direction={{ xs: 'vertical', lg: 'horizontal' }}
        spacing="xl"
        align="stretch"
      >
        {/* Left Side: Trust Messaging */}
        <FlexStack spacing="xl" justify="flex-start" data-testid="hero-trust-messaging">
          <Stack spacing="md" padding={{ lg: '2xl' }}>
            <H1
              align="center"
              cmsId="hero-title"
              data-testid="hero-title"
            >
              {cmsData?.['hero-title'] || 'Premium Airport Transportation'}
            </H1>

            <Text
              align="center"
              size="lg"
              cmsId="hero-description"
              data-testid="hero-description"
            >
              {cmsData?.['hero-description'] || "No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County."}
            </Text>
            
            {/* Price Guarantee - Temporarily hidden */}
            {/* <PriceGuarantee variant="compact" cmsData={cmsData} /> */}
          </Stack>
        </FlexStack>

        {/* Right Side: Compact Booking Form */}
        <FlexStack justify="center" data-testid="hero-booking-form-container">
          <HeroCompactBookingForm data-testid="hero-booking-form" />
        </FlexStack>
      </Stack>
    </GreyContainer>
  );
};

export { HeroSection };
