import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
  text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'default', text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    const variantClasses = {
      default: 'text-gray-600',
      primary: 'text-indigo-600',
      white: 'text-white',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              sizeClasses[size],
              variantClasses[variant]
            )}
          />
          {text && (
            <span className={cn('text-sm', variantClasses[variant])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner }; 