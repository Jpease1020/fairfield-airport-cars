import React from 'react';

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

  const classes = [
    baseClasses,
    sizeClasses[size],
    error ? 'form-input-error' : '',
    fullWidth ? 'w-full' : '',
    icon ? 'form-input-with-icon' : '',
    iconPosition === 'right' ? 'form-input-icon-right' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="form-input-wrapper">
      {icon && iconPosition === 'left' && (
        <span className="form-input-icon form-input-icon-left">{icon}</span>
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
        className={classes}
      />
      {icon && iconPosition === 'right' && (
        <span className="form-input-icon form-input-icon-right">{icon}</span>
      )}
      {error && errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
    </div>
  );
}; 