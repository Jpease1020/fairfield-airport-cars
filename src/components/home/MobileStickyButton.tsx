'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/design/ui';
import styled from 'styled-components';

const StickyButtonContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  z-index: 1000;
  
  /* Hide on desktop */
  @media (min-width: 768px) {
    display: none;
  }
`;

interface MobileStickyButtonProps {
  cmsData: any | null;
}

export const MobileStickyButton: React.FC<MobileStickyButtonProps> = ({ cmsData }) => {
  return (
    <StickyButtonContainer>
      <Link href="/book">
        <Button
          variant="primary"
          size="lg"
          data-testid="mobile-sticky-book-now"
          cmsId="mobile-sticky-book-now"
          text={cmsData?.['mobile-sticky-book-now'] || 'Book Now'}
        />
      </Link>
    </StickyButtonContainer>
  );
};
