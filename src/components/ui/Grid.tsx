import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: number;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  spacing = 'md',
  className = '',
}) => {
  const baseClasses = 'grid-container';
  const columnClasses = {
    1: 'grid-columns-1',
    2: 'grid-columns-2',
    3: 'grid-columns-3',
    4: 'grid-columns-4',
    6: 'grid-columns-6',
  };
  const spacingClasses = {
    sm: 'grid-spacing-sm',
    md: 'grid-spacing-md',
    lg: 'grid-spacing-lg',
    xl: 'grid-spacing-xl',
  };

  const classes = [
    baseClasses,
    columnClasses[columns],
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  className = '',
  span = 1,
}) => {
  const classes = [
    'grid-item',
    `grid-item-span-${span}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}; 