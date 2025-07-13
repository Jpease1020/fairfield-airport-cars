import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
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
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const iconClasses = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
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
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            <div className="text-sm">
              {children}
            </div>
          </div>
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className={cn(
                'ml-3 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                iconClasses[variant]
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert }; 