import React from 'react';
import { cn } from '@/lib/utils';

// Heading Components
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        'text-4xl md:text-6xl font-bold text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
);
H1.displayName = 'H1';

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'text-3xl md:text-4xl font-bold text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
);
H2.displayName = 'H2';

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl md:text-3xl font-semibold text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
H3.displayName = 'H3';

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        'text-xl md:text-2xl font-semibold text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h4>
  )
);
H4.displayName = 'H4';

const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        'text-lg md:text-xl font-medium text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h5>
  )
);
H5.displayName = 'H5';

const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h6
      ref={ref}
      className={cn(
        'text-base md:text-lg font-medium text-text-primary leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </h6>
  )
);
H6.displayName = 'H6';

// Text Components
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'inverse';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, children, variant = 'body', size = 'base', ...props }, ref) => {
    const variantClasses = {
      body: 'text-text-primary',
      lead: 'text-lg text-text-primary font-medium',
      small: 'text-sm text-text-secondary',
      muted: 'text-text-muted',
      inverse: 'text-text-inverse'
    };

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    return (
      <p
        ref={ref}
        className={cn(
          'leading-relaxed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
Text.displayName = 'Text';

// Specialized Text Components
const Lead = React.forwardRef<HTMLParagraphElement, Omit<TextProps, 'variant'>>(
  (props, ref) => <Text ref={ref} variant="lead" {...props} />
);
Lead.displayName = 'Lead';

const Small = React.forwardRef<HTMLParagraphElement, Omit<TextProps, 'variant'>>(
  (props, ref) => <Text ref={ref} variant="small" {...props} />
);
Small.displayName = 'Small';

const Muted = React.forwardRef<HTMLParagraphElement, Omit<TextProps, 'variant'>>(
  (props, ref) => <Text ref={ref} variant="muted" {...props} />
);
Muted.displayName = 'Muted';

const Inverse = React.forwardRef<HTMLParagraphElement, Omit<TextProps, 'variant'>>(
  (props, ref) => <Text ref={ref} variant="inverse" {...props} />
);
Inverse.displayName = 'Inverse';

export {
  H1, H2, H3, H4, H5, H6,
  Text, Lead, Small, Muted, Inverse
}; 