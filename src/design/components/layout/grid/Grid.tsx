'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing } from '../../../system/tokens/tokens';
import { Text, H2, Container } from '@/design/ui';

// Grid system components
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'section' | 'article';
}

const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols', 'gap', 'responsive', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  cols: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive: boolean;
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  display: grid;
  grid-template-columns: ${({ cols, responsive }) => {
    if (responsive) {
      return `repeat(auto-fit, minmax(250px, 1fr))`;
    }
    return `repeat(${cols}, 1fr)`;
  }};
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
  margin: ${({ margin }) => margin === 'none' ? '0' : spacing[margin as keyof typeof spacing]};
  margin-top: ${({ marginTop }) => marginTop === 'none' ? '0' : spacing[marginTop as keyof typeof spacing]};
  margin-bottom: ${({ marginBottom }) => marginBottom === 'none' ? '0' : spacing[marginBottom as keyof typeof spacing]};
`;

const GridComponent: React.FC<GridProps> = ({ 
  cols = 3, 
  gap = 'md', 
  responsive = false,
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  as: Component = 'div',
  children
}) => {
  return (
    <Grid
      cols={cols}
      gap={gap}
      responsive={responsive}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      as={Component}
    >
      {children}
    </Grid>
  );
};

// GridSection component
interface GridSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'content' | 'default' | 'actions' | 'stats';
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'section' | 'div' | 'article';
}

const GridSectionContainer = styled.section.withConfig({
  shouldForwardProp: (prop) => !['padding', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  padding: ${({ padding }) => padding === 'none' ? '0' : spacing[padding as keyof typeof spacing]};
  margin: ${({ margin }) => margin === 'none' ? '0' : spacing[margin as keyof typeof spacing]};
  margin-top: ${({ marginTop }) => marginTop === 'none' ? '0' : spacing[marginTop as keyof typeof spacing]};
  margin-bottom: ${({ marginBottom }) => marginBottom === 'none' ? '0' : spacing[marginBottom as keyof typeof spacing]};
`;

const GridSection: React.FC<GridSectionProps> = ({ 
  children,
  title,
  subtitle,
  cols = 3,
  columns,
  gap = 'md',
  responsive = false,
  padding = 'lg',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  as: Component = 'section'
}) => {
  return (
    <GridSectionContainer
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      as={Component}
    >
      {(title || subtitle) && (
        <Container variant="default" padding="none" margin="none" marginBottom="lg">
          {title && <H2 size="lg">{title}</H2>}
          {subtitle && <Text variant="muted" size="sm">{subtitle}</Text>}
        </Container>
      )}
      <GridComponent
        cols={columns || cols}
        gap={gap}
        responsive={responsive}
      >
        {children}
      </GridComponent>
    </GridSectionContainer>
  );
};

// GridItem component
interface GridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

const GridItemContainer = styled.div<{ $span: number }>`
  grid-column: span ${({ $span }) => $span};
  min-width: 0; // Prevent overflow
`;

const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  span = 1
}) => {
  return (
    <GridItemContainer $span={span}>
      {children}
    </GridItemContainer>
  );
};

export { GridComponent as Grid, GridSection, GridItem };
export type { GridItemProps }; 