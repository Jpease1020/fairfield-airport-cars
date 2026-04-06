'use client';

import React from 'react';
import { Container, Stack } from '@/design/ui';
import { H1, Text } from '@/design/ui';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import Image from 'next/image';
import styled from 'styled-components';

const FlexStack = styled(Stack)`
  flex: 1;
`;

const GreyContainer = styled(Container)`
  background-color: var(--background-muted);
  border-radius: 16px;
`;

const HeroImageWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  max-height: 280px;

  @media (min-width: 1024px) {
    max-height: 360px;
  }

  img {
    object-fit: cover;
  }
`;

const TrustBadges = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
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
        {/* Left Side: Photo + Trust Messaging */}
        <FlexStack spacing="lg" justify="center" data-testid="hero-trust-messaging">
          <Stack spacing="md" padding={{ lg: '2xl' }}>
            <H1
              align="center"

              data-testid="hero-title"
            >
              {cmsData?.['hero-title'] || 'Premium Airport Transportation'}
            </H1>

            <Text
              align="center"
              size="lg"

              data-testid="hero-description"
            >
              {cmsData?.['hero-description'] || "No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County."}
            </Text>

            <TrustBadges>
              <Badge>Licensed &amp; Insured</Badge>
              <Badge>Flight Tracking</Badge>
              <Badge>Flat-Rate Pricing</Badge>
            </TrustBadges>
          </Stack>

          <HeroImageWrapper>
            <Image
              src="/images/bram-van-oost-eaPkue76Ip4-unsplash.jpg"
              alt="Premium black car for airport transportation"
              fill
              priority
              data-testid="hero-car-image"
            />
          </HeroImageWrapper>
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
