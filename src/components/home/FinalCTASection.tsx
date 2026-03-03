'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Stack, H2, Text, Button } from '@/design/ui';

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

            data-testid="final-cta-title"
          >
            {cmsData?.['final-cta-title'] || 'Ready to Book Your Ride?'}
          </H2>
          <Text
            align="center"
            size="lg"

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

              data-testid="final-cta-primary-button"
            >
              {cmsData?.['final-cta-primary-button'] || 'Book Now'}
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="secondary"
              size="lg"

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
