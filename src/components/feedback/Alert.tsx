import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'info', 
    title, 
    children, 
    onClose,
    dismissible = false,
    ...props 
  }, ref) => {
    const variantClasses = {
      success: 'bg-bg-success border-border-success text-text-success',
      error: 'bg-bg-error border-border-error text-text-error',
      warning: 'bg-bg-warning border-border-warning text-text-warning',
      info: 'bg-bg-info border-border-info text-text-info',
    };

    const iconClasses = {
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="">
          <div className="">
            {title && (
              <h4 className="">{title}</h4>
            )}
            <div className="">
              {children}
            </div>
          </div>
          {dismissible && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={cn(
                'ml-3 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                iconClasses[variant]
              )}
            >
              <X className="" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert }; 