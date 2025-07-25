import * as React from 'react';
import { cn } from '@/lib/utils/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in-progress' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size = 'md', ...props }, ref) => {
    const statusClasses = {
      pending: 'bg-warning text-text-inverse',
      confirmed: 'bg-info text-text-inverse',
      completed: 'bg-success text-text-inverse',
      cancelled: 'bg-error text-text-inverse',
      'in-progress': 'bg-brand-secondary text-text-inverse',
      success: 'bg-success text-text-inverse',
      warning: 'bg-warning text-text-inverse',
      error: 'bg-error text-text-inverse',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const getStatusText = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-semibold',
          statusClasses[status],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {getStatusText(status)}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge }; 