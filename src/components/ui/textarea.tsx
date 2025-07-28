import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled textarea component with proper prop filtering
const StyledTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
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
  resize: vertical;
  min-height: 80px;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          line-height: 1.4;
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          line-height: 1.5;
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          line-height: 1.6;
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          line-height: 1.5;
        `;
    }
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

  /* Resize handle styles */
  &::-webkit-resizer {
    border-width: 8px;
    border-style: solid;
    border-color: transparent ${colors.border.default} ${colors.border.default} transparent;
  }
`;

// Styled container for textarea
const TextareaContainer = styled.div<{ fullWidth: boolean }>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

// Styled error message
const ErrorMessage = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: block;
`;

export interface TextareaProps {
  // Core props
  children?: React.ReactNode;
  
  // Textarea attributes
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  
  // Events
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  
  // States
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // HTML attributes
  name?: string;
  id?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  wrap?: 'soft' | 'hard';
  
  // Rest props
  [key: string]: any;
}

export const Textarea: React.FC<TextareaProps> = ({
  // Core props
  children,
  
  // Textarea attributes
  placeholder,
  value,
  defaultValue,
  
  // Events
  onChange,
  onBlur,
  onFocus,
  onKeyPress,
  
  // States
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  
  // Appearance
  size = 'md',
  fullWidth = false,
  
  // HTML attributes
  name,
  id,
  rows = 4,
  cols,
  maxLength,
  minLength,
  autoFocus,
  readOnly,
  wrap,
  
  // Rest props
  ...rest
}) => {
  return (
    <TextareaContainer fullWidth={fullWidth}>
      <StyledTextarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyPress={onKeyPress}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        minLength={minLength}
        autoFocus={autoFocus}
        readOnly={readOnly}
        wrap={wrap}
        size={size}
        fullWidth={fullWidth}
        error={error}
        aria-invalid={error}
        aria-describedby={error && errorMessage ? `${id}-error` : undefined}
        {...rest}
      />
      {error && errorMessage && (
        <ErrorMessage 
          id={id ? `${id}-error` : undefined}
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </ErrorMessage>
      )}
    </TextareaContainer>
  );
}; 