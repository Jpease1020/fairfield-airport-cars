import React from 'react';
import { Container, Span } from '@/components/ui';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'datetime-local' | 'date' | 'time' | 'file' | 'color' | 'range' | 'checkbox';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  checked,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  name,
  id,
  error = false,
  errorMessage,
  icon,
  iconPosition = 'left',
}) => {

  return (
    <Container>
      {icon && iconPosition === 'left' && (
        <Span>{icon}</Span>
      )}
      <input
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
      />
      {icon && iconPosition === 'right' && (
        <Span>{icon}</Span>
      )}
      {error && errorMessage && (
        <Container>{errorMessage}</Container>
      )}
    </Container>
  );
}; 