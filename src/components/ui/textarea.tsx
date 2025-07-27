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
  name,
  id,
  rows = 4,
  cols,
  maxLength,
  minLength,
}) => {

  return (
    <Container>
      <textarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        name={name}
        id={id}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        minLength={minLength}
      />
    </Container>
  );
}; 