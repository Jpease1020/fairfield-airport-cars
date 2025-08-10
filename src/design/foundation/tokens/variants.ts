// Component Variants System
// Extracted from existing Button and Box components for reusability

import { colors, spacing, fontSize, fontWeight, shadows } from './tokens';

// Button Variants
export const buttonVariants = {
  primary: {
    backgroundColor: colors.primary[600],
    color: colors.text.white,
    '&:hover': {
      backgroundColor: colors.primary[700],
    },
  },
  secondary: {
    backgroundColor: colors.secondary[600],
    color: colors.text.white,
    '&:hover': {
      backgroundColor: colors.secondary[700],
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.primary[600],
    border: `1px solid ${colors.primary[600]}`,
    '&:hover': {
      backgroundColor: colors.primary[50],
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.text.primary,
    '&:hover': {
      backgroundColor: colors.gray[100],
    },
  },
  danger: {
    backgroundColor: colors.danger[600],
    color: colors.text.white,
    '&:hover': {
      backgroundColor: colors.danger[700],
    },
  },
  success: {
    backgroundColor: colors.success[600],
    color: colors.text.white,
    '&:hover': {
      backgroundColor: colors.success[700],
    },
  },
  warning: {
    backgroundColor: colors.warning[600],
    color: colors.text.white,
    '&:hover': {
      backgroundColor: colors.warning[700],
    },
  },
} as const;

// Button Sizes
export const buttonSizes = {
  xs: {
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSize.xs,
  },
  sm: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
  },
  md: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: fontSize.md,
  },
  lg: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: fontSize.lg,
  },
  xl: {
    padding: `${spacing.lg} ${spacing.xl}`,
    fontSize: fontSize.xl,
  },
} as const;

// Box Variants
export const cardVariants = {
  default: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
    boxShadow: shadows.sm,
  },
  outlined: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border.default}`,
    boxShadow: 'none',
  },
  elevated: {
    backgroundColor: colors.background.primary,
    border: 'none',
    boxShadow: shadows.lg,
  },
  light: {
    backgroundColor: colors.background.secondary,
    border: `1px solid ${colors.border.light}`,
    boxShadow: 'none',
  },
  dark: {
    backgroundColor: colors.gray[800],
    border: `1px solid ${colors.gray[700]}`,
    color: colors.text.white,
    boxShadow: shadows.md,
  },
  action: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
    boxShadow: shadows.sm,
    cursor: 'pointer',
    '&:hover': {
      boxShadow: shadows.md,
    },
  },
  info: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.primary[200]}`,
    boxShadow: shadows.sm,
  },
  help: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.warning[200]}`,
    boxShadow: shadows.sm,
  },
  stat: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
    boxShadow: shadows.sm,
    textAlign: 'center' as const,
  },
} as const;

// Box Sizes
export const cardSizes = {
  sm: {
    padding: spacing.md,
    fontSize: fontSize.sm,
  },
  md: {
    padding: spacing.lg,
    fontSize: fontSize.md,
  },
  lg: {
    padding: spacing.xl,
    fontSize: fontSize.lg,
  },
} as const;

// Text Variants
export const textVariants = {
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 1.5,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: 1.4,
  },
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 1.4,
  },
} as const;

// Badge Variants
export const badgeVariants = {
  primary: {
    backgroundColor: colors.primary[100],
    color: colors.primary[800],
    border: `1px solid ${colors.primary[200]}`,
  },
  secondary: {
    backgroundColor: colors.secondary[100],
    color: colors.secondary[800],
    border: `1px solid ${colors.secondary[200]}`,
  },
  success: {
    backgroundColor: colors.success[100],
    color: colors.success[800],
    border: `1px solid ${colors.success[200]}`,
  },
  warning: {
    backgroundColor: colors.warning[100],
    color: colors.warning[800],
    border: `1px solid ${colors.warning[200]}`,
  },
  danger: {
    backgroundColor: colors.danger[100],
    color: colors.danger[800],
    border: `1px solid ${colors.danger[200]}`,
  },
  info: {
    backgroundColor: colors.primary[50],
    color: colors.primary[700],
    border: `1px solid ${colors.primary[100]}`,
  },
} as const;

// Alert Variants
export const alertVariants = {
  info: {
    backgroundColor: colors.primary[50],
    color: colors.primary[800],
    border: `1px solid ${colors.primary[200]}`,
    iconColor: colors.primary[600],
  },
  success: {
    backgroundColor: colors.success[50],
    color: colors.success[800],
    border: `1px solid ${colors.success[200]}`,
    iconColor: colors.success[600],
  },
  warning: {
    backgroundColor: colors.warning[50],
    color: colors.warning[800],
    border: `1px solid ${colors.warning[200]}`,
    iconColor: colors.warning[600],
  },
  error: {
    backgroundColor: colors.danger[50],
    color: colors.danger[800],
    border: `1px solid ${colors.danger[200]}`,
    iconColor: colors.danger[600],
  },
} as const;

// Export all variants
export const variants = {
  button: buttonVariants,
  buttonSize: buttonSizes,
  card: cardVariants,
  cardSize: cardSizes,
  text: textVariants,
  badge: badgeVariants,
  alert: alertVariants,
} as const;

// Type exports
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type CardVariant = keyof typeof cardVariants;
export type CardSize = keyof typeof cardSizes;
export type TextVariant = keyof typeof textVariants;
export type BadgeVariant = keyof typeof badgeVariants;
export type AlertVariant = keyof typeof alertVariants; 