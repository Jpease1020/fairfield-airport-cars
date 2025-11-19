'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize } from '../../../system/tokens/tokens';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: ${spacing.xs};
  font-size: ${fontSize.xs};
  color: ${colors.success[600]};
  min-height: 16px;
`;

const CheckmarkIcon = styled.svg`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

interface FieldValidationStatusProps {
  isValid: boolean;
  show?: boolean;
}

export const FieldValidationStatus: React.FC<FieldValidationStatusProps> = ({
  isValid,
  show = false
}) => {
  if (!show || !isValid) {
    return null;
  }

  return (
    <StatusContainer role="status" aria-label="Field is valid">
      <CheckmarkIcon
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          fill="currentColor"
        />
      </CheckmarkIcon>
      <span>Valid</span>
    </StatusContainer>
  );
};

