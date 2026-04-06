'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/design/ui';
import styled from 'styled-components';
import { colors } from '@/design/system/tokens/tokens';

const StickyButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  background: ${colors.background.primary}f2;
  backdrop-filter: blur(8px);
  border-top: 1px solid ${colors.border.default};

  /* Hide on desktop */
  @media (min-width: 768px) {
    display: none;
  }
`;

const FullWidthLink = styled(Link)`
  display: block;
  width: 100%;
`;

interface MobileStickyButtonProps {
  cmsData: any | null;
}

export const MobileStickyButton: React.FC<MobileStickyButtonProps> = ({ cmsData }) => {
  return (
    <StickyButtonContainer>
      <FullWidthLink href="/book">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          data-testid="mobile-sticky-book-now"

          text={cmsData?.['mobile-sticky-book-now'] || 'Book Now'}
        />
      </FullWidthLink>
    </StickyButtonContainer>
  );
};
