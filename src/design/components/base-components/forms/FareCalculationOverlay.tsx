'use client';

import React from 'react';
import styled from 'styled-components';
import { LoadingSpinner } from '../notifications/LoadingSpinner';
import { Text } from '../text/Text';
import { colors, spacing } from '../../../system/tokens/tokens';

const OverlayContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.background.overlay};
  backdrop-filter: blur(2px);
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 999;
  border-radius: inherit;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md};
  padding: ${spacing.xl};
  background-color: ${colors.background.primary};
  border-radius: ${spacing.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

interface FareCalculationOverlayProps {
  isCalculating: boolean;
  message?: string;
}

export const FareCalculationOverlay: React.FC<FareCalculationOverlayProps> = ({
  isCalculating,
  message = 'Getting your rate...'
}) => {
  if (!isCalculating) {
    return null;
  }

  return (
    <OverlayContainer isVisible={isCalculating} role="status" aria-live="polite">
      <LoadingContent>
        <LoadingSpinner size="lg" variant="spinner" />
        <Text size="md" weight="semibold" color="primary">
          {message}
        </Text>
      </LoadingContent>
    </OverlayContainer>
  );
};

