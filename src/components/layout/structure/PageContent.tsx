import React from 'react';
import { cn } from '@/lib/utils/utils';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className,
  padding = 'lg',
  margin = 'none'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const marginClasses = {
    none: '',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12'
  };

  return (
    <div
      className={cn(
        'w-full flex-1',
        paddingClasses[padding],
        marginClasses[margin],
        className
      )}
    >
      {children}
    </div>
  );
};

PageContent.displayName = 'PageContent'; 