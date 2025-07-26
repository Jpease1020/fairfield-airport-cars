
import * as React from 'react';
import { cn } from '@/lib/utils/utils';

/**
 * A flexible input component with enhanced accessibility and validation states
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Input placeholder="Enter your name" />
 * 
 * // With label and error
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Please enter a valid email"
 *   required
 * />
 * 
 * // With helper text
 * <Input
 *   label="Password"
 *   type="password"
 *   helperText="Must be at least 8 characters"
 * />
 * ```
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The label text for the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
  /** The ID for the input element */
  id?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    helperText,
    required = false,
    id,
    'aria-describedby': ariaDescribedby,
    ...props 
  }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedby, errorId, helperId].filter(Boolean).join(' ');

    return (
      <div className="">
        {label && (
          <label 
            htmlFor={inputId}
            className=""
          >
            {label}
            {required && <span className="">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:ring-error',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
