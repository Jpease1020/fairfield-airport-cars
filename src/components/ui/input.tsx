import React from 'react';
import { Container } from '@/components/ui';

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
  className?: string;
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
  className = '',
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
}) => {
  const baseClasses = 'form-input';
  const sizeClasses = {
    sm: 'form-input-sm',
    md: 'form-input-md',
    lg: 'form-input-lg',
  };



  return (
    <Container>
      {icon && iconPosition === 'left' && (
        <span>{icon}</span>
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
        <span>{icon}</span>
      )}
      {error && errorMessage && (
        <Container>{errorMessage}</Container>
      )}
    </Container>
  );
}; 