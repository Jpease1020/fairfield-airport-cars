'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';

// Styled Textarea component
const StyledTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => !['size', 'error', 'disabled', 'fullWidth'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  error: boolean;
  disabled: boolean;
  fullWidth?: boolean;
}>`
  display: block;
  width: 100%;
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${({ disabled }) => (disabled ? colors.background.disabled : colors.background.primary)};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  resize: vertical;
  min-height: 3em;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
    }
  }}

  /* Focus styles */
  &:focus {
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    box-shadow: ${shadows.error};
  `}
`;

// Textarea Component
export interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  name?: string;
  id?: string;
  required?: boolean;
  [key: string]: any;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  size = 'md',
  rows = 3,
  name,
  id,
  required = false,
  ...rest
}) => {
  return (
    <StyledTextarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      name={name}
      id={id}
      required={required}
      size={size}
      error={error}
      aria-invalid={error}
      {...rest}
    />
  );
}; 
