import { getCMSColors, defaultColors } from './cms-integrated-colors';
import { getCMSTypography, defaultTypography } from './cms-integrated-typography';
import { getCMSSpacing, defaultSpacing } from './cms-integrated-spacing';

// CMS-Integrated Design System
export { getCMSColors, defaultColors } from './cms-integrated-colors';
export { getCMSTypography, defaultTypography } from './cms-integrated-typography';
export { getCMSSpacing, defaultSpacing } from './cms-integrated-spacing';

// Design system utilities
export const getDesignTokens = () => ({
  colors: getCMSColors(),
  typography: getCMSTypography(),
  spacing: getCMSSpacing(),
});

// CSS custom properties generator
export const generateCSSVariables = () => {
  const colors = getCMSColors();
  const typography = getCMSTypography();
  const spacing = getCMSSpacing();

  return {
    // Brand colors
    '--brand-primary': colors.brand.primary,
    '--brand-primary-hover': colors.brand.primaryHover,
    '--brand-secondary': colors.brand.secondary,
    '--brand-secondary-hover': colors.brand.secondaryHover,
    
    // Semantic colors
    '--success-base': colors.success.base,
    '--success-hover': colors.success.hover,
    '--success-light': colors.success.light,
    '--success-dark': colors.success.dark,
    '--warning-base': colors.warning.base,
    '--warning-hover': colors.warning.hover,
    '--warning-light': colors.warning.light,
    '--warning-dark': colors.warning.dark,
    '--error-base': colors.error.base,
    '--error-hover': colors.error.hover,
    '--error-light': colors.error.light,
    '--error-dark': colors.error.dark,
    '--info-base': colors.info.base,
    '--info-hover': colors.info.hover,
    '--info-light': colors.info.light,
    '--info-dark': colors.info.dark,
    
    // Text colors
    '--text-primary': colors.text.primary,
    '--text-secondary': colors.text.secondary,
    '--text-muted': colors.text.muted,
    '--text-inverse': colors.text.inverse,
    '--text-success': colors.text.success,
    '--text-warning': colors.text.warning,
    '--text-error': colors.text.error,
    '--text-info': colors.text.info,
    
    // Background colors
    '--bg-primary': colors.background.primary,
    '--bg-secondary': colors.background.secondary,
    '--bg-muted': colors.background.muted,
    '--bg-inverse': colors.background.inverse,
    '--bg-success': colors.background.success,
    '--bg-warning': colors.background.warning,
    '--bg-error': colors.background.error,
    '--bg-info': colors.background.info,
    
    // Border colors
    '--border-primary': colors.border.primary,
    '--border-secondary': colors.border.secondary,
    '--border-success': colors.border.success,
    '--border-warning': colors.border.warning,
    '--border-error': colors.border.error,
    '--border-info': colors.border.info,
    
    // Typography
    '--font-family-primary': typography.fontFamily.primary,
    '--font-family-heading': typography.fontFamily.heading,
    '--font-family-mono': typography.fontFamily.mono,
    
    // Spacing
    '--spacing-xs': spacing.base.xs,
    '--spacing-sm': spacing.base.sm,
    '--spacing-md': spacing.base.md,
    '--spacing-lg': spacing.base.lg,
    '--spacing-xl': spacing.base.xl,
    '--spacing-2xl': spacing.base['2xl'],
    '--spacing-3xl': spacing.base['3xl'],
    '--spacing-4xl': spacing.base['4xl'],
    '--spacing-5xl': spacing.base['5xl'],
  } as React.CSSProperties;
};

// Utility function to apply design tokens to a component
export const applyDesignTokens = (componentProps: any = {}) => {
  const cssVars = generateCSSVariables();
  
  return {
    ...componentProps,
    style: {
      ...cssVars,
      ...componentProps.style,
    },
  };
}; 