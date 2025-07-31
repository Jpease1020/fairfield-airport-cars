'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize } from '../../system/tokens/tokens';

// Consolidated styled components
const StyledFormField = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: 100%;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `gap: ${spacing.xs};`;
      case 'md':
        return `gap: ${spacing.sm};`;
      case 'lg':
        return `gap: ${spacing.md};`;
      default:
        return `gap: ${spacing.sm};`;
    }
  }}
`;

const StyledLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: block;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  }};
`;

const StyledMessage = styled.div<{ $isError: boolean }>`
  color: ${({ $isError }) => $isError ? colors.danger[600] : colors.text.secondary};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const StyledRequired = styled.span`
  color: ${colors.danger[600]};
`;

// FormField Component
export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  ...rest
}) => {
  return (
    <StyledFormField size={size} {...rest}>
      {label && (
        <StyledLabel size={size}>
          {label}
          {required && <StyledRequired> *</StyledRequired>}
        </StyledLabel>
      )}
      {children}
      {error && (
        <StyledMessage $isError={true} role="alert">
          {error}
        </StyledMessage>
      )}
      {helperText && !error && (
        <StyledMessage $isError={false}>
          {helperText}
        </StyledMessage>
      )}
    </StyledFormField>
  );
}; 