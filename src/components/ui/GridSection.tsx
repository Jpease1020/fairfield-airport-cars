import React from 'react';

interface GridSectionProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'stats' | 'activity' | 'actions' | 'content';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark';
}

export const GridSection: React.FC<GridSectionProps> = ({
  children,
  columns = 4,
  variant = 'content',
  spacing = 'lg',
  className = '',
  theme = 'light'
}) => {
  const sectionClass = [
    `${variant}-section`,
    `spacing-${spacing}`,
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  const gridClass = [
    'grid',
    `grid-${columns}`,
    `gap-${spacing}`
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClass}>
      <div className={gridClass}>
        {children}
      </div>
    </section>
  );
}; 