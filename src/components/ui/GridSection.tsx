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
}) => {

  return (
    <Section>
      <Container>
        {children}
      </Container>
    </Section>
  );
}; 