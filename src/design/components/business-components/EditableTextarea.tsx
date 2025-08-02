import React from 'react';
import { Container, Text } from '@/ui';
import { Stack } from '@/ui';
import { Label } from '@/ui';
import { Textarea } from '@/ui';

interface EditableTextareaProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  spacing?: 'sm' | 'md' | 'lg';
  error?: string;
  required?: boolean;
  name?: string;
}

const EditableTextarea: React.FC<EditableTextareaProps> = ({ 
    label, 
    size = 'md', 
    rows = 3, 
    value, 
    onChange, 
    placeholder, 
    disabled = false,
    spacing = 'md',
    error,
    required = false,
    name
  }) => {
    const fieldId = `editable-textarea-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

    return (
      <Container variant="default" padding="none">
        <Stack direction="vertical" spacing={spacing}>
          {label && (
            <Label htmlFor={fieldId} required={required}>
              {label}
            </Label>
          )}
          
          <Textarea
            id={fieldId}
            name={name}
            size={size === 'xl' ? 'lg' : size}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
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

EditableTextarea.displayName = 'EditableTextarea';

export { EditableTextarea }; 