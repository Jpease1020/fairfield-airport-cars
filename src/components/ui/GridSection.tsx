import React from 'react';
import { Section, Container } from '@/components/ui';

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
    'grid-section',
    `grid-section-${variant}`,
    `grid-section-${spacing}`,
    theme === 'dark' ? 'grid-section-dark' : 'grid-section-light',
    className
  ].filter(Boolean).join(' ');

  const gridClass = [
    'grid-container',
    `grid-columns-${columns}`,
    `grid-spacing-${spacing}`
  ].filter(Boolean).join(' ');

  return (
    <Section>
      <Container>
        {children}
      </Container>
    </Section>
  );
}; 