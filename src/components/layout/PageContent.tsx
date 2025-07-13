import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, spacing = 'md', children, ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };

    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContent.displayName = 'PageContent';

export { PageContent }; 