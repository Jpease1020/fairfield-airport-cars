'use client';

import React from 'react';
import { Stack, Box, Text, H2 } from '@/design/ui';
import styled from 'styled-components';

const GreyBox = styled(Box)`
  background-color: var(--background-muted);
  height: 100%;
`;

interface FAQSectionProps {
  cmsData: any | null;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ cmsData }) => {
  return (
    <Stack spacing="xl" align="center" data-testid="faq-section">
      <Stack spacing="md" align="center">
        <H2
          align="center"

          data-testid="faq-title"
        >
          {cmsData?.['faq-title'] || 'Frequently Asked Questions'}
        </H2>
        <Text
          align="center"
          size="lg"

          data-testid="faq-subtitle"
        >
          {cmsData?.['faq-subtitle'] || 'Everything you need to know about our service'}
        </Text>
      </Stack>

      <GreyBox variant="elevated" padding="xl" data-testid="faq-container">
        <Stack spacing="xl" align="stretch">
          <Stack spacing="md" data-testid="faq-item-1">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"

            >
              {cmsData?.['faq-items-0-question'] || 'How far in advance should I book?'}
            </Text>
            <Text
              size="md"
              color="secondary"

            >
              {cmsData?.['faq-items-0-answer'] || 'We recommend booking at least 24 hours in advance for the best availability.'}
            </Text>
          </Stack>
          
          <Stack spacing="md" data-testid="faq-item-2">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"

            >
              {cmsData?.['faq-items-1-question'] || 'What if my flight is delayed?'}
            </Text>
            <Text
              size="md"
              color="secondary"

            >
              {cmsData?.['faq-items-1-answer'] || 'We track your flight and automatically adjust pickup times for delays.'}
            </Text>
          </Stack>
          
          <Stack spacing="md" data-testid="faq-item-3">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"

            >
              {cmsData?.['faq-items-2-question'] || 'Can I cancel or modify my booking?'}
            </Text>
            <Text
              size="md"
              color="secondary"

            >
              {cmsData?.['faq-items-2-answer'] || 'Yes. Cancellations 24+ hours in advance have no fee; less than 24h incur a 25% fee, less than 12h 50%, less than 6h 75%. Contact us to modify your booking.'}
            </Text>
          </Stack>
        </Stack>
      </GreyBox>
    </Stack>
  );
};
