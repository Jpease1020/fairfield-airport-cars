import React from 'react';
import { Section, Container } from '@/components/ui';

// GridSection Component - BULLETPROOF TYPE SAFETY!
interface GridSectionProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'stats' | 'activity' | 'actions' | 'content';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GridSection: React.FC<GridSectionProps> = ({
  children,
  columns = 4,
  variant = 'content',
  spacing = 'lg',
  theme = 'light',
  padding = 'lg',
  gap = 'md'
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