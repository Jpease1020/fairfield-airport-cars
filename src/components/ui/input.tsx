'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled input component with proper prop filtering
const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'hasLeftIcon', 'hasRightIcon'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
}>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${colors.background.primary};
  color: ${colors.text.primary};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;

  /* Size styles */
  ${({ size, hasLeftIcon, hasRightIcon }) => {
    const basePadding = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md;
    const iconPadding = '1.5rem';
    
    return `
      padding: ${basePadding};
      font-size: ${size === 'sm' ? fontSize.sm : size === 'lg' ? fontSize.lg : fontSize.md};
      height: ${size === 'sm' ? '2rem' : size === 'lg' ? '3rem' : '2.5rem'};
      padding-left: ${hasLeftIcon ? `calc(${basePadding} + ${iconPadding})` : basePadding};
      padding-right: ${hasRightIcon ? `calc(${basePadding} + ${iconPadding})` : basePadding};
    `;
  }}

  /* Focus styles */
  &:focus {
    border-color: ${({ error }) => (error ? colors.border.error : colors.primary[600])};
    box-shadow: ${({ error }) => (error ? shadows.error : shadows.focus)};
  }

  /* Disabled styles */
  &:disabled {
    background-color: ${colors.background.disabled};
    color: ${colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Placeholder styles */
  &::placeholder {
    color: ${colors.text.secondary};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    
    &:focus {
      border-color: ${colors.border.error};
      box-shadow: ${shadows.error};
    }
  `}
`;

// Styled container for icon positioning
const InputContainer = styled.div<{ fullWidth: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

// Styled icon wrapper
const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  position: absolute;
  color: ${colors.text.secondary};
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  ${({ position }) => position === 'left' ? 'left' : 'right'}: ${spacing.md};
`;

// Styled error message
const ErrorMessage = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: block;
`;

export interface InputProps {
  // Core props
  children?: React.ReactNode;
  
  // Input attributes
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'datetime-local' | 'date' | 'time' | 'file' | 'color' | 'range' | 'checkbox';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  checked?: boolean;
  
  // Events
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  
  // States
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // Icons
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // HTML attributes
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  title?: string;
  
  // Rest props
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  // Core props
  children,
  
  // Input attributes
  type = 'text',
  placeholder,
  value,
  defaultValue,
  checked,
  
  // Events
  onChange,
  onBlur,
  onFocus,
  
  // States
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  
  // Appearance
  size = 'md',
  fullWidth = false,
  
  // Icons
  icon,
  iconPosition = 'left',
  
  // HTML attributes
  name,
  id,
  autoComplete,
  autoFocus,
  readOnly,
  maxLength,
  minLength,
  pattern,
  title,
  
  // Rest props
  ...rest
}) => {
  const hasLeftIcon = Boolean(icon && iconPosition === 'left');
  const hasRightIcon = Boolean(icon && iconPosition === 'right');

  return (
    <InputContainer fullWidth={fullWidth}>
      {hasLeftIcon && (
        <IconWrapper position="left" aria-hidden="true">
          {icon}
        </IconWrapper>
      )}
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        title={title}
        size={size}
        fullWidth={fullWidth}
        error={error}
        hasLeftIcon={hasLeftIcon}
        hasRightIcon={hasRightIcon}
        aria-invalid={error}
        aria-describedby={error && errorMessage ? `${id}-error` : undefined}
        {...rest}
      />
      {hasRightIcon && (
        <IconWrapper position="right" aria-hidden="true">
          {icon}
        </IconWrapper>
      )}
      {error && errorMessage && (
        <ErrorMessage 
          id={id ? `${id}-error` : undefined}
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </ErrorMessage>
      )}
    </InputContainer>
  );
}; 