import React from 'react';

// Shared Layout Types - Common types used across grid and content components

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

// Utility types for responsive values
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Base component props
export interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: keyof React.JSX.IntrinsicElements;
  'data-testid'?: string;
} 