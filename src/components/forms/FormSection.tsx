import * as React from 'react';
import { cn } from '@/lib/utils/utils';

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  columns?: number;
  children: React.ReactNode;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, columns, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4 p-6 border border-border-primary rounded-lg bg-bg-primary', className)}
        {...props}
      >
        <div>
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
        <div className={cn('space-y-4', columns && `grid grid-cols-1 md:grid-cols-${columns} gap-4`)}>
          {children}
        </div>
      </div>
    );
  }
);
FormSection.displayName = 'FormSection';

export { FormSection }; 