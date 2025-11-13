'use client';

import React from 'react';
import { Box, Stack, Text, Button } from '@/design/ui';
import styled from 'styled-components';
import { colors, spacing } from '@/design/system/tokens/tokens';

const GuaranteeBox = styled(Box)`
  background: linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.success[50]} 100%);
  border: 2px solid ${colors.primary[200]};
  border-radius: 12px;
  padding: ${spacing.md};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '✓';
    position: absolute;
    top: ${spacing.xs};
    right: ${spacing.xs};
    font-size: 48px;
    color: ${colors.success[300]};
    opacity: 0.2;
  }
`;

const GuaranteeText = styled(Text)`
  font-weight: 600;
  line-height: 1.4;
`;

const GuaranteeSubtext = styled(Text)`
  font-size: 0.875rem;
  line-height: 1.5;
`;

const FootnoteText = styled(Text)`
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: ${spacing.xs};
  color: ${colors.text.secondary};
`;

interface PriceGuaranteeProps {
  variant?: 'compact' | 'full';
  cmsData?: any;
  onScreenshotClick?: () => void;
}

export const PriceGuarantee: React.FC<PriceGuaranteeProps> = ({
  variant = 'full',
  cmsData,
  onScreenshotClick
}) => {
  const isCompact = variant === 'compact';
  
  const title = cmsData?.['price-guarantee-title'] || '💰 Price Match Guarantee';
  const description = cmsData?.['price-guarantee-description'] || 
    'We\'ll match or beat any Uber Black price. Screenshot your quote and text it to us at (646) 221-6370.';
  const ctaText = cmsData?.['price-guarantee-cta'] || 'Learn More';

  if (isCompact) {
    return (
      <Box variant="filled" padding="md" data-testid="price-guarantee-compact">
        <Stack spacing="xs" align="center">
          <Text size="md" weight="bold" color="primary" cmsId="price-guarantee-compact-text">
            {cmsData?.['price-guarantee-compact'] || '💰 We promise to match or beat Uber Black prices*'}
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <GuaranteeBox data-testid="price-guarantee-full">
      <Stack spacing="sm">
        <GuaranteeText size="lg" weight="bold" color="primary" cmsId="price-guarantee-title">
          {title}
        </GuaranteeText>
        <GuaranteeSubtext color="secondary" cmsId="price-guarantee-description" size="md">
          {description}
        </GuaranteeSubtext>
        <FootnoteText cmsId="price-guarantee-footnote">
          * Screenshot must be taken within 10 minutes of booking or 20 minutes of driver arrival
        </FootnoteText>
        {onScreenshotClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onScreenshotClick}
            cmsId="price-guarantee-cta"
            data-testid="price-guarantee-cta-button"
          >
            {ctaText}
          </Button>
        )}
      </Stack>
    </GuaranteeBox>
  );
};

