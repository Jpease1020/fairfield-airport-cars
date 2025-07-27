import React from 'react';
import { Container } from '@/components/ui';

export interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface GridItemProps {
  children: React.ReactNode;
  span?: number;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  spacing = 'md',
}) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
}) => {
  return (
    <Container>
      {children}
    </Container>
  );
}; 