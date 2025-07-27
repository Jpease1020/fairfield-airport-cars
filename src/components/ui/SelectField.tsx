import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Select, Option, Text, Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// SelectField Component - BULLETPROOF TYPE SAFETY!
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
    variant = 'default' 
  }) => {
    const fieldId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Container>
        <Stack spacing="sm">
          <Label htmlFor={fieldId}>
            {label}
            {required && <Span color="error">*</Span>}
          </Label>
          <Select
            id={fieldId}
            variant={error ? 'error' : variant}
            size={size}
            value={value}
            onChange={onChange}
            disabled={disabled}
          >
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
            <Text color="error" size="sm">{error}</Text>
          )}
          {helperText && !error && (
            <Text color="muted" size="sm">{helperText}</Text>
          )}
        </Stack>
      </Container>
    );
  };
SelectField.displayName = 'SelectField';

export { SelectField }; 