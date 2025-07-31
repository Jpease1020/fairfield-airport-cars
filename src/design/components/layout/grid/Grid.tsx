'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing } from '../../../system/tokens/tokens';
import { Text, H2, Container } from '@/design/ui';
import { ResponsiveValue, Breakpoint } from '../shared-types';

// Helper function to resolve responsive values
const resolveResponsiveValue = <T,>(value: ResponsiveValue<T>, breakpoint: Breakpoint = 'xs'): T => {
  if (typeof value === 'object' && value !== null) {
    return (value as Partial<Record<Breakpoint, T>>)[breakpoint] || 
           (value as Partial<Record<Breakpoint, T>>).xs || 
           Object.values(value as Partial<Record<Breakpoint, T>>)[0] as T;
  }
  return value as T;
};

// Grid system components
interface GridProps {
  children: React.ReactNode;
  cols?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 12>;
  gap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;
  responsive?: boolean;
  margin?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  marginTop?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  marginBottom?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  as?: 'div' | 'section' | 'article';
}

const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols', 'gap', 'responsive', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  cols: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 12>;
  gap: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;
  responsive: boolean;
  margin: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  marginTop: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  marginBottom: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
}>`
  display: grid;
  grid-template-columns: ${({ cols, responsive }) => {
    if (responsive) {
      return `repeat(auto-fit, minmax(300px, 1fr))`;
    }
    const resolvedCols = resolveResponsiveValue(cols);
    return `repeat(${resolvedCols}, 1fr)`;
  }};
  gap: ${({ gap }) => {
    const resolvedGap = resolveResponsiveValue(gap);
    return resolvedGap === 'none' ? '0' : spacing[resolvedGap as keyof typeof spacing];
  }};
  margin: ${({ margin }) => {
    const resolvedMargin = resolveResponsiveValue(margin);
    return resolvedMargin === 'none' ? '0' : spacing[resolvedMargin as keyof typeof spacing];
  }};
  margin-top: ${({ marginTop }) => {
    const resolvedMarginTop = resolveResponsiveValue(marginTop);
    return resolvedMarginTop === 'none' ? '0' : spacing[resolvedMarginTop as keyof typeof spacing];
  }};
  margin-bottom: ${({ marginBottom }) => {
    const resolvedMarginBottom = resolveResponsiveValue(marginBottom);
    return resolvedMarginBottom === 'none' ? '0' : spacing[resolvedMarginBottom as keyof typeof spacing];
  }};
  
  /* Responsive breakpoints for better mobile experience */
  @media (max-width: 1024px) {
    grid-template-columns: ${({ responsive, cols }) => {
      if (responsive) {
        return `repeat(auto-fit, minmax(280px, 1fr))`;
      }
      const resolvedCols = resolveResponsiveValue(cols, 'lg');
      return `repeat(${resolvedCols}, 1fr)`;
    }};
  }
  
  @media (max-width: 768px) {
    grid-template-columns: ${({ responsive, cols }) => {
      if (responsive) {
        return `repeat(auto-fit, minmax(250px, 1fr))`;
      }
      const resolvedCols = resolveResponsiveValue(cols, 'md');
      return `repeat(${resolvedCols}, 1fr)`;
    }};
    gap: ${({ gap }) => {
      const resolvedGap = resolveResponsiveValue(gap, 'md');
      return resolvedGap === 'none' ? '0' : spacing.sm;
    }};
  }
  
  @media (max-width: 640px) {
    grid-template-columns: ${({ responsive, cols }) => {
      if (responsive) {
        return `1fr`;
      }
      const resolvedCols = resolveResponsiveValue(cols, 'sm');
      return `repeat(${resolvedCols}, 1fr)`;
    }};
    gap: ${({ gap }) => {
      const resolvedGap = resolveResponsiveValue(gap, 'sm');
      return resolvedGap === 'none' ? '0' : spacing.md;
    }};
  }
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