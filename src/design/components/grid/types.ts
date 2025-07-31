import React from 'react';

// Grid System Types - Comprehensive type definitions for flexbox-based grid system

// Responsive breakpoint types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Flex direction types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

// Flex wrap types
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

// Alignment types
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

// Spacing types
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Column span types (1-12 grid system)
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Responsive column spans
export type ResponsiveColSpan = {
  xs?: ColSpan;
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  xl?: ColSpan;
  '2xl'?: ColSpan;
};

// Container max width types
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Grid gap types
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Base component props
export interface BaseGridProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: keyof React.JSX.IntrinsicElements;
  'data-testid'?: string;
}

// Row component props
export interface RowProps extends BaseGridProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  align?: AlignItems;
  justify?: JustifyContent;
  gap?: GridGap;
  padding?: Spacing;
  margin?: Spacing;
  fullWidth?: boolean;
  responsive?: boolean;
}

// Column component props
export interface ColProps extends BaseGridProps {
  span?: ColSpan | ResponsiveColSpan;
  offset?: ColSpan | ResponsiveColSpan;
  align?: AlignItems;
  justify?: JustifyContent;
  padding?: Spacing;
  margin?: Spacing;
  order?: number;
  grow?: boolean;
  shrink?: boolean;
}

// Container component props
export interface ContainerProps extends BaseGridProps {
  maxWidth?: MaxWidth;
  padding?: Spacing;
  margin?: Spacing;
  center?: boolean;
  fluid?: boolean;
}

// Stack component props
export interface StackProps extends BaseGridProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: Spacing;
  align?: AlignItems;
  justify?: JustifyContent;
  wrap?: FlexWrap;
  padding?: Spacing;
  margin?: Spacing;
}

// Grid component props
export interface GridProps extends BaseGridProps {
  cols?: ColSpan;
  gap?: GridGap;
  padding?: Spacing;
  margin?: Spacing;
  responsive?: boolean;
  align?: AlignItems;
  justify?: JustifyContent;
}

// Utility types for responsive values
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Theme integration types
export interface GridTheme {
  breakpoints: Record<Breakpoint, string>;
  spacing: Record<Spacing, string>;
  maxWidths: Record<MaxWidth, string>;
} 