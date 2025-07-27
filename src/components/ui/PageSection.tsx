import React from 'react';

// PageSection Component - BULLETPROOF TYPE SAFETY!
interface PageSectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'stats' | 'activity' | 'actions' | 'full-width';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'elevated' | 'muted';
  theme?: 'light' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  variant = 'default',
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