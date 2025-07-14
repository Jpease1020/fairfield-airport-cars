import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth = 'full', padding = 'md', children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6 py-6 sm:py-8 md:py-10',
      lg: 'p-8 py-8 sm:py-10 md:py-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-background',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          'mx-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';

export { PageContainer }; 