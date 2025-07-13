import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, variant = 'default', size = 'md', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // Auto-detect variant based on status
    const getVariant = (status: string): keyof typeof variantClasses => {
      const statusLower = status.toLowerCase();
      if (['confirmed', 'success', 'completed', 'active'].includes(statusLower)) {
        return 'success';
      }
      if (['pending', 'warning', 'processing'].includes(statusLower)) {
        return 'warning';
      }
      if (['cancelled', 'error', 'failed', 'inactive'].includes(statusLower)) {
        return 'error';
      }
      if (['info', 'information'].includes(statusLower)) {
        return 'info';
      }
      return 'default';
    };

    const autoVariant = getVariant(status);
    const finalVariant = variant === 'default' ? autoVariant : variant;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          variantClasses[finalVariant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {status}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge }; 