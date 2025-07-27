import React from 'react';
import { Container } from '@/components/ui';

export interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  autoFocus?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  onKeyPress,
  disabled = false,
  required = false,
  name,
  id,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = false,
  rows = 4,
  cols,
  maxLength,
  minLength,
  autoFocus,
}) => {
  const baseClasses = 'form-textarea';
  const sizeClasses = {
    sm: 'form-textarea-sm',
    md: 'form-textarea-md',
    lg: 'form-textarea-lg',
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    error ? 'form-textarea-error' : '',
    fullWidth ? 'w-full' : '',
  ].filter(Boolean).join(' ');

  return (
    <Container>
      <Container>
        {placeholder}
        {value}
        {defaultValue}
        {name}
        {id}
        {rows}
        {cols}
        {maxLength}
        {minLength}
      </Container>
      {error && errorMessage && (
        <Container>{errorMessage}</Container>
      )}
    </Container>
  );
}; 