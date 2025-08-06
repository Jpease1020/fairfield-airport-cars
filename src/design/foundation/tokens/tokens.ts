// Design System Tokens - Centralized Design Variables
// This file contains all design tokens used throughout the application

// Color Palette - Using CSS variables only
export const colors = {
  // Primary Colors
  primary: {
    50: 'var(--primary-color-50)',
    100: 'var(--primary-color-100)',
    200: 'var(--primary-color-200)',
    300: 'var(--primary-color-300)',
    400: 'var(--primary-color-400)',
    500: 'var(--primary-color-500)',
    600: 'var(--primary-color)', // Main primary color
    700: 'var(--primary-color-700)',
    800: 'var(--primary-color-800)',
    900: 'var(--primary-color-900)',
  },
  
  // Secondary Colors
  secondary: {
    50: 'var(--secondary-color-50)',
    100: 'var(--secondary-color-100)',
    200: 'var(--secondary-color-200)',
    300: 'var(--secondary-color-300)',
    400: 'var(--secondary-color-400)',
    500: 'var(--secondary-color-500)',
    600: 'var(--secondary-color)', // Main secondary color
    700: 'var(--secondary-color-700)',
    800: 'var(--secondary-color-800)',
    900: 'var(--secondary-color-900)',
  },
  
  // Semantic Colors
  success: {
    50: 'var(--success-color-50)',
    100: 'var(--success-color-100)',
    200: 'var(--success-color-200)',
    300: 'var(--success-color-300)',
    400: 'var(--success-color-400)',
    500: 'var(--success-color-500)',
    600: 'var(--success-color)', // Main success color
    700: 'var(--success-color-700)',
    800: 'var(--success-color-800)',
    900: 'var(--success-color-900)',
  },
  
  warning: {
    50: 'var(--warning-color-50)',
    100: 'var(--warning-color-100)',
    200: 'var(--warning-color-200)',
    300: 'var(--warning-color-300)',
    400: 'var(--warning-color-400)',
    500: 'var(--warning-color-500)',
    600: 'var(--warning-color)', // Main warning color
    700: 'var(--warning-color-700)',
    800: 'var(--warning-color-800)',
    900: 'var(--warning-color-900)',
  },
  
  danger: {
    50: 'var(--danger-color-50)',
    100: 'var(--danger-color-100)',
    200: 'var(--danger-color-200)',
    300: 'var(--danger-color-300)',
    400: 'var(--danger-color-400)',
    500: 'var(--danger-color-500)',
    600: 'var(--danger-color)', // Main danger color
    700: 'var(--danger-color-700)',
    800: 'var(--danger-color-800)',
    900: 'var(--danger-color-900)',
  },
  
  // Neutral Colors
  gray: {
    50: 'var(--gray-50)',
    100: 'var(--gray-100)',
    200: 'var(--gray-200)',
    300: 'var(--gray-300)',
    400: 'var(--gray-400)',
    500: 'var(--gray-500)',
    600: 'var(--gray-600)',
    700: 'var(--gray-700)',
    800: 'var(--gray-800)',
    900: 'var(--gray-900)',
  },
  
  // Text Colors - Enhanced for better contrast
  text: {
    primary: 'var(--text-primary)', // Darker for better contrast
    secondary: 'var(--text-secondary)', // Darker for better contrast
    disabled: 'var(--text-light)',
    white: 'var(--text-white)',
    inverse: 'var(--text-inverse)',
    muted: 'var(--text-muted)',
    emphasis: 'var(--text-emphasis)', // For important text
  },
  
  // Border Colors
  border: {
    light: 'var(--border-light)',
    medium: 'var(--border-medium)',
    dark: 'var(--border-dark)',
    focus: 'var(--border-focus)',
    error: 'var(--border-error)',
    success: 'var(--border-success)',
    default: 'var(--border-medium)', // Alias for medium
  },
  
  // Background Colors
  background: {
    primary: 'var(--background-primary)',
    secondary: 'var(--background-secondary)',
    tertiary: 'var(--background-tertiary)',
    overlay: 'var(--background-overlay)',
    modal: 'var(--background-modal)',
    card: 'var(--background-card)',
    input: 'var(--background-input)',
    disabled: 'var(--background-disabled)',
  },
  
  // Interactive Colors
  interactive: {
    hover: 'var(--interactive-hover)',
    active: 'var(--interactive-active)',
    focus: 'var(--interactive-focus)',
    disabled: 'var(--interactive-disabled)',
  },
  
  // Status Colors
  status: {
    info: 'var(--status-info)',
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    error: 'var(--status-error)',
  },
  
  // Shadow Colors
  shadow: {
    light: 'var(--shadow-light)',
    medium: 'var(--shadow-medium)',
    dark: 'var(--shadow-dark)',
    focus: 'var(--shadow-focus)',
  },
};

