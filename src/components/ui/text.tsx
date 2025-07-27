import React from 'react';
import { cn } from '@/lib/utils/utils';

// Heading Components - Clean Reusable Components (No className! No inline styles!)
export interface HeadingProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  id?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
}

export const H1: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '4xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h1'
}) => {
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-purple-600'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <Component 
      id={id}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align]
      )}
    >
      {children}
    </Component>
  );
};

export const H2: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '3xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h2'
}) => {
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-purple-600'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <Component 
      id={id}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align]
      )}
    >
      {children}
    </Component>
  );
};

export const H3: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '2xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h3'
}) => {
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-purple-600'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <Component 
      id={id}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align]
      )}
    >
      {children}
    </Component>
  );
};

export const H4: React.FC<HeadingProps> = ({ children, id }) => {
  return (
    <h4 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-xl)', fontWeight: '600' }}>
      {children}
    </h4>
  );
};

export const H5: React.FC<HeadingProps> = ({ children, id }) => {
  return (
    <h5 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
      {children}
    </h5>
  );
};

export const H6: React.FC<HeadingProps> = ({ children, id }) => {
  return (
    <h6 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)', fontWeight: '600' }}>
      {children}
    </h6>
  );
};

// Text Components - Clean Reusable Components (No className! No inline styles!)
export interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  as?: 'p' | 'span' | 'div' | 'article' | 'blockquote';
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  align = 'left',
  color = 'default',
  as: Component = 'p'
}) => {
  const variantClasses = {
    body: 'leading-relaxed',
    lead: 'text-lg leading-relaxed font-medium',
    small: 'text-sm',
    muted: 'text-gray-500',
    caption: 'text-xs text-gray-400',
    overline: 'text-xs uppercase tracking-wider'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-500'
  };

  return (
    <Component
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align],
        colorClasses[color]
      )}
    >
      {children}
    </Component>
  );
};

// Span Component Interface - Clean Reusable Component (No className!)
export interface SpanProps {
  children: React.ReactNode;
  variant?: 'default' | 'bold' | 'italic' | 'code' | 'mark' | 'link' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Span: React.FC<SpanProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  color = 'default',
  weight = 'normal'
}) => {
  const variantClasses = {
    default: '',
    bold: 'font-bold',
    italic: 'italic',
    code: 'font-mono bg-gray-100 px-1 py-0.5 rounded text-sm',
    mark: 'bg-yellow-200 px-1',
    link: 'text-blue-600 hover:text-blue-800 underline',
    badge: 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-500'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <span
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        colorClasses[color],
        weightClasses[weight]
      )}
    >
      {children}
    </span>
  );
};

// Paragraph Component - CASCADE EFFECT COMPLETE!
export interface ParagraphProps {
  children: React.ReactNode;
  variant?: 'body' | 'lead' | 'small' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  variant = 'body',
  size = 'md',
  align = 'left',
  color = 'default',
  weight = 'normal'
}) => {
  const variantClasses = {
    body: 'leading-relaxed',
    lead: 'text-lg leading-relaxed font-medium',
    small: 'text-sm',
    muted: 'text-gray-500 text-sm'
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-500'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <p className={cn(
      variantClasses[variant],
      sizeClasses[size],
      alignClasses[align],
      colorClasses[color],
      weightClasses[weight]
    )}>
      {children}
    </p>
  );
};

// Lead component DELETED - use Text component with variant="lead" instead!

// Link Component
export interface LinkProps {
  children: React.ReactNode;
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  variant?: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size?: 'sm' | 'base' | 'lg';
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  target = '_self',
  rel,
  variant = 'primary',
  size = 'base',
  external = false,
}) => {
  const classes = [
    'link',
    `link-${variant}`,
    `link-size-${size}`,
    external ? 'link-external' : '',
  ].filter(Boolean).join(' ');

  const linkRel = external ? 'noopener noreferrer' : rel;

  return (
    <a 
      href={href}
      target={target}
      rel={linkRel}
      className={classes}
    >
      {children}
    </a>
  );
};

// Container component DELETED - BROKEN RECURSIVE INFINITE LOOP! 
// Use bulletproof Container from @/components/ui instead!

// Section component DELETED - Use bulletproof Section from @/components/ui instead! 