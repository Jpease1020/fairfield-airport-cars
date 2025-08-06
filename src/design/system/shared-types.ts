// ===== SHARED DESIGN SYSTEM TYPES =====
// This file contains all shared types used across multiple components
// Individual components should define their own specific interfaces

import React from 'react';

// ===== FOUNDATION TYPES =====

// Spacing Scale
export type SpacingScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Color Variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'default';

// Text Variants
export type TextVariant = 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';

// Text Sizes
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

// Text Alignment
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Font Weights
export type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';

// Button Sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Container Variants (Enhanced from temp-design-library)
export type ContainerVariant = 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated' | 'feature' | 'hero';

// Container Max Widths
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Box/Card Variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

// Section Variants
export type SectionVariant = 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';

// Grid System Types (Enhanced from temp-design-library)
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 12;

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

// Grid gap types
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Stack Direction
export type StackDirection = 'horizontal' | 'vertical';

// Stack Alignment
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

// Stack Justify
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// Stack Wrap
export type StackWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

// Border Radius
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// HTML Elements
export type HTMLElement = 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'main' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// ===== COMPONENT BASE TYPES =====

// Base component props that all components can extend
export interface BaseComponentProps {
  children?: React.ReactNode;
  id?: string;
  className?: string;
  'data-testid'?: string;
}

// Base layout props for layout components
export interface BaseLayoutProps extends BaseComponentProps {
  as?: HTMLElement;
  padding?: SpacingScale;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  marginLeft?: SpacingScale;
  marginRight?: SpacingScale;
}

// ===== RESPONSIVE TYPES =====

// Responsive value type for responsive design
export type ResponsiveValue<T> = T | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', T>>;

// Breakpoint type
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// ===== LAYOUT TYPES =====

// Flex direction types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

// Flex wrap types
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

// Alignment types
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

// Spacing types (alias for SpacingScale)
export type Spacing = SpacingScale;

// ===== ENHANCED COMPONENT PROPS (From temp-design-library) =====

export interface ContainerProps extends BaseComponentProps {
  variant?: ContainerVariant;
  maxWidth?: MaxWidth;
  padding?: SpacingScale;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  spacing?: SpacingScale;
  as?: HTMLElement;
}

export interface GridProps extends BaseComponentProps {
  cols?: GridCols;
  gap?: GridGap;
  responsive?: boolean;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  as?: HTMLElement;
}

export interface GridItemProps extends BaseComponentProps {
  span?: GridSpan;
}

export interface StackProps extends BaseComponentProps {
  direction?: StackDirection;
  spacing?: SpacingScale;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: StackWrap;
  gap?: SpacingScale;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  fullWidth?: boolean;
  as?: HTMLElement;
}

export interface BoxProps extends BaseComponentProps {
  variant?: CardVariant;
  padding?: SpacingScale;
  hover?: boolean;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  as?: HTMLElement;
}

export interface LayoutSectionProps extends BaseComponentProps {
  variant?: SectionVariant;
  padding?: SpacingScale;
  container?: boolean;
  maxWidth?: MaxWidth;
  margin?: SpacingScale;
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  fullWidth?: boolean;
  as?: HTMLElement;
}

export interface TextProps extends BaseComponentProps {
  variant?: TextVariant;
  size?: TextSize;
  align?: TextAlign;
  color?: ColorVariant;
  weight?: FontWeight;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Row component props
export interface RowProps extends BaseLayoutProps {
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
export interface ColProps extends BaseLayoutProps {
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

// ===== VALIDATION FUNCTIONS =====

export const isValidSpacing = (value: string): value is SpacingScale => {
  return ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value);
};

export const isValidColorVariant = (value: string): value is ColorVariant => {
  return ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'muted'].includes(value);
};

export const isValidMaxWidth = (value: string): value is MaxWidth => {
  return ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value);
};

export const isValidGridCols = (value: number): value is GridCols => {
  return [1, 2, 3, 4, 5, 6, 12].includes(value);
};

export const isValidButtonVariant = (value: string): value is ButtonVariant => {
  return ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning'].includes(value);
};

export const isValidButtonSize = (value: string): value is ButtonSize => {
  return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value);
};

// ===== UTILITY TYPES =====

// Theme token type
export type ThemeToken = string | number;

// Action type for interactive elements
export type ActionType = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: string;
};

// Status type for status components
export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'loading';

// Loading state type
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'; 