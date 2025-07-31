'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, spacing, fontSize } from '../../system/tokens/tokens';

// Animation keyframes
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`;

// Styled loading components
const StyledLoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'centered'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg' | 'xl';
  centered: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  gap: ${({ size }) => {
    switch (size) {
      case 'sm': return spacing.xs;
      case 'md': return spacing.sm;
      case 'lg': return spacing.md;
      case 'xl': return spacing.lg;
      default: return spacing.sm;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      case 'xl': return fontSize.xl;
      default: return fontSize.md;
    }
  }};
  ${({ centered }) => centered && `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
`;

const StyledSpinner = styled.span`
  animation: ${spin} 1s linear infinite;
`;

const StyledPulse = styled.span`
  animation: ${pulse} 2s ease-in-out infinite;
`;

const StyledDots = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

const StyledDot = styled.span.withConfig({
  shouldForwardProp: (prop) => !['delay'].includes(prop)
})<{
  delay: number;
}>`
  animation: ${dotPulse} 1.5s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const StyledText = styled.span`
  margin-left: ${spacing.sm};
`;

export interface LoadingSpinnerProps {
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  centered?: boolean;
  'aria-label'?: string;
  id?: string;
  [key: string]: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  centered = false,
  'aria-label': ariaLabel = 'Loading...',
  id,
  ...rest
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <StyledDots>
            {[...Array(3)].map((_, i) => (
              <StyledDot key={i} delay={i * 0.2}>
                •
              </StyledDot>
            ))}
          </StyledDots>
        );

      case 'pulse':
        return (
          <StyledPulse>
            ●
          </StyledPulse>
        );

      default:
        return (
          <StyledSpinner>
            ○
          </StyledSpinner>
        );
    }
  };

  return (
    <StyledLoadingContainer
      id={id}
      size={size}
      centered={centered}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      {...rest}
    >
      {renderSpinner()}
      
      {text && (
        <StyledText>
          {text}
        </StyledText>
      )}
    </StyledLoadingContainer>
  );
}; 