import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'stats' | 'activity' | 'actions' | 'full-width';
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'elevated' | 'muted';
  theme?: 'light' | 'dark';
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  variant = 'default',
  className = '',
  spacing = 'lg',
  background = 'default',
  theme = 'light'
}) => {
  const sectionClass = [
    'page-section',
    `page-section-${variant}`,
    `spacing-${spacing}`,
    background !== 'default' ? `bg-${background}` : '',
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClass}>
      {children}
    </section>
  );
}; 