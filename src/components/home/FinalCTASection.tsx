'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Stack, H2, Text, Button } from '@/ui';

interface FinalCTASectionProps {
  cmsData: any | null;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ cmsData }) => {
  return (
    <Container padding="xl" variant="section" data-testid="final-cta-section">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H2
            align="center"
            cmsId="final-cta-title"
            data-testid="final-cta-title"
          >
            {cmsData?.['final-cta-title'] || 'Ready to Book Your Ride?'}
          </H2>
          <Text
            align="center"
            size="lg"
            cmsId="final-cta-description"
            data-testid="final-cta-description"
          >
            {cmsData?.['final-cta-description'] || 'Experience reliable airport transportation with Fairfield Airport Cars'}
          </Text>
        </Stack>

        <Stack direction="horizontal" spacing="md" align="center" justify="center">
          <Link href="/book">
            <Button
              variant="primary"
              size="lg"
              cmsId="final-cta-primary-button"
              data-testid="final-cta-primary-button"
            >
              {cmsData?.['final-cta-primary-button'] || 'Book Now'}
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="secondary"
              size="lg"
              cmsId="final-cta-secondary-button"
              data-testid="final-cta-secondary-button"
            >
              {cmsData?.['final-cta-secondary-button'] || 'Learn More'}
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
};
