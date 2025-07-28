import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';

// Styled loading spinner container
const LoadingSpinnerContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'centered'].includes(prop)
})<{
  variant: 'spinner' | 'dots' | 'pulse';
  size: 'sm' | 'md' | 'lg' | 'xl';
  centered: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  transition: ${transitions.default};

  /* Centered styles */
  ${({ centered }) => centered && `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
          gap: ${spacing.xs};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
          gap: ${spacing.sm};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
          gap: ${spacing.md};
        `;
      case 'xl':
        return `
          font-size: ${fontSize.xl};
          gap: ${spacing.lg};
        `;
      default:
        return `
          font-size: ${fontSize.md};
          gap: ${spacing.sm};
        `;
    }
  }}
`;

// Styled dots container
const DotsContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          gap: 0.125rem;
        `;
      case 'md':
        return `
          gap: 0.25rem;
        `;
      case 'lg':
        return `
          gap: 0.375rem;
        `;
      case 'xl':
        return `
          gap: 0.5rem;
        `;
      default:
        return `
          gap: 0.25rem;
        `;
    }
  }}
`;

// Styled dot
const Dot = styled.span.withConfig({
  shouldForwardProp: (prop) => !['size', 'delay'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg' | 'xl';
  delay: number;
}>`
  display: inline-block;
  color: ${colors.text.secondary};
  animation: dotPulse 1.5s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;

  @keyframes dotPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
        `;
      case 'xl':
        return `
          font-size: ${fontSize.xl};
        `;
      default:
        return `
          font-size: ${fontSize.md};
        `;
    }
  }}
`;

// Styled pulse container
const PulseContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
        `;
      case 'xl':
        return `
          font-size: ${fontSize.xl};
        `;
      default:
        return `
          font-size: ${fontSize.md};
        `;
    }
  }}
`;

// Styled text container
const TextContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg' | 'xl';
}>`
  color: ${colors.text.secondary};
  margin-left: ${spacing.sm};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
        `;
      case 'xl':
        return `
          font-size: ${fontSize.xl};
        `;
      default:
        return `
          font-size: ${fontSize.md};
        `;
    }
  }}
`;

export interface LoadingSpinnerProps {
  // Core props
  children?: React.ReactNode;
  
  // Appearance
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Content
  text?: string;
  
  // Layout
  centered?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  // Core props
  children,
  
  // Appearance
  variant = 'spinner',
  size = 'md',
  
  // Content
  text,
  
  // Layout
  centered = false,
  
  // Accessibility
  'aria-label': ariaLabel = 'Loading...',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsContainer size={size}>
            {[...Array(3)].map((_, i) => (
              <Dot key={i} size={size} delay={i * 0.2}>
                •
              </Dot>
            ))}
          </DotsContainer>
        );

      case 'pulse':
        return (
          <PulseContainer size={size}>
            ●
          </PulseContainer>
        );

      default:
        return (
          <PulseContainer size={size}>
            ○
          </PulseContainer>
        );
    }
  };

  return (
    <LoadingSpinnerContainer
      id={id}
      variant={variant}
      size={size}
      centered={centered}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      {...rest}
    >
      {renderSpinner()}
      
      {text && (
        <TextContainer size={size}>
          {text}
        </TextContainer>
      )}
      
      {children}
    </LoadingSpinnerContainer>
  );
}; 