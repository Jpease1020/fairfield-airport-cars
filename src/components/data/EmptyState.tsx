import * as React from 'react';
import { cn } from '@/lib/utils/utils';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: {
        container: 'py-8',
        icon: 'w-8 h-8',
        title: 'text-lg',
        description: 'text-sm',
      },
      md: {
        container: 'py-12',
        icon: 'w-12 h-12',
        title: 'text-xl',
        description: 'text-base',
      },
      lg: {
        container: 'py-16',
        icon: 'w-16 h-16',
        title: 'text-2xl',
        description: 'text-lg',
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeClasses[size].container,
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn('text-text-muted mb-4', sizeClasses[size].icon)}>
            {icon}
          </div>
        )}
        {title && (
          <h3 className={cn('font-medium text-text-primary mb-2', sizeClasses[size].title)}>
            {title}
          </h3>
        )}
        {description && (
          <p className={cn('text-text-secondary mb-6 max-w-sm', sizeClasses[size].description)}>
            {description}
          </p>
        )}
        {action && (
          <div className="flex items-center justify-center">
            {action}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState }; 