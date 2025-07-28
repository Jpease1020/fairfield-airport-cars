import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Select, Option, Text, Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error';
  placeholder?: string;
  name?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
    label, 
    options, 
    error, 
    helperText, 
    required = false, 
    value, 
    onChange, 
    disabled = false, 
    size = 'md', 
    variant = 'default',
    placeholder,
    name
  }) => {
    const fieldId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Container variant="default" padding="none">
        <Stack direction="vertical" spacing="sm">
          <Label htmlFor={fieldId} required={required}>
            {label}
            {required && <Span> *</Span>}
          </Label>
          
          <Select
            id={fieldId}
            name={name}
            variant={error ? 'error' : variant}
            size={size}
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined}
          >
            {placeholder && (
              <Option value="" disabled>
                {placeholder}
              </Option>
            )}
            {options.map((option) => (
              <Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </Option>
            ))}
          </Select>
          
          {error && (
            <Text 
              id={`${fieldId}-error`}
              variant="body" 
              size="sm"
            >
              {error}
            </Text>
          )}
          
          {helperText && !error && (
            <Text 
              id={`${fieldId}-help`}
              variant="muted" 
              size="sm"
            >
              {helperText}
            </Text>
          )}
        </Stack>
      </Container>
    );
  };

SelectField.displayName = 'SelectField';

export { SelectField }; 