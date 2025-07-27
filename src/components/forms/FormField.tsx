import * as React from 'react';
import { cn } from '@/lib/utils/utils';
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
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The label text for the field */
  label: string;
  /** Error message to display below the field */
  error?: string;
  /** Helper text to display below the field */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom error boundary fallback */
  errorFallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

const FormFieldComponent = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    required = false, 
    id, 
    errorFallback,
    type,
    ...props 
  }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <ErrorBoundary fallback={errorFallback}>
        <Container className="">
          <Label htmlFor={fieldId} className="">
            {label}
            {required && <Span className="">*</Span>}
          </Label>
          <Input
            id={fieldId}
            className={cn(
              error && 'border-error focus-visible:ring-error',
              className
            )}
            required={required}
            type={type as any}
            placeholder={props.placeholder}
            value={props.value as string}
            onChange={props.onChange}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            disabled={props.disabled}
            name={props.name}
          />
        </Container>
      </ErrorBoundary>
    );
  }
);
FormFieldComponent.displayName = 'FormField';

// Memoize the component for better performance
const FormField = React.memo(FormFieldComponent);

export { FormField }; 