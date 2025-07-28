import React from 'react';
import { Input } from '@/components/ui/input';
import { Container, Label, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

interface EditableInputProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'title' | 'subtitle' | 'normal';
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  spacing?: 'sm' | 'md' | 'lg';
  error?: string;
  required?: boolean;
  name?: string;
}

const EditableInput: React.FC<EditableInputProps> = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    disabled = false, 
    type = 'text', 
    spacing = 'md',
    error,
    required = false,
    name
  }) => {
    const fieldId = `editable-input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

    return (
      <Container variant="default" padding="none">
        <Stack direction="vertical" spacing={spacing}>
          {label && (
            <Label htmlFor={fieldId} required={required}>
              {label}
            </Label>
          )}
          
          <Input
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            type={type}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
          
          {error && (
            <Text 
              id={`${fieldId}-error`}
              variant="body" 
              size="sm"
            >
              {error}
            </Text>
          )}
        </Stack>
      </Container>
    );
  };

EditableInput.displayName = 'EditableInput';

export { EditableInput }; 