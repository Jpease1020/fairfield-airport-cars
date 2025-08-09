'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';
import { BaseComponentProps } from '../../../system/shared-types';

// Styled Input component
const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
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

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 2rem;
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          height: 3rem;
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
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

// Input Component
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'checkbox' | 'color' | 'datetime-local' | 'date';
  placeholder?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  cmsKeyLabel?: string; // optional, if label is separate we still can map placeholder
  cmsKeyPlaceholder?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  cmsKeyLabel,
  cmsKeyPlaceholder,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement | null>(null);
  // Register placeholder if present (counts as editable copy)
  // useRegisterContent(Boolean(placeholder), { role: 'placeholder', value: placeholder, cmsPath: cmsKeyPlaceholder, element: ref.current });
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
      required={required}
      size={size}
      fullWidth={fullWidth}
      error={error}
      aria-invalid={error}
      ref={ref}
      {...rest}
    />
  );
}; 