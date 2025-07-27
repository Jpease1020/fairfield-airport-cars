import React from 'react';
import { Container } from '@/components/ui';

// Heading Components
interface HeadingProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'muted' | 'inverse';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  marginTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const H1: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = '4xl',
  align = 'left',
  weight = 'bold',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'lg'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

const H2: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = '3xl',
  align = 'left',
  weight = 'bold',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'lg'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

const H3: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = '2xl',
  align = 'left',
  weight = 'semibold',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'md'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

const H4: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = 'xl',
  align = 'left',
  weight = 'semibold',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'md'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

const H5: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = 'lg',
  align = 'left',
  weight = 'medium',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'sm'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

const H6: React.FC<HeadingProps> = ({
  children,
  variant = 'default',
  size = 'md',
  align = 'left',
  weight = 'medium',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'sm'
}) => {
  const variantClass = {
    default: 'text-primary',
    brand: 'text-brand-primary',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-tight',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

// Text Components
interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'inverse';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  marginTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'base',
  align = 'left',
  weight = 'normal',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'md'
}) => {
  const variantClass = {
    body: 'text-primary',
    lead: 'text-primary text-lg',
    small: 'text-primary text-sm',
    muted: 'text-muted',
    inverse: 'text-inverse'
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight];

  const marginClass = {
    none: '',
    sm: 'm-sm',
    md: 'm-md',
    lg: 'm-lg',
    xl: 'm-xl'
  }[margin];

  const marginTopClass = {
    none: '',
    sm: 'mt-sm',
    md: 'mt-md',
    lg: 'mt-lg',
    xl: 'mt-xl'
  }[marginTop];

  const marginBottomClass = {
    none: '',
    sm: 'mb-sm',
    md: 'mb-md',
    lg: 'mb-lg',
    xl: 'mb-xl'
  }[marginBottom];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const classes = [
    variantClass,
    sizeClass,
    weightClass,
    marginClass,
    marginTopClass,
    marginBottomClass,
    alignClass,
    'leading-relaxed',
    'm-0'
  ].filter(Boolean).join(' ');

  return (
    <Container>
      {children}
    </Container>
  );
};

export { H1, H2, H3, H4, H5, H6, Text }; 