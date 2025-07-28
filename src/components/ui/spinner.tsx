'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, transitions } from '@/lib/design-system/tokens';

// Styled spinner component with proper prop filtering
const StyledSpinner = styled.svg.withConfig({
  shouldForwardProp: (prop) => !['size', 'color', 'variant'].includes(prop)
})<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}>`
  animation: spin 1s linear infinite;
  transition: ${transitions.default};
  
  /* Color styles */
  ${({ color, variant }) => {
    if (color) {
      return `color: ${color};`;
    }
    
    switch (variant) {
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      default:
        return `color: currentColor;`;
    }
  }}
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `
          height: 0.75rem;
          width: 0.75rem;
        `;
      case 'sm':
        return `
          height: 1rem;
          width: 1rem;
        `;
      case 'md':
        return `
          height: 1.25rem;
          width: 1.25rem;
        `;
      case 'lg':
        return `
          height: 1.5rem;
          width: 1.5rem;
        `;
      case 'xl':
        return `
          height: 2rem;
          width: 2rem;
        `;
      default:
        return `
          height: 1rem;
          width: 1rem;
        `;
    }
  }}

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Styled spinner container
const SpinnerContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['centered', 'size'].includes(prop)
})<{
  centered: boolean;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${({ centered }) => centered && `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
  
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `padding: ${spacing.xs};`;
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}
`;

const StyledCircle = styled.circle`
  opacity: 0.25;
`;

const StyledPath = styled.path`
  opacity: 0.75;
`;

export interface SpinnerProps {
  // Core props
  children?: React.ReactNode;
  
  // Appearance
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  color?: string;
  
  // Layout
  centered?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const Spinner: React.FC<SpinnerProps> = ({
  // Core props
  children,
  
  // Appearance
  size = 'md',
  variant = 'default',
  color,
  
  // Layout
  centered = false,
  
  // Accessibility
  'aria-label': ariaLabel = 'Loading...',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  return (
    <SpinnerContainer
      id={id}
      centered={centered}
      size={size}
      role="status"
      aria-live="polite"
      {...rest}
    >
      <StyledSpinner
        size={size}
        color={color}
        variant={variant}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={ariaLabel}
      >
        <StyledCircle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <StyledPath 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </StyledSpinner>
      {children}
    </SpinnerContainer>
  );
}; 