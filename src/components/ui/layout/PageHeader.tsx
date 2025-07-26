import React from 'react';
import { cn } from '@/lib/utils/utils';

interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'left' | 'center' | 'right';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  className,
  padding = 'lg',
  margin = 'none',
  align = 'left'
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

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <header
      className={cn(
        'w-full',
        paddingClasses[padding],
        marginClasses[margin],
        alignClasses[align],
        className
      )}
    >
      {title && (
        <h1 className="">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="">
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
};

PageHeader.displayName = 'PageHeader'; 