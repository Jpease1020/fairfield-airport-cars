import * as React from 'react';
import { cn } from '@/lib/utils/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-8', className)}
        {...props}
      >
        <div >
          <div>
            <h1 >{title}</h1>
            {subtitle && (
              <p >{subtitle}</p>
            )}
          </div>
          {children && (
            <div >
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { PageHeader }; 