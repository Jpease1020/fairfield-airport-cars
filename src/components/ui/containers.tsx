import React from 'react';
import { cn } from '@/lib/utils/utils';

// Base Container Component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    maxWidth = 'xl', 
    padding = 'md', 
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

// Box Component
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md', 
    rounded = 'md',
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-bg-primary',
      elevated: 'bg-bg-primary shadow-lg',
      outlined: 'bg-bg-primary border border-border-primary',
      filled: 'bg-bg-secondary'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    };

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Box.displayName = 'Box';

// Section Component
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'alternate' | 'brand' | 'muted';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'lg', 
    container = true, 
    maxWidth = 'xl',
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-bg-primary',
      alternate: 'bg-bg-secondary',
      brand: 'bg-brand-primary text-text-inverse',
      muted: 'bg-bg-muted'
    };

    const paddingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    const content = container ? (
      <Container maxWidth={maxWidth} padding="none">
        {children}
      </Container>
    ) : children;

    return (
      <section
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          className
        )}
        {...props}
      >
        {content}
      </section>
    );
  }
);
Section.displayName = 'Section';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-bg-primary border border-border-primary',
      elevated: 'bg-bg-primary shadow-lg',
      outlined: 'bg-bg-primary border-2 border-border-primary',
      filled: 'bg-bg-secondary'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          hover && 'hover:shadow-md hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Stack Component for consistent spacing
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = 'vertical', 
    spacing = 'md', 
    align = 'start', 
    justify = 'start',
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const directionClasses = {
      horizontal: 'flex flex-row',
      vertical: 'flex flex-col'
    };

    const spacingClasses = {
      none: '',
      xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
      sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
      md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
      lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
      xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8'
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <div
        ref={ref}
        className={cn(
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = 'Stack';

// Grid Component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 1, 
    gap = 'md', 
    responsive = true,
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    children, 
    ...props 
  }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
      4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
      5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-5',
      6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : 'grid-cols-6',
      12: responsive ? 'grid-cols-1 md:grid-cols-6 lg:grid-cols-12' : 'grid-cols-12'
    };

    const gapClasses = {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';

// Layout Components for Page-Level Spacing
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ 
    className, 
    spacing = 'md', 
    container = true, 
    maxWidth = 'xl',
    children, 
    ...props 
  }, ref) => {
    const spacingClasses = {
      none: '',
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
      '2xl': 'space-y-12'
    };

    const content = container ? (
      <Container maxWidth={maxWidth} padding="none">
        {children}
      </Container>
    ) : children;

    return (
      <div
        ref={ref}
        className={cn(
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);
Layout.displayName = 'Layout';

// Spacer Component for explicit spacing
interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 'md', axis = 'vertical', ...props }, ref) => {
    const sizeClasses = {
      xs: axis === 'vertical' ? 'h-1' : 'w-1',
      sm: axis === 'vertical' ? 'h-2' : 'w-2',
      md: axis === 'vertical' ? 'h-4' : 'w-4',
      lg: axis === 'vertical' ? 'h-6' : 'w-6',
      xl: axis === 'vertical' ? 'h-8' : 'w-8',
      '2xl': axis === 'vertical' ? 'h-12' : 'w-12'
    };

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Spacer.displayName = 'Spacer';

export {
  Container,
  Box,
  Section,
  Card,
  Stack,
  Grid,
  Layout,
  Spacer
}; 