// Spacing Scale
export const spacing = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  xxl: 'var(--spacing-xxl)',
  '2xl': 'var(--spacing-2xl)', // Alias for xxl
};

// Margin Scale
export const margins = {
  xs: 'var(--margin-xs)',
  sm: 'var(--margin-sm)',
  md: 'var(--margin-md)',
  lg: 'var(--margin-lg)',
  xl: 'var(--margin-xl)',
  xxl: 'var(--margin-xxl)',
};

// Typography
export const fontFamily = {
  sans: 'var(--font-family-sans)',
  serif: 'var(--font-family-serif)',
  mono: 'var(--font-family-mono)',
};

export const fontSize = {
  xs: 'var(--font-size-xs)',
  sm: 'var(--font-size-sm)',
  base: 'var(--font-size-base)',
  md: 'var(--font-size-md)', // Added missing md
  lg: 'var(--font-size-lg)',
  xl: 'var(--font-size-xl)',
  '2xl': 'var(--font-size-2xl)',
  '3xl': 'var(--font-size-3xl)',
  '4xl': 'var(--font-size-4xl)',
  '5xl': 'var(--font-size-5xl)',
  '6xl': 'var(--font-size-6xl)', // Added missing 6xl
};

export const fontWeight = {
  light: 'var(--font-weight-light)',
  normal: 'var(--font-weight-normal)',
  medium: 'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold: 'var(--font-weight-bold)',
  extrabold: 'var(--font-weight-extrabold)',
};

// Border Radius
export const borderRadius = {
  none: 'var(--border-radius-none)',
  sm: 'var(--border-radius-sm)',
  base: 'var(--border-radius-base)',
  md: 'var(--border-radius-md)',
  lg: 'var(--border-radius-lg)',
  xl: 'var(--border-radius-xl)',
  full: 'var(--border-radius-full)',
  default: 'var(--border-radius-base)', // Alias for base
  pill: 'var(--border-radius-pill)', // Added missing pill
};

// Shadows
export const shadows = {
  none: 'var(--shadow-none)',
  sm: 'var(--shadow-sm)',
  base: 'var(--shadow-base)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  focus: 'var(--shadow-focus)', // Added missing focus
  error: 'var(--shadow-error)', // Added missing error
};

// Transitions
export const transitions = {
  fast: 'var(--transition-fast)',
  base: 'var(--transition-base)',
  slow: 'var(--transition-slow)',
  default: 'var(--transition-base)', // Alias for base
};

// Z-Index Scale
export const zIndex = {
  hide: 'var(--z-index-hide)',
  base: 'var(--z-index-base)',
  dropdown: 'var(--z-index-dropdown)',
  sticky: 'var(--z-index-sticky)',
  overlay: 'var(--z-index-overlay)',
  modal: 'var(--z-index-modal)',
  popover: 'var(--z-index-popover)',
  tooltip: 'var(--z-index-tooltip)',
  toast: 'var(--z-index-toast)',
};

// Breakpoints
export const breakpoints = {
  xs: 'var(--breakpoint-xs)',
  sm: 'var(--breakpoint-sm)',
  md: 'var(--breakpoint-md)',
  lg: 'var(--breakpoint-lg)',
  xl: 'var(--breakpoint-xl)',
  '2xl': 'var(--breakpoint-2xl)',
};

// Complete Design Tokens Object
export const designTokens = {
  colors,
  spacing,
  margins,
  fontFamily,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
};

// Type exports for TypeScript
export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
export type MarginToken = typeof margins;
export type FontFamilyToken = typeof fontFamily;
export type FontSizeToken = typeof fontSize;
export type FontWeightToken = typeof fontWeight;
export type BorderRadiusToken = typeof borderRadius;
export type ShadowToken = typeof shadows;
export type TransitionToken = typeof transitions;
export type ZIndexToken = typeof zIndex;
export type BreakpointToken = typeof breakpoints;
export type DesignTokens = typeof designTokens; 