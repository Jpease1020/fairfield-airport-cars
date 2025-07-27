import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Container, Span } from '@/components/ui';

/**
 * A form field component that combines label, input, validation, and error handling
 * with enhanced accessibility and performance optimizations
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FormField
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 * 
 * // With validation
 * <FormField
 *   label="Password"
 *   type="password"
 *   required
 *   error="Password must be at least 8 characters"
 *   helperText="Use a strong password"
 * />
 * 
 * // With custom validation
 * <FormField
 *   label="Age"
 *   type="number"
 *   min={18}
 *   max={100}
 *   error={ageError}
 * />
 * ```
 */
// Clean FormField Component - CASCADE EFFECT FORCES COMPLIANCE!
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
  errorFallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

const FormFieldComponent: React.FC<FormFieldProps> = ({ 
    label, 
    error, 
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
        <Container spacing={spacing}>
          <Label htmlFor={fieldId}>
            {label}
            {required && <Span color="error">*</Span>}
          </Label>
          <Input
            id={fieldId}
            error={!!error}
            errorMessage={error}
            size={size}
            required={required}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            name={name}
          />
        </Container>
      </ErrorBoundary>
    );
  };
FormFieldComponent.displayName = 'FormField';

// Memoize the component for better performance
const FormField = React.memo(FormFieldComponent);

export { FormField }; 