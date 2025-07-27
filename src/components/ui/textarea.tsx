import React from 'react';

export interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
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
  disabled = false,
  required = false,
  name,
  id,
  className = '',
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
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="form-textarea-wrapper">
      <textarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className={classes}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        minLength={minLength}
        autoFocus={autoFocus}
      />
      {error && errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
    </div>
  );
}; 