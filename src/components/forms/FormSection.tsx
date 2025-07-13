import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, children, title, description, columns = 1, ...props }, ref) => {
    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
        <div className={cn('grid gap-4', gridClasses[columns])}>
          {children}
        </div>
      </div>
    );
  }
);
FormSection.displayName = 'FormSection';

export { FormSection }; 