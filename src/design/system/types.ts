// Design System Type Definitions
// This file provides strict typing for all design system components

// Spacing Scale
export type SpacingScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Color Variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted';

// Text Variants
export type TextVariant = 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';

// Text Sizes
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Text Alignment
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Button Sizes
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Container Variants
export type ContainerVariant = 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';

// Container Max Widths
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// ContentBox Variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

// Section Variants
export type SectionVariant = 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';

// Grid Columns
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

// Grid Item Span
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 12;

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
export type HTMLElement = 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'main';

// Component Props Interfaces

export interface BaseComponentProps {
  children?: React.ReactNode;
  id?: string;
}

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
  gap?: SpacingScale;
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

export interface ContentBoxProps extends BaseComponentProps {
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
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
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

// Utility Types
export type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};

export type ThemeToken = string | number;

// Validation Functions
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