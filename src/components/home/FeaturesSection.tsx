'use client';

import React from 'react';
import { Stack, Col, Box, Text, H2 } from '@/design/ui';
import Image from 'next/image';
import styled from 'styled-components';

const FeaturesSectionContainer = styled(Stack)`
  margin-top: 1rem;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: auto;
  max-width: 750px;
  border-radius: 8px;
`;

const GreyBox = styled(Box)`
  background-color: var(--background-muted);
  height: 100%;
`;

interface FeaturesSectionProps {
  cmsData: any | null;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ cmsData }) => {
  return (
    <FeaturesSectionContainer spacing="xl" align="center" data-testid="features-section">
      <StyledImage
        src="/images/Gemini_Generated_Image_60233k60233k6023.png"
        alt="Premium airport transportation service"
        width={1024}
        height={1024}
        priority
        data-testid="features-hero-image"
      />
      
      <Stack spacing="md" align="center">
        <H2
          align="center"
          cmsId="features-title"
          data-testid="features-title"
        >
          {cmsData?.['features-title'] || 'Why Choose Us'}
        </H2>
        <Text
          align="center"
          size="lg"
          cmsId="features-subtitle"
          data-testid="features-subtitle"
        >
          {cmsData?.['features-subtitle'] || 'Experience the difference with our premium service'}
        </Text>
      </Stack>

      <Stack
        direction={{ xs: 'vertical', md: 'horizontal' }}
        spacing={{ xs: 'lg', md: 'xl' }}
        align="stretch"
        padding="xl"
      >
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-1">
          <Col grow align="center">
            <Stack spacing="sm" align="center">
              <Text size="xl" align="center" cmsId="ignore">⭐</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-0-title"
              >
                {cmsData?.['features-items-0-title'] || 'Reliable Service'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-0-description"
              >
                {cmsData?.['features-items-0-description'] || 'Professional drivers and well-maintained vehicles'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-2">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center" cmsId="ignore">🚗</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-1-title"
              >
                {cmsData?.['features-items-1-title'] || 'Flight Tracking'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-1-description"
              >
                {cmsData?.['features-items-1-description'] || 'We monitor your flight for delays and adjust pickup times'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-3">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center" cmsId="ignore">💳</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-2-title"
              >
                {cmsData?.['features-items-2-title'] || '24/7 Support'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-2-description"
              >
                {cmsData?.['features-items-2-description'] || 'Round-the-clock customer service and emergency support'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
      </Stack>
    </FeaturesSectionContainer>
  );
};
