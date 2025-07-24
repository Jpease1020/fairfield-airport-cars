import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
    ...props 
  }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <ErrorBoundary fallback={errorFallback}>
        <div className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium text-text-primary">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </Label>
          <Input
            ref={ref}
            id={fieldId}
            className={cn(
              error && 'border-error focus-visible:ring-error',
              className
            )}
            error={error}
            helperText={helperText}
            required={required}
            {...props}
          />
        </div>
      </ErrorBoundary>
    );
  }
);
FormFieldComponent.displayName = 'FormField';

// Memoize the component for better performance
const FormField = React.memo(FormFieldComponent);

export { FormField }; 