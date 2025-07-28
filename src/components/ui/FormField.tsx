import * as React from 'react';
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Container, Span, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

interface FormFieldProps {
  /** The label text for the field */
  label: string;
  /** Error message to display below the field */
  error?: string;
  /** Helper text to display below the field */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Container spacing */
  spacing?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Field name */
  name?: string;
  /** Custom error boundary fallback */
  errorFallback?: ReactNode;
}

const FormFieldComponent: React.FC<FormFieldProps> = ({ 
    label, 
    error, 
    helperText,
    required = false,
    type = 'text',
    value,
    placeholder,
    onChange,
    size = 'md',
    spacing = 'md',
    disabled = false,
    name,
    errorFallback
  }) => {
    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <ErrorBoundary fallback={errorFallback}>
        <Container variant="default" padding="none">
          <Stack direction="vertical" spacing={spacing}>
            <Label htmlFor={fieldId} required={required}>
              {label}
              {required && <Span> *</Span>}
            </Label>
            
            <Input
              id={fieldId}
              size={size}
              required={required}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              disabled={disabled}
              name={name}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={
                error ? `${fieldId}-error` : 
                helperText ? `${fieldId}-help` : 
                undefined
              }
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
      </ErrorBoundary>
    );
  };

FormFieldComponent.displayName = 'FormField';

// Memoize the component for better performance
const FormField = React.memo(FormFieldComponent);

export { FormField }; 