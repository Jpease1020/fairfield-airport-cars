
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover',
        destructive: 'bg-error text-text-inverse hover:bg-error-hover',
        outline: 'border border-border-primary bg-bg-primary hover:bg-bg-secondary hover:text-text-primary',
        secondary: 'bg-bg-secondary text-text-primary hover:bg-bg-muted',
        ghost: 'hover:bg-bg-secondary hover:text-text-primary',
        link: 'text-brand-primary underline-offset-4 hover:underline',
        success: 'bg-success text-text-inverse hover:bg-success-hover',
        warning: 'bg-warning text-text-inverse hover:bg-warning-hover',
        info: 'bg-info text-text-inverse hover:bg-info-hover',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * A flexible button component with multiple variants, sizes, and states
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // With variant and size
 * <Button variant="outline" size="lg" onClick={handleClick}>
 *   Large Outline Button
 * </Button>
 * 
 * // Loading state
 * <Button loading disabled>
 *   Processing...
 * </Button>
 * 
 * // Icon button
 * <Button variant="ghost" size="icon" aria-label="Close">
 *   <X className="h-4 w-4" />
 * </Button>
 * ```
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** The loading spinner component to show when loading */
  loadingSpinner?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, loadingSpinner, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && loadingSpinner ? (
          <div className="flex items-center gap-2">
            {loadingSpinner}
            {children}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